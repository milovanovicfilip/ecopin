import mongoose from "mongoose";
var Schema = mongoose.Schema;

var rewardSchema = new Schema({
    "name": String,
    "description": String,
    "level": Number,
    "partners": [{type: Schema.Types.ObjectId, ref: 'Partner'}],
    "requiredPoints": Number,
    "image" : String,
 
}, { timestamps: true } );

mongoose.exports = mongoose.model("rewards", rewardSchema);