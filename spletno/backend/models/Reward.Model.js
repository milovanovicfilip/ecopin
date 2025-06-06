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

const RewardModel = mongoose.model("rewards", rewardSchema);
export default RewardModel;
