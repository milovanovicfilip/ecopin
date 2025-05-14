
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export default class ReportController{
    constructor(){}

    getAllReports = async function (req, res) {
        try{
            const data = await Report.find();
            return response.status(200).json(data);
        }
        catch(error){
            console.log(error);
            return response.status(500).json({
                success: false,
                message: 'An unexpected error occurred'
            });
        }
    }

    getReportById = async function (req, res) {
        try{
            const id = req.body.id;
            const data = await Report.findById(id);
            return response.status(200).json(data);
        }catch(error){
            console.error('Error in getReportById:', error);
            return res.status(400).json({ 
                success: false, 
                message: 'An unexpected error occurred' 
            });
        }
    }

    addReport = async function (req, res) {
        try{
            const {location, reportType, description, city} = req.body
            const images = req.files || [];

            if (!location || !location.coordinates || !location.type){
                return res.status(400).json({
                    success: false,
                    message: 'Location data is required with coordinates and type'
                })
            }

            if (!reportType || !['missing_bin', 'missing_eco_island', 'missing_disposal_site', 'illegal_dumping'].includes(reportType)){
                return res.status(400).json({ 
                    success: false, 
                    message: 'Valid reportType is required'  
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

            const savedImages = [];
            const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
        
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            for (const file of images) {
                try {
                    if (!file.mimetype.startsWith('image/')) {
                        continue;
                    }

                    const ext = path.extname(file.originalname);
                    const filename = `report_${Date.now()}${ext}`;
                    const filePath = path.join(uploadDir, filename);

                    await writeFileAsync(filePath, file.buffer);

                    savedImages.push(`/uploads/${filename}`);
                } catch (error) {
                    console.error('Error saving image:', error);
                }
            }


            const newReport = new Report({
                location: {
                    type: location.type,
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                reportType: reportType,
                description: description || '',
                status: 'pending',
                reportedBy: req.user._id,
                images: savedImages,
                city: city
            });

            await newReport.save();

            return res.status(201).json({
                success: true,
                message: 'Report successfully submitted'
            });

        }catch (error) {
            console.error('Error in addReport:', error);
        
            if (savedImages && savedImages.length > 0) {
                for (const image of savedImages) {
                    try {
                        const filename = path.basename(image);
                        await unlinkAsync(path.join(__dirname, '..', 'public', 'uploads', filename));
                    } catch (unlinkError) {
                        console.error('Error deleting image:', unlinkError);
                    }
                }
            }

            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error'
            });
        }
    }
}