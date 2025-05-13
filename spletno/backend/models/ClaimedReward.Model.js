import mongoose from "mongoose";
var Schema = mongoose.Schema;

var claimedRewardSchema = new Schema({
    "claimedBy": {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    "rewardId": {
        type: Schema.Types.ObjectId,
        ref: "Reward"
    },
    "status": {
        type: "String",
        required: true,
        enum: ["active", "expired", "redeemed"],
        default: "active"
    },
    "expirationDate": {
        type: Date,
        required: true
    },
    "cost": Number
}, { timestamps: true} );

mongoose.exports = mongoose.model("ClaimedReward", claimedRewardSchema);