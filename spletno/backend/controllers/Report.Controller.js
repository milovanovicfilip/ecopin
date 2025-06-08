import fs, { stat } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import ReportModel from '../models/Report.Model.js'
import RewardModel from '../models/Reward.Model.js'
import UserModel from '../models/User.Model.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export default class ReportController{

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
            const data = await ReportModel.findById(id).populate('reportedBy');

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
            const data = await ReportModel.find({reportedBy: userid}).populate('reportedBy');

            return res.status(200).json(data);
        }catch(error){
            console.error('Error in getReportByUser:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }

    getByTitle = async function (req, res) {
        try {
            const title = req.query.title;

            if (!title || title=="") {
                var status = "reported,in_progress,cleaned"
                const data = await ReportModel.findByStatus(status.split(','));
                return res.status(200).json(data);
            }

            const data = await ReportModel.find({
                title: { $regex: title, $options: 'i' }
            }).populate('reportedBy');

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error in getByTitle:', error);
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
              
		const first = closedCoordinates[0];
		const last = closedCoordinates[closedCoordinates.length - 1];

		if (first[0] !== last[0] || first[1] !== last[1]) {
  			closedCoordinates.push(first);
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
        try {
            const { title ,description = '', type = 'mixed',severity = 'medium' } = req.body;
            const image = req.file || null;

            let location = req.body.location;
            if (typeof location === 'string') {
                try {
                    location = JSON.parse(location);
                } catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: "Location is not in JSON format"
                    });
                }
            }
            
            if (!title || !location?.coordinates || location.type !== "Point") {
                return res.status(400).json({
                    success: false,
                    message: "Missing or invalid title/location"
                });
            }

            const validTypes = ["mixed", "recyclable", "organic", "construction", "hazardous"];
            const validSeverities = ["low", "medium", "high"];

            if (!validTypes.includes(type)) {
                validTypes="mixed";
            }

            if(!validSeverities.includes(severity)){
                severity="medium";
            }

            const newReport = new ReportModel({
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(location.coordinates[0]),
                        parseFloat(location.coordinates[1])
                    ]
                },
                title,
                description,
                type,
                severity,
                image: image ? `/uploads/${image.filename}` : null,
                reportedBy: req.user._id
                });

                await newReport.save();

                return res.status(201).json({
                success: true,
                message: "Report created successfully",
                data: newReport
                });

        } catch (error) {
            console.error("Error in simplified addReport:", error);
            return res.status(500).json({
            success: false,
            message: "Internal server error"
            });
        }
    }

    update = async function (req, res) {
            try{
                const id = req.params.id;
                const report = await ReportModel.findById(id).populate('reportedBy');
                var {title, description, type, status, severity} = req.body


                if (!report) {
                    return res.status(404).json({
                        success: false,
                        message: 'Report not found'
                    });
                }

                const user = req.user;

                if (user.role !== "ADMIN" &&  report.reportedBy._id.toString() !== user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: "Not authorized to update this report"
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
    
                if (title !== undefined) {
                    report.title = title;
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

                const report = await ReportModel.findById(id).populate('reportedBy');

                if (!report) {
                    return res.status(404).json({
                        success: false,
                        message: 'Report not found'
                    });
                }

                const user = req.user;
    
                if (user.role !== "ADMIN" && report.reportedBy._id.toString() !== user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: "Not authorized to delete this report"
                    });
                }

                const result = await ReportModel.deleteOne({ _id: id });

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
            const userCurrent = req.user
            
            if (userCurrent.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to delete this report"
                });
            }

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
            
            if(status == "cleaned"){
                const user = await UserModel.findById(report.reportedBy._id).populate('rewards');
                
                user.points += 200;

                if(user.seasonCompleted){
                    await user.save();
                    return res.status(200).json({
                        success: false,
                        message: 'Season completed',
                        data: report
                    });
                }
                const ownedRewards = user.seasonRewards.map(r => r.reward.toString())
                const allRewards = await RewardModel.find({}).sort({level: 1});
                for (const reward of allRewards) {
                    if (user.points >= reward.requiredPoints && !ownedRewards.includes(reward._id.toString())) {
                        const partner = reward.partners[Math.floor(Math.random() * reward.partners.length)];
                        const rewardType = partner.rewardTypes[Math.floor(Math.random() * partner.rewardTypes.length)];

                        user.rewards.push(reward._id);
                        user.seasonRewards.push({reward: reward._id,partner: partner._id,receivedAt: new Date(),rewardType: rewardType});
                        user.points -= reward.requiredPoints;
                        console.log(`User unlocked reward: ${reward.level} (${rewardType} from ${partner.name})`);

                        if(user.seasonRewards.length==6){
                            user.seasonCompleted=true;
                        }

                        break;
                    }
                }

                await user.save();
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
