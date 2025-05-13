import mongoose from "mongoose";
var Schema = mongoose.Schema;

var reportSchema = new Schema({
    "reportedBy": {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    "location": {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coords: {
            type: [Number],
            required:true
        }
    },
    "address": String,
    "wasteType": {
        type: String,
        enum: ["mixed", "recyclable", "organic", "construction", "hazardous"],
        default: "mixed"
    },
    "status": {
        type: String,
        enum: ["reported", "in_progress", "cleaned"],
        default: "reported"
    },
    "severity": {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    }
}, { timestamps: true });

reportSchema.index({ location: "2dsphere" });
reportSchema.index({ status: 1 });
reportSchema.index({ wasteType: 1 });

mongoose.exports = mongoose.model("Report", reportSchema);