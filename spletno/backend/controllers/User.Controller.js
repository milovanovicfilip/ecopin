import User from '../models/User.Model.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import { throws } from 'assert';
import { error } from 'console';
import ReportModel from '../models/Report.Model.js';
import { OAuth2Client } from 'google-auth-library';


dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


async function getUniqueUsername(base) {
  let username = base;
  let suffix = 1;
  while (await User.findOne({ username })) {
    username = `${base}${suffix++}`;
  }
  return username;
}

export default class UserController {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.tokenExpiration = process.env.JWT_EXPIRATION || '1h';
  }

  async googleAuth(req, res) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ error: 'No credential provided' });
      }
      
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { email, given_name, family_name, picture } = payload;

      let username = email.split('@')[0];
      username = await getUniqueUsername(username);

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name: given_name,
          lastname: family_name,
          profilePicture: picture,
          username,
          role: 'USER'
        });
      }

      const token = this.generateToken(user);
      const safeUser = this.getSafeUserData(user);

      res.json({ token, user: safeUser });
    } catch (err) {
      console.error('Google Auth failed', err);
      res.status(401).json({ error: 'Google authentication failed' });
    }
  }

  async getAll(req, res) {
    try {
      const users = await User.find().select('-password -refreshToken').populate('reports');
      res.status(200).json(users);
    } catch (err) {
      console.error("Error in user.getAll");
      res.status(500).json({ error: err.message });
    }
  }

  async register(req, res) {
    try {
      const { email, password, name, lastname, username} = req.body;
      const existingUser = await User.findOne({ $or: [{email}, {username}]});
      if (existingUser) {
        return res.status(400).json({
          error: existingUser.email === email
          ? 'Email already in use' 
            : 'Username already taken'
        });
      }

      const avatarName = `${name}+${lastname}`;
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&size=256&background=random&color=fff&rounded=true`;

      const user = new User({
        email,
        password,
        name,
        lastname,
        username,
        profilePicture: avatarUrl,
        points: 0,
        reports: [],
        rewards: [],
        seasonRewards: [],
        role: 'USER'
      });

      await user.save();

      const token = this.generateToken(user);
      const userResponse = this.getSafeUserData(user);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse
      });

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { username, email, password} = req.body;
      if ((!username && !email) || !password) {
        res.status(400).json({ error: "Email/Username or password not provided." });
      }

      const user = await User.findOne({
        $or: [
          { email: email || '' }, 
          { username: username || '' }
        ]
      }).select("+password");

      if (!user) {
        res.status(401).json({ error: "Invalid credentials. "});
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials. "});
      }

      const token = this.generateToken(user);

      const userResponse = this.getSafeUserData(user);

      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });

    } catch(err) {
      console.error('Login error:', error.message);
      res.status(500).json({
        error: 'Login failed',
        details: error.message
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password -refreshToken').populate('rewards');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addPoints(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { points } = req.body;
      if (typeof points !== 'number' || points < 0) {
        return res.status(400).json({ error: 'Points must be a positive number' });
      }

      const newPoints = await user.addPoints(points);

      return res.json({ 
        message: 'Points added successfully', 
        totalPoints: newPoints 
      });
    }  catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  async getByUsername(req, res) {
    try {
      const username = req.query.username;

      if (!username || username=="") {
        var users = await User.find().select('-password -refreshToken');
        res.status(200).json(users);
      }

      const data = await User.find({
        username: { $regex: username, $options: 'i'}
      });

      return res.status(200).json(data);
    } catch (err) {
      console.error("Error in getByUsername:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  async getMyReports(req, res) {
    try {
      const user = req.user;

    
      const data = await ReportModel.find({
        reportedBy: user._id
      });

      return res.status(200).json(data);
    } catch (err) {
      console.error("Error in getMyReports:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role 
      },
      this.jwtSecret,
      { expiresIn: this.tokenExpiration }
    );
  }

  getSafeUserData(user) {
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      profilePicture: user.profilePicture,
      points: user.points,
      reports: user.reports,
      rewards: user.rewards,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}