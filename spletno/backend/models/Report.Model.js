import mongoose from "mongoose";
var Schema = mongoose.Schema;

var reportSchema = new Schema({
    "location": {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required:true
        }
    },
    "reportedBy": {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    "description": String,
    "type": {
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
    },
    "image": String
}, { timestamps: true });

reportSchema.index({ location: "2dsphere" });
reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });

reportSchema.statics.findByStatus = async function(status) {
    return await this.find({ status }).exec();
};

reportSchema.statics.findByType = async function(type) {
    return await this.find({ type }).exec();
};

reportSchema.statics.findWithinPolygon = async function(polygonCoordinates, types = []) {
    const query = {
        location: {
            $geoWithin: {
                $geometry: {
                    type: "Polygon",
                    coordinates: [polygonCoordinates]
                }
            }
        }
    };

    if (types.length > 0) {
        query.type = { $in: types };
    }

    return await this.find(query);
};

const ReportModel = mongoose.model("report", reportSchema, "report");
export default ReportModel;