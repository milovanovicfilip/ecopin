import mongoose from "mongoose";
var Schema = mongoose.Schema;

var rewardSchema = new Schema({
    "name": {
        type: String,
        required: true,
        maxlength: [100, "Event name cannot exceed 100 chatacters"]
    },
    "description": String,
    "partner": String,
    "cost": {
        type: Number,
        minimum: 300
    },
    "isActive": Boolean,
    "expirationDate": {
        type: Date,
        required: true
    },
    "image" : String
}, { timestamps: true } );

mongoose.exports = mongoose.model("Reward", rewardSchema);