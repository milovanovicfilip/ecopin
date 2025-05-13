import mongoose from "mongoose";
var Schema = mongoose.Schema;

const profileSchema = new Schema({
    'picture': String,
    'firstName': String,
    'lastName': String
});

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
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    'username': {
        type: String,
        trim: true,
        default: function() {
            return this.email.split('@')[0];
        }
    },
    'ecoPoints': {
        type: Number,
        default: 0
    },
    'profile': profileSchema,
    'joinedTeams': [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    'eventsParticipated': [{
        type: Schema.Types.ObjectId,
        ref: 'Action'
    }],
    'metadata': metadataSchema
});

userSchema.statics.findOrCreate = async function(auth0Payload) {
    const user = await this.findOne({ auth0Id: auth0Payload.sub });

    if (user) {
        user.profile = {
            picture: auth0Payload.picture || user.profile.picture,
            name: auth0Payload.name || user.profile.name,
            nickname: auth0Payload.nickname || user.profile.nickname
        };
        user.metadata.emailVerified = auth0Payload.email_verified || false;
        return user.save();
    }

    return this.create({
        auth0Id: auth0Payload.sub,
        email: auth0Payload.email,
        profile: {
            picture: auth0Payload.picture,
            name: auth0Payload.name,
            nickname: auth0Payload.nickname
        },
        metadata: {
            auth0Provider: auth0Payload.sub.split('|')[0],
            emailVerified: auth0Payload.email_verified || false
        }
    });
}

userSchema.methods.addPoints = function(pointsToAdd) {
    this.ecoPoints += pointsToAdd;

    return this.save();
}

module.exports = mongoose.model('User', userSchema);