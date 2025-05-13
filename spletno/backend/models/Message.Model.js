import mongoose from "mongoose";
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    "teamId": {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    "senderId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    "content": {
        type: String,
        maxlength: [1000, "Message cannot exceed 1000 characters"]
    },
    "images": [String],
    "timeStamp": {
        type: Date,
        default: Date.now
    }
});

messageSchema.index({ teamId: 1, timestamp: -1 });

mongoose.exports = mongoose.model("Message", messageSchema);