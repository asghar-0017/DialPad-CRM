const leadService = require("../service/leadsService");
const generateLeadId = require("../utils/token");
const dataSource=require('../infrastructure/psql')

const labelController = {

    createLabel: async (io, req, res) => {
        try {
            const sheetId = req.params.sheetId;

            const { label } = req.body; 
                if (!label || typeof label !== "string") {
                return res.status(400).json({ 
                    message: "Invalid input. Please provide a label name as a string." 
                });
            }

            const sheetRepository = dataSource.getRepository(sheetRepo);
            const existSheetId = await sheetRepository.findOne({ where: { sheetId: lead.sheetId } });
        

            const labelRepository = dataSource.getRepository('label');
                const existingLabel = await labelRepository.findOne({ where: { name: label } });
            if (existingLabel) {
                return res.status(200).json({ 
                    message: `Label '${label}' already exists.`,
                    data: existingLabel 
                });
            }
            const createdLabel = await labelRepository.save({ name: label });
            return res.status(201).json({ 
                message: "Label created successfully.", 
                data: createdLabel 
            });
        } catch (error) {
            console.error("Error creating label:", error.message);
            return res.status(500).json({ 
                message: "Internal Server Error", 
                error: error.message 
            });
        }
    },
    
    
    getLabel:async(io, req, res)=>{
        try {
            const labelRepository = dataSource.getRepository('label');
            const labels = await labelRepository.find();
            return res.status(200).json({ message: "Labels retrieved successfully", data: labels });
          } catch (error) {
            console.error("Error retrieving labels:", error.message);
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
          }
    }
  };

module.exports = { labelController };
