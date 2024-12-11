const leadService = require("../service/leadsService");
const generateLabelId = require("../utils/token");  // Assuming you have a function to generate unique IDs
const dataSource = require('../infrastructure/psql');
const sheetRepo = require('../entities/createSheet');
const Label = require('../entities/labels')
const Lead = require("../entities/lead"); // Import Lead entity
const labelController = {

    createLabel: async (req, res) => {
        try {
            console.log("API Hit");
            const sheetId = req.params.sheetId;
            const { label,color } = req.body;

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
            const labelId=generateLabelId()
            const createdLabel = await labelRepository.save({ name: label, sheetId , labelId , color});
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

    getLabel: async (req, res) => {
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

    updateLabel: async ( req, res) => {
      try {
        const { labelId } = req.params;
        const { name, color } = req.body;
    
        // Validate the input
        if (!name || typeof name !== "string") {
          return res.status(400).json({ message: "Invalid input. Please provide a valid label name." });
        }
    
        await dataSource.transaction(async (transactionalEntityManager) => {
          const labelRepository = transactionalEntityManager.getRepository(Label);
          const leadRepository = transactionalEntityManager.getRepository(Lead);
    
          // Fetch the existing label
          const existingLabel = await labelRepository.findOne({ where: { labelId } });
          if (!existingLabel) {
            throw new Error(`Label with labelId '${labelId}' not found.`);
          }
    
          // Check for duplicate label name in the same sheet
          const duplicateLabel = await labelRepository.findOne({
            where: { name, sheetId: existingLabel.sheetId },
          });
          if (duplicateLabel && duplicateLabel.labelId !== labelId) {
            throw new Error(`A label with the name '${name}' already exists.`);
          }
    
          // Store the old label name
          const oldLabelName = existingLabel.name;
    
          // Update the label
          existingLabel.name = name;
          existingLabel.color = color;
          existingLabel.updated_at = new Date();
          const updatedLabel = await labelRepository.save(existingLabel);
              const associatedLeads = await leadRepository.find({
            where: { sheetId: existingLabel.sheetId },
          });
    
          for (const lead of associatedLeads) {
            if (lead.dynamicLead && lead.dynamicLead.status === oldLabelName) {
              lead.dynamicLead.status = name;
              lead.updated_at = new Date();
              await leadRepository.save(lead);
            }
          }
              // io.emit("label_updated", updatedLabel);
              res.status(200).json({
            message: "Label and associated leads updated successfully",
            data: updatedLabel,
          });
        });
      } catch (error) {
        console.error("Error updating label:", error.message);
        return res.status(500).json({ message: "Error updating label", error: error.message });
      }
    }
    
    
    
    
    
    
};

module.exports=labelController