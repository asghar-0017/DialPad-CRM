const leadService = require("../service/leadsService");
const generateLeadId = require("../utils/token");
const dataSource = require('../infrastructure/psql');
const sheetRepo = require('../entities/createSheet');
const labelController = {

    createLabel: async (io, req, res) => {
        try {
            console.log("API Hit");
            const sheetId = req.params.sheetId;
            const { label } = req.body;

            // Validate label input
            if (!label || typeof label !== "string") {
                return res.status(400).json({
                    message: "Invalid input. Please provide a label name as a string."
                });
            }

            // Check if sheet exists
            const sheetRepository = dataSource.getRepository(sheetRepo);
            const existSheetId = await sheetRepository.findOne({ where: { sheetId: sheetId } });

            if (!existSheetId) {
                return res.status(404).json({ message: "Sheet not found" });
            }

            // Check if label already exists
            const labelRepository = dataSource.getRepository('label');
            const existingLabel = await labelRepository.findOne({ where: { name: label } });

            if (existingLabel) {
                return res.status(200).json({
                    message: `Label '${label}' already exists.`,
                    data: existingLabel
                });
            }

            // Create new label
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
    }
};

module.exports=labelController