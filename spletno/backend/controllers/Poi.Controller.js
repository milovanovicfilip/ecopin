import PoiModel from '../models/Poi.Model.js'

export default class PoiController{
    constructor(){}

    getAll = async function (req, res) {
        try{
            var type = req.query.type
            const data = await PoiModel.findByType(type.split(','));
            return res.status(200).json(data);
        }
        catch(error){
            console.error('Error in getAllPois:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    getById = async function (req, res) {
        try{
            const id = req.params.id;
            const data = await PoiModel.findById(id);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'POI not found'
                });
            }

            return res.status(200).json(data);
        }catch(error){
            console.error('Error in getPoiById:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getVisible = async function (req, res) {
        try{
            const {bbox, types} = req.query;

            if(!bbox){
                return res.status(400).json({
                    success: false,
                    message: "Bounding box (bbox) parameter is required"
                })
            }

            const bboxCoords = bbox.split(',').map(coordinates => parseFloat(coordinates));
            if (bboxCoords.length !== 4 || bboxCoords.some(isNaN)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid bbox format. Use minLon,minLat,maxLon,maxLat"
                });
            }
    
            const query = {
                location: {
                    $geoWithin: {
                        $box: [
                            [bboxCoords[0], bboxCoords[1]],
                            [bboxCoords[2], bboxCoords[3]]
                        ]
                    }
                }
            };

            if (types) {
                const typesArray = types.split(',');
                const validTypes = ["eco-island", "disposal-site", "bin"];
                
                const invalidTypes = typesArray.filter(type => !validTypes.includes(type));
                if (invalidTypes.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid POI types: ${invalidTypes.join(', ')}`
                    });
                }

                query.type = { $in: typesArray };
            }
            
            const visiblePois = await PoiModel.find(query);
            res.json(visiblePois);
        }catch(error){
            console.error('Error in getVisiblePois:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getNearby = async function (req, res) {
        try{
            const { lon, lat, radius, types } = req.query;
            
            if (!lon || !lat || !radius) {
                return res.status(400).json({
                    success: false,
                    message: "Longitude, latitude and radius are required"
                });
            }

            const longitude = parseFloat(lon);
            const latitude = parseFloat(lat);
            const radiusInMeters = parseInt(radius);

            if (isNaN(longitude) || isNaN(latitude) || isNaN(radiusInMeters)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid coordinates or radius format"
                });
            }

            const query = {
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: radiusInMeters
                    }
                }
            };

            if (types) {
                const typesArray = types.split(',');
                query.type = { $in: typesArray };
            }

            const nearbyPois = await PoiModel.find(query);
            res.json(nearbyPois);
        }catch(error){
            console.error('Error in getNearbyPois:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getInPoligon = async function (req, res) {
        try{
            const { coordinates, types } = req.body;

            if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "Polygon must have at least 3 coordinates"
                });
            }
            
            const closedCoordinates = [...coordinates];
            if (!closedCoordinates[0].equals(closedCoordinates[closedCoordinates.length - 1])) {
                closedCoordinates.push(closedCoordinates[0]);
            }

            const pois = await PoiModel.findWithinPolygon(
                closedCoordinates,
                types ? types.split(',') : []
            );

            res.json({
                success: true,
                count: pois.length,
                data: pois
            });
        }catch(error){
            console.error('Error in getPoisInPoligon:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
            
        }
    }

    add = async function (req, res) {
        try{
            const {location, type, address, city, description} = req.body
      
            if (!location || !location.coordinates || !location.type){
                return res.status(400).json({
                    success: false,
                    message: 'Location data is required with coordinates and type'
                })
            }

            if (!type || !['eco-island', 'disposal-site', 'bin'].includes(type)){
                return res.status(400).json({ 
                    success: false, 
                    message: 'Valid type is required'  
                });
            }

            if (!city || typeof city !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'City name is required' 
                });
            }

            const [longitude, latitude] = location.coordinates;

            if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid coordinates' 
                });
            }


            const newPoi = new PoiModel({
                location: {
                    type: location.type,
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                type: type,
                address: address,
                city: city,
                description: description || ''
            });

            await newPoi.save();

            return res.status(201).json({
                success: true,
                message: 'Poi successfully submitted'
            });

        }catch (error) {
            console.error('Error in addPoi:', error);

            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error'
            });
        }
    }

    update = async function (req, res) {
        try{
            const id = req.params.id;
            const {type, address, city, description} = req.body

            var poi = await PoiModel.findById(id)
            if (!poi) {
                return res.status(404).json({
                    success: false,
                    message: 'POI not found'
                });
            }
            
            if (type) {
                if (!['eco-island', 'disposal-site', 'bin'].includes(type)) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Valid type is required'  
                    });
                }
                poi.type = type;
            }

            poi.address = address ? address : poi.address;

            if (city) {
                if (typeof city !== 'string') {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'City must be a string' 
                    });
                }
                poi.city = city;
            }
            
            poi.description = description ? description : poi.description;


            await poi.save()

            return res.status(200).json({
                success: true,
                message: 'Poi successfully updated'
            });

        }catch (error) {
            console.error('Error in updatePoi:', error);

            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error'
            });
        }
    }

    delete = async function (req, res) {
        try{
            const id = req.params.id;

            const result = await PoiModel.deleteOne({_id: id})
            
            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'POI not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Poi successfully deleted'
            });

        }catch (error) {
            console.error('Error in deletePoi:', error);

            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error'
            });
        }
    }

}