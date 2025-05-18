import mongoose from "mongoose";
import { ROLES } from '../utils/roles.js';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  lastname: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    unique: true
  },
  roles: {
    type: [String],
    enum: Object.values(ROLES),
    default: [ROLES.USER]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

userSchema.methods.hasPermission = function(permission) {
  return this.roles.some(role => 
    ROLE_PERMISSIONS[role]?.includes(permission)
  );
};

userSchema.statics.findOrCreate = async function(auth0User) {
  let user = await this.findOne({ auth0Id: auth0User.sub });
  
  if (!user) {
    user = new this({
      auth0Id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.given_name || '',
      lastname: auth0User.family_name || '',
      username: auth0User.nickname || auth0User.email.split('@')[0],
      roles: auth0User[`${process.env.AUTH0_NAMESPACE}roles`] || [ROLES.USER]
    });
    await user.save();
  }

  return user;
};

const User = mongoose.model('users', userSchema, 'users');
export default User;