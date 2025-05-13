import mongoose from "mongoose";
var Schema = mongoose.Schema;

const teamStats = new Schema({
    'eventsCount': Number,
    'totalPoints': Number
});

var teamSchema = new Schema({
    'name': {
        type: String,
        required: true,
        unique: true
    },
    'description': {
        type: String
    },
    'owner': {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    'members': [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    'image': String,
    'stats': teamStats
});

teamSchema.methods = {
    async removeMember(userId) {
        this.members = this.members.filter(memberId => !memberId.equals(userId));
        await this.save();
        return this;
    },

    isMember(userId) {
        return this.members.some(memberId => memberId.equals(userId));
    },

    isOwner(userId) {
        return this.owner.equals(userId);
    }
}

mongoose.exports = mongoose.model('Team', teamSchema);