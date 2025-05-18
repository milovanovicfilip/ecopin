import mongoose from "mongoose";
import { ROLES, ROLE_PERMISSIONS } from '../utils/roles.js';

const Schema = mongoose.Schema;

const metadataSchema = new Schema({
  auth0Provider: String,
  emailVerified: Boolean,
});

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
    trim: true,
    required: true
  },
  lastname: {
    type: String,
    trim: true,
    required: true
  },
  username: {
    type: String,
    trim: true,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  roles: {
    type: [String],
    enum: Object.values(ROLES),
    default: [ROLES.USER]
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'team'
  }],
  events: [{
    type: Schema.Types.ObjectId,
    ref: 'event'
  }],
  metadata: metadataSchema
});

userSchema.methods.hasPermission = function(permission) {
  return this.roles.some(role => 
    ROLE_PERMISSIONS[role]?.includes(permission)
  );
};

userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

userSchema.statics.findOrCreate = async function(auth0Payload) {
  const user = await this.findOne({ auth0Id: auth0Payload.sub });

  const username = auth0Payload.nickname || 
                 (auth0Payload.email ? auth0Payload.email.split('@')[0] : 'unknown');
  
  const namespace = process.env.AUTH0_NAMESPACE;
  const roles = auth0Payload[`${namespace}roles`] || [ROLES.USER];

  if (user) {
    user.name = auth0Payload.name || user.name;
    user.username = username;
    user.roles = roles;
    user.metadata.emailVerified = auth0Payload.email_verified || user.metadata.emailVerified;
    return user.save();
  }

  return this.create({
    auth0Id: auth0Payload.sub,
    email: auth0Payload.email,
    name: auth0Payload.name || '',
    lastname: auth0Payload.family_name || '',
    username: username,
    roles: roles,
    metadata: {
      auth0Provider: auth0Payload.sub.split('|')[0],
      emailVerified: auth0Payload.email_verified || false
    }
  });
};

const User = mongoose.model('users', userSchema);
export default User;
