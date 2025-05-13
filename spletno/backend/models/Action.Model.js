import mongoose from "mongoose";
var Schema = mongoose.Schema;

var actionSchema = new Schema({
    "teamId": {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    "name": {
        type: String,
        required: true,
        maxlength: [100, "Event name cannot exceed 100 chatacters"]
    },
    "description": String,
    "location": {
        type: {
            enum: String,
            enum: ["Point"],
            default: "Point"
        },
        coords: {
            type: [Number],
            required: true
        },
    },
    "address": String,
    "startTime": {
        type: Date,
        required: true
    },
    "endTime": {
        type: Date,
        required: true,
        validate: {
            validator: function(x) {
                return x > this.startTime;
            },
            message: "End time must be after start time"
        }
    },
    "organizer": {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    "participants": [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    "wasteCollected": {
        "type": {
            type: String,
            enum: ["mixed", "recyclable", "organic", "construction", "hazardous"],
            required: true,
            default: "mixed"
        },
        "amount": {
            type: Number,
            required: true,
            min: [0.1, "Amount must be at least 0.1 kg"]
        }
    },
    "status": {
        type: String,
        enum: ["planned", "ongoing", "completed", "cancelled"],
        default: "planned"
    },
    "images": [String]
}, { timestamps: true });

actionSchema.index({ location: "2dsphere" });
actionSchema.index({ startTime: 1 });
actionSchema.index({ status: 1 });

mongoose.exports = mongoose.model("Action", actionSchema);