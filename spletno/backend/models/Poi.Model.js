import mongoose from "mongoose";
var Schema = mongoose.Schema;

var poiSchema = new Schema({
    "type": {
        type: String,
        required: true,
        enum: ["eco-island", "disposal-site", "bin"]
    },
    "location": {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: String
    },
    "description": String,
    /**"maintainedBy": {
        type: Schema.Types.ObjectId,
        ref: "UtilityCompany"
    },**/
    "status": {
        type: String,
        required: true,
        enum: ["active", "damaged", "removed", "full"]
    },
    lastChecked: {
        type: Date,
        default: () => new Date()
    }
}, { timestamps: true });

poiSchema.index({ location: '2dsphere' });
poiSchema.index({ type: 1 });

poiSchema.statics.findByType = async function(type) {
    return await this.find({ type }).exec();
};

const POI = mongoose.model("POI", poiSchema);
export default POI;
//mongoose.exports = mongoose.model("POI", poiSchema);