const sheetRepository = require("../repository/sheetRepository");
const generateSheetId = require("../utils/token");

const sheetController = {
    createSheet: async (io, req, res) => {
        try {
            const data = req.body;
            data.sheetId = generateSheetId();
            const sheet = await sheetRepository.createSheet(data);
            return res.status(201).json({ message: "Sheet created successfully", data: sheet });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getAllSheets: async (req, res) => {
        try {
            const sheets = await sheetRepository.getAllSheets();
            return res.status(200).json({ message: "Sheets retrieved successfully", data: sheets });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getSheetById: async (req, res) => {
        try {
            const { sheetId } = req.params;
            const sheet = await sheetRepository.getSheetById(sheetId);
            if (!sheet) {
                return res.status(404).json({ message: "Sheet not found" });
            }
            return res.status(200).json({ message: "Sheet retrieved successfully", data: sheet });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
};

module.exports = sheetController;
