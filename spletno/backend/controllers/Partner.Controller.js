import PartnerModel from '../models/Partner.Model.js'


export default class PartnerController{

    getAll = async function (req, res) {
        try{
             const name = req.query.name;

            if (!name || name=="") {
                const data = await PartnerModel.find({});
                return res.status(200).json(data);
            }
            
            const data = await PartnerModel.find({
                name: { $regex: name, $options: 'i' }
            });
            return res.status(200).json(data);
        }
        catch(error){
            console.error('Error in getAllPartners:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    getById = async function (req, res) {
        try{
            const id = req.params.id;
            const data = await PartnerModel.findById(id);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Partner not found'
                });
            }

            return res.status(200).json(data);
        }catch(error){
            console.error('Error in getPartnerById:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    }
}