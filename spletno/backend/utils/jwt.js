import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from './roles.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const checkJwt = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - No user information found' 
      });
    }

    const namespace = process.env.AUTH0_NAMESPACE;
    const userRoles = req.user[`${namespace}roles`] || [ROLES.USER];
    
    const hasPermission = userRoles.some(role => 
      ROLE_PERMISSIONS[role]?.includes(requiredPermission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden - Insufficient permissions' 
      });
    }
    
    next();
  };
};

export const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - No user information found' 
      });
    }

    const namespace = process.env.AUTH0_NAMESPACE;
    const userRoles = req.user[`${namespace}roles`] || [ROLES.USER];
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden - Insufficient role privileges' 
      });
    }
    
    next();
  };
};

export const checkOwnership = (model, paramName = 'id', ownerField = 'reportedBy') => {
  return async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid resource ID' 
        });
      }

      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false,
          message: 'Resource not found' 
        });
      }
      
      // Check if the requesting user owns the resource or is admin/moderator
      const namespace = process.env.AUTH0_NAMESPACE;
      const userRoles = req.user[`${namespace}roles`] || [ROLES.USER];
      
      const isOwner = resource[ownerField] && 
        resource[ownerField].toString() === req.user.sub.split('|')[1];
      const isAdmin = userRoles.includes(ROLES.ADMIN);
      const isModerator = userRoles.includes(ROLES.MODERATOR);
      
      if (!isOwner && !isAdmin && !isModerator) {
        return res.status(403).json({ 
          success: false,
          message: 'Forbidden - Not resource owner or privileged user' 
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  };
};