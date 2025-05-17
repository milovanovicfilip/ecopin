import mongoose from "mongoose";
var Schema = mongoose.Schema;

var poiSchema = new Schema({
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
    },
    "type": {
        type: String,
        required: true,
        enum: ["eco-island", "disposal-site", "bin"]
    },
    "lastChanged": {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

poiSchema.index({ location: '2dsphere' });
poiSchema.index({ type: 1 });

poiSchema.statics.findByType = async function(type) {
    return await this.find({ type }).exec();
};

poiSchema.statics.findWithinPolygon = async function(polygonCoordinates, types = []) {
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

const PoiModel = mongoose.model("pois", poiSchema, "pois");
export default PoiModel;
