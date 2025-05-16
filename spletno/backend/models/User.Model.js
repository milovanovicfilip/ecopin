import mongoose from "mongoose";
var Schema = mongoose.Schema;


const metadataSchema = new Schema({
    'auth0Provider': String,
    'emailVerified': Boolean,
});

var userSchema = new Schema({
    'auth0Id': {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    'email': {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    'name': {
        type: String,
        trim: true,
        required: true
    },
    'lastname': {
        type: String,
        trim: true,
        required: true
    },
    'username': {
        type: String,
        trim: true,
        required: true
    },
    'points': {
        type: Number,
        default: 0
    },
    'teams': [
        {
        type: Schema.Types.ObjectId,
        ref: 'team'
        }
    ],
    'events': [
        {
        type: Schema.Types.ObjectId,
        ref: 'event'
        }
    ],
    'metadata': metadataSchema
});

userSchema.statics.findOrCreate = async function(auth0Payload) {
    const user = await this.findOne({ auth0Id: auth0Payload.sub });

    const username = auth0Payload.nickname || (auth0Payload.email ? auth0Payload.email.split('@')[0] : 'unknown');

    if (user) {
        user.name = auth0Payload.name;
        user.username = username;
        user.metadata.emailVerified = auth0Payload.email_verified || false;
        return user.save();
    }

    return this.create({
        auth0Id: auth0Payload.sub,
        email: auth0Payload.email,
        name: auth0Payload.name,
        username: username,
        metadata: {
            auth0Provider: auth0Payload.sub.split('|')[0],
            emailVerified: auth0Payload.email_verified || false
        }
    });
}



userSchema.methods.addPoints = function(pointsToAdd) {
    this.points += pointsToAdd;
    return this.save();
}

const User = mongoose.model('user', userSchema, 'user');
export default User;
