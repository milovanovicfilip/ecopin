import mongoose from "mongoose";
var Schema = mongoose.Schema;

var partnerSchema = new Schema({
    "name": String,
    "logo": String,
    "rewardTypes": [String],
});

const PartnerModel = mongoose.model("partners", partnerSchema);
export default PartnerModel;
