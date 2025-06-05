import User from '../models/User.Model.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import { throws } from 'assert';
import { error } from 'console';

dotenv.config();

export default class UserController {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.tokenExpiration = process.env.JWT_EXPIRATION || '1h';
  }

  authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      req.user = decoded;
      next();
    } catch(error) {
      res.status(400).json({ error: "Invalid token." });
    }
  };

  async getAll(req, res) {
    try {
      const users = await User.find().select('-password -refreshToken');
      res.status(200). json(users);
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

      const user = await User.findOne({ $or: [{email}, {username}]}).select("+password");

      if (!user) {
        res.status(401).json({ error: "Invalid credentials. "});
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        res.status(401).json({ error: "Invalid credentials. "});
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
      const user = await User.findById(req.user.id).select('-password -refreshToken');
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

      res.json({ 
        message: 'Points added successfully', 
        totalPoints: newPoints 
      });
    }  catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
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