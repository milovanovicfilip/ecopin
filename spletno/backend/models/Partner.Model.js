import mongoose from "mongoose";
var Schema = mongoose.Schema;

var partnerSchema = new Schema({
    "name": String,
    "logo": String,
    "rewardTypes": [String],
});

mongoose.exports = mongoose.model("partners", partnerSchema);