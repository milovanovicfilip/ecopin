import mongoose from "mongoose";
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    "team": {
        type: Schema.Types.ObjectId,
        ref: "team",
        required: true
    },
    "sender": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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

messageSchema.index({ team: 1, timestamp: -1 });

mongoose.exports = mongoose.model("message", messageSchema, "message");