import mongoose from "mongoose";
var Schema = mongoose.Schema;

var rewardSchema = new Schema({
    "name": {
        type: String,
        required: true
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
    "image" : String,
 
}, { timestamps: true } );

mongoose.exports = mongoose.model("reward", rewardSchema, "reward");