const leadService = require("../service/leadsService");
const generateLabelId = require("../utils/token");  // Assuming you have a function to generate unique IDs
const dataSource = require('../infrastructure/psql');
const sheetRepo = require('../entities/createSheet');
const labelController = {

    createLabel: async (io, req, res) => {
        try {
            console.log("API Hit");
            const sheetId = req.params.sheetId;
            const { label } = req.body;

            if (!label || typeof label !== "string") {
                return res.status(400).json({
                    message: "Invalid input. Please provide a label name as a string."
                });
            }

            const sheetRepository = dataSource.getRepository(sheetRepo);
            const existSheetId = await sheetRepository.findOne({ where: { sheetId: sheetId } });

            if (!existSheetId) {
                return res.status(404).json({ message: "Sheet not found" });
            }
            const labelRepository = dataSource.getRepository('label');
            const existingLabel = await labelRepository.findOne({ where: { name: label } });

            if (existingLabel) {
                return res.status(200).json({
                    message: `Label '${label}' already exists.`,
                    data: existingLabel
                });
            }
            const createdLabel = await labelRepository.save({ name: label, sheetId });
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

    getLabel: async (io, req, res) => {
        try {
            const sheetId = req.params.sheetId;

            const sheetRepository = dataSource.getRepository(sheetRepo);
            const existSheetId = await sheetRepository.findOne({ where: { sheetId } });

            if (existSheetId) {
                const labelRepository = dataSource.getRepository('label');
                const labels = await labelRepository.find({ where: { sheetId } });

                return res.status(200).json({ message: "Labels retrieved successfully", data: labels });
            } else {
                return res.status(404).json({ message: "Sheet not found" });
            }
        } catch (error) {
            console.error("Error retrieving labels:", error.message);
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },
    updateLabel: async (io, req, res) => {
        try {
          const { labelId } = req.params; 
          const { name } = req.body;
    
          if (!name || typeof name !== 'string') {
            return res.status(400).json({
              message: "Invalid input. Please provide a label name as a string."
            });
          }
    
          const labelRepository = dataSource.getRepository('label');
          
          const existingLabel = await labelRepository.findOne({ where: { labelId } });
          if (!existingLabel) {
            return res.status(404).json({
              message: `Label with labelId '${labelId}' not found.`
            });
          }
    
          const labelWithSameName = await labelRepository.findOne({ where: { name: name, sheetId: existingLabel.sheetId } });
          if (labelWithSameName) {
            return res.status(400).json({
              message: `Label name '${name}' already exists in the same sheet.`
            });
          }
              existingLabel.name = name;
          existingLabel.updated_at = new Date(); 
         const updatedLabel = await labelRepository.save(existingLabel);
          return res.status(200).json({
            message: "Label updated successfully",
            data: updatedLabel
          });
        } catch (error) {
          console.error("Error updating label:", error.message);
          return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
          });
        }
      },
};

module.exports=labelController