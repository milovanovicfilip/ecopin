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
            enum: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    "address": String,
    "description": String
}, { timestamps: true });

poiSchema.index({ location: '2dsphere' });
poiSchema.index({ type: 1 });

poiSchema.statics.findByType = async function(type) {
    return await this.find({ type }).exec();
};

mongoose.exports = mongoose.model("poi", poiSchema, "poi");