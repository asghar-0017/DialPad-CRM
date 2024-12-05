const sheetRepository = require("../repository/sheetRepository");
const generateSheetId = require("../utils/token");
const generateLeadId = require("../utils/token");
const Lead = require("../entities/lead");
const dataSource = require("../infrastructure/psql");

const sheetController = {
    createSheet: async (io, req, res) => {
        try {
            const data = req.body;
            data.sheetId = generateSheetId();
            const currentDate = new Date().toLocaleDateString();

            const initialData = [
                {
                    lead: "New Lead",
                    date: currentDate,
                    text: "",
                    email:"",
                    status: "New Lead",
                },
                {
                    lead: "New Lead",
                    date: currentDate,
                    text: "",
                    email:"",
                    status: "New Lead",
                },
                {
                    lead: "New Lead",
                    date: currentDate,
                    text: "",
                    email:"",
                    status: "New Lead",
                },
            ];

            const leads = [];
            for (const item of initialData) {
                const leadId = generateLeadId();
                const leadEntity = {
                    leadId,
                    agentId: req.user.agentId || null,
                    role: req.user.user ,
                    dynamicLead: item,
                    sheetId: data.sheetId,
                };
                const savedLead = await dataSource.getRepository(Lead).save(leadEntity);
                leads.push(savedLead); 
            }
            const sheet = await sheetRepository.createSheet(data);

            return res.status(201).json({
                message: "Sheet created successfully",
                leads,
                sheet,
            });
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
