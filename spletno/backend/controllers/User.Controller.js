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

      // Create Auth0 user
      const auth0User = await this.auth0.createUser({
        connection: 'Username-Password-Authentication',
        email,
        password,
        given_name: name,
        family_name: lastname,
        username: username,
        email_verified: false,
        verify_email: true
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

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Get Auth0 tokens
      const tokenResponse = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          grant_type: 'password',
          username: email,
          password,
          audience: process.env.AUTH0_AUDIENCE,
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          scope: 'openid profile email'
        }
      );

      // Get user info
      const userInfo = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`
          }
        }
      );

      // Find or create in MongoDB
      const user = await User.findOrCreate({
        sub: userInfo.data.sub,
        email: userInfo.data.email,
        name: userInfo.data.given_name || userInfo.data.name.split(' ')[0],
        lastname: userInfo.data.family_name || userInfo.data.name.split(' ')[1] || '',
        nickname: userInfo.data.nickname,
        email_verified: userInfo.data.email_verified
      });

      res.json({
        accessToken: tokenResponse.data.access_token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          username: user.username
        }
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
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