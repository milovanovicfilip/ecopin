import User from '../models/User.Model.js';
import { ManagementClient } from 'auth0';
import axios from 'axios';
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

export default class UserController {
  constructor() {
    this.auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'read:users update:users'
    });

    this.checkJwt = expressjwt({
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

  }

  // Register new user
  async register(req, res) {
    try {
      const { email, password, name, lastname, username } = req.body;

        const auth0User = await this.auth0.createUser({
            connection: 'Username-Password-Authentication',
            email,
            password,
            username, // ← Critical: Auth0 needs this to allow username logins
            given_name: name,
            family_name: lastname,
        });

      // Create MongoDB user
      const user = await User.create({
        auth0Id: auth0User.user_id,
        email,
        name,
        lastname,
        username,
        metadata: {
          auth0Provider: auth0User.user_id.split('|')[0],
          emailVerified: false
        }
      });

      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        username: user.username
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
  try {
    const { email, password, username } = req.body;
    const origin = req.headers.origin || req.headers.referer || 'http://localhost:3000';

    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    // Auth0 token request
    const authResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        username: email || username,
        password: password,
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email',
        realm: 'Username-Password-Authentication'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin,
          'Referer': origin
        }
      }
    );

    // Get user info from Auth0
    const userInfo = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${authResponse.data.access_token}`
        }
      }
    );

    // Find and update user in MongoDB
    const user = await User.findOne(
      { auth0Id: userInfo.data.sub });

    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    res.json({
      accessToken: authResponse.data.access_token,
      idToken: authResponse.data.id_token,
      expiresIn: authResponse.data.expires_in,
    });

  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.response?.data?.error_description || 'Login failed',
      details: error.response?.data
    });
  }
}

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findOne({ auth0Id: req.user.sub });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Add points to user
    async addPoints(req, res) {
    try {
        const user = await User.findOne({ auth0Id: req.user.sub });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { points } = req.body;
        if (typeof points !== 'number') {
        return res.status(400).json({ error: 'Points must be a number' });
        }

        await user.addPoints(points);

        res.json({ message: 'Points added successfully', totalPoints: user.points });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }

}