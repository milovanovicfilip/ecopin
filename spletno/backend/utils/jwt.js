import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from './roles.js';
import dotenv from 'dotenv';
import UserModel from '../models/User.Model.js';
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
  algorithms: ['RS256'],
  requestProperty: 'auth' // Shrani podatke v req.auth
});

export const getUserFromDb = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - No authentication provided' 
      });
    }

    const user = await UserModel.findOne({ auth0Id: req.auth.sub });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found in database' 
      });
    }

    req.user = user; // Shrani uporabnika iz baze v req.user
    next();
  } catch (error) {
    console.error('Error fetching user from DB:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Unauthorized - No user information found' 
        });
      }

      // Preveri dovoljenja iz baze ali JWT žetona
      const userRoles = req.user.roles || 
                      (req.auth[`${process.env.AUTH0_NAMESPACE}roles`] || [ROLES.USER]);
      
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
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  };
};

export const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Unauthorized - No user information found' 
        });
      }

      const userRoles = req.user.roles || 
                       (req.auth[`${process.env.AUTH0_NAMESPACE}roles`] || [ROLES.USER]);
      
      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({ 
          success: false,
          message: 'Forbidden - Insufficient role privileges' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
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
      
      // Preveri lastništvo ali administratorske pravice
      const isOwner = resource[ownerField] && 
        resource[ownerField].toString() === req.user._id.toString();
      const isAdmin = req.user.roles.includes(ROLES.ADMIN);
      const isModerator = req.user.roles.includes(ROLES.MODERATOR);
      
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