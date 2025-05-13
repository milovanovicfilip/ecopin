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

    if (user) {
        user.name = auth0Payload.name;
        user.nickname = auth0Payload.nickname
        user.metadata.emailVerified = auth0Payload.email_verified || false;
        return user.save();
    }

    return this.create({
        auth0Id: auth0Payload.sub,
        email: auth0Payload.email,
        name: auth0Payload.name,
        nickname: auth0Payload.nickname,
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

module.exports = mongoose.model('user', userSchema, 'user');