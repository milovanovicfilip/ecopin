import fs, { stat } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import ReportModel from '../models/Report.Model.js'
import UserModel from '../models/User.Model.js'
import { checkJwt, getUserFromDb } from '../utils/jwt.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export default class ReportController{
    constructor() {
        this.requireAuth = [checkJwt, getUserFromDb];
    }

    getAll = async function (req, res) {
        try{
            var status = req.query.status
            if(!status){
                status = "reported,in_progress,cleaned"
            }

            const data = await ReportModel.findByStatus(status.split(','));
            return res.status(200).json(data);
        }
        catch(error){
            console.error('Error in getAllReports:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    getById = async function (req, res) {
        try{
            const id = req.params.id;
            const data = await ReportModel.findById(id);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            return res.status(200).json(data);
        }catch(error){
            console.error('Error in getReportById:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getByUser = async function (req, res) {
        try{
            const userid = req.params.userid;
            const data = await ReportModel.find({reportedBy: userid});
            
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            return res.status(200).json(data);
        }catch(error){
            console.error('Error in getReportById:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getVisible = async function (req, res) {
        try{
            const {bbox, status} = req.query;

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

            if (status) {
                const statusArray = status.split(',');
                const validStatus = ["reported", "in_progress", "cleaned"];
                
                const invalidStatus = statusArray.filter(s => !validStatus.includes(s));
                if (invalidStatus.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid Report types: ${invalidStatus.join(', ')}`
                    });
                }

                query.status = { $in: statusArray };
            }else{
                const typesArray = ["reported", "in_progress", "cleaned"];
                query.type = { $in: typesArray };
            }
            
            const visibleReports = await ReportModel.find(query);
            res.json(visibleReports);
        }catch(error){
            console.error('Error in getVisibleReports:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getInPoligon = async function (req, res) {
            try{
                const { coordinates, status } = req.body;
    
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
    
                const reports = await ReportModel.findWithinPolygon(
                    closedCoordinates,
                    status ? status.split(',') : []
                );
    
                res.json({
                    success: true,
                    count: reports.length,
                    data: reports
                });
            }catch(error){
                console.error('Error in getReportsInPoligon:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                })
                
            }
        }

    add = async function (req, res) {
        let savedImagePath = null;

        try {
        const { location, description, type, status, severity } = req.body;
        const image = req.file || null;
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        // Preveri obvezna polja
        if (!parsedLocation?.coordinates || !parsedLocation?.type) {
            return res.status(400).json({
            success: false,
            message: 'Location data is required with coordinates and type'
            });
        }

        // Preveri veljavne vrednosti
        const validTypes = ["mixed", "recyclable", "organic", "construction", "hazardous"];
        const validStatuses = ["reported", "in_progress", "cleaned"];
        const validSeverities = ["low", "medium", "high"];
        
        console.log(location, description, type, status, severity);
        console.log(validTypes);

        if (!validTypes.includes(type)) {
            return res.status(400).json({ 
            success: false, 
            message: 'Invalid report type' 
            });
        }

        // Preveri koordinate
        const [longitude, latitude] = parsedLocation.coordinates;
        if (isNaN(longitude) || isNaN(latitude) || 
            longitude < -180 || longitude > 180 || 
            latitude < -90 || latitude > 90) {
            return res.status(400).json({ 
            success: false, 
            message: 'Invalid coordinates' 
            });
        }

        // Obdelaj sliko če obstaja
        if (image) {
            const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
            if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = path.extname(image.originalname);
            const filename = `report_${Date.now()}${ext}`;
            const filePath = path.join(uploadDir, filename);

            await fs.promises.copyFile(image.path, filePath);
            savedImagePath = `/uploads/${filename}`;
            await fs.promises.unlink(image.path);
        }

        // Ustvari nov report
        const newReport = new ReportModel({
            location: {
            type: parsedLocation.type,
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            reportedBy: req.user._id, // Uporabi ID prijavljenega uporabnika
            description: description || '',
            type: type,
            status: status || "reported",
            severity: severity || "medium",
            image: savedImagePath
        });

        await newReport.save();

        return res.status(201).json({
            success: true,
            message: 'Report successfully submitted',
            data: newReport
        });

        } catch (error) {
        console.error('Error in addReport:', error);
        
        // Počisti naloženo sliko če je prišlo do napake
        if (savedImagePath) {
            try {
            const filename = path.basename(savedImagePath);
            await fs.promises.unlink(path.join(__dirname, '..', 'public', 'uploads', filename));
            } catch (unlinkError) {
            console.error('Error deleting image:', unlinkError);
            }
        }

        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }

    update = async function (req, res) {
            try{
                const id = req.params.id;
                var {description, type, status, severity} = req.body
                
                var report = await ReportModel.findById(id)
                if (!report) {
                    return res.status(404).json({
                        success: false,
                        message: 'Report not found'
                    });
                }
                
                
                if (type) {
                    if (!["mixed", "recyclable", "organic", "construction", "hazardous"].includes(type)) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Valid type is required'  
                        });
                    }
                    report.type = type;
                }

                if(status){
                    if (!["reported", "in_progress", "cleaned"].includes(status)) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Valid status is required'  
                        });
                    }
                    report.status = status;
                }

                if(severity){
                    if (!["low", "medium", "high"].includes(severity)) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Valid severity is required'  
                        });
                    }
                    report.severity = severity;
                }
    
                if (description !== undefined) {
                    report.description = description;
                 }    
                await report.save()
    
                return res.status(200).json({
                    success: true,
                    message: 'Report successfully updated'
                });
    
            }catch (error) {
                console.error('Error in updateReport:', error);
    
                return res.status(500).json({ 
                    success: false, 
                    message: 'Internal server error'
                });
            }
        }
    
        delete = async function (req, res) {
            try{
                const id = req.params.id;
    
                const result = await ReportModel.deleteOne({_id: id})
                
                if (result.deletedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Report not found'
                    });
                }
    
                return res.status(200).json({
                    success: true,
                    message: 'Report successfully deleted'
                });
    
            }catch (error) {
                console.error('Error in deleteReport:', error);
    
                return res.status(500).json({ 
                    success: false, 
                    message: 'Internal server error'
                });
            }
        }

        updateStatus = async function(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!["reported", "in_progress", "cleaned"].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status value' 
            });
            }
            
            const report = await ReportModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
            );
            
            if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
            }
            
            return res.status(200).json({
            success: true,
            message: 'Report status updated',
            data: report
            });
        } catch (error) {
            console.error('Error in updateStatus:', error);
            return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
            });
        }
    }
}