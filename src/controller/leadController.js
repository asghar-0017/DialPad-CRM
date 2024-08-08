const leadService = require('../service/leadService');
const leadId = require('../utils/token');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { io } = require('../App'); // Import io instance from app.js

const leadController = {
    createLead: async (req, res) => {
        try {
            const data = req.body;
            data.leadId = leadId();
            const user = req.user;

            if (data.customer_feedBack === 'followUp' && !data.followUpDetail) {
                return res.status(400).json({ message: 'followUpDetail is required when customer_feedBack is followUp' });
            }
            if (data.customer_feedBack === 'other' && !data.otherDetail) {
                return res.status(400).json({ message: 'other is required when customer_feedBack is other' });
            }

            const lead = await leadService.leadCreateService(data, user);
            console.log("Io instance:", io);
            if (io) {
                console.log('Emitting leadCreated event');
                io.emit('leadCreated', lead);
            } else {
                console.error('Socket.io instance is not initialized');
            }
            res.status(201).json({ message: 'Lead created successfully', lead });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    
    readLead: async (req, res) => {
        try {
            const data = await leadService.leadReadService();
            const processedData = data.map(lead => {
                if (lead.customer_feedBack !== 'followUp') {
                    delete lead.followUpDetail;
                }
                if (lead.customer_feedBack === 'followUp') {
                    delete lead.followUpDetail;
                }
                if (lead.customer_feedBack !== 'other') {
                    delete lead.otherDetail;
                }
                if (lead.customer_feedBack === 'other') {
                    delete lead.otherDetail;
                }
                return lead;
            });

            res.status(200).json({ message: 'Success', data: processedData });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    updateLead: async (req, res) => {
        try {
            const data = req.body;
            const leadId = req.params.leadId;
            const user = req.user;

            const lead = await leadService.updateLeadByService({ data, leadId, user });
            if (lead && lead.customer_feedBack !== 'followUp') {
                delete lead.followUpDetail;
            }

            res.status(201).json({ message: 'Lead Updated successfully', data: lead });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    saveExcelFileData: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file.' });
        }

        const filePath = path.join(__dirname, '../uploads/', req.file.filename);

        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const results = xlsx.utils.sheet_to_json(sheet);

            if (results.length === 0) {
                return res.status(400).json({ message: 'No data found in the Excel file.' });
            }

            const requiredColumns = ['leadName', 'phone', 'email','address','website','customer_feedBack'];
            const sampleRow = results[0];
            const missingColumns = requiredColumns.filter(col => !sampleRow.hasOwnProperty(col));

            if (missingColumns.length > 0) {
                return res.status(400).json({ message: `Missing required columns: ${missingColumns.join(', ')}` });
            }

            for (const row of results) {
                if (!row.leadName || !row.phone || !row.email) {
                    console.error("Missing required fields in row:", row);
                    continue;
                }
                row.leadId = leadId();
                const leadData = {
                    leadId: row.leadId,
                    leadName: row.leadName,
                    phone: row.phone,
                    email: row.email,
                    address: row.address,
                    website: row.website,
                    customer_feedBack: row.customer_feedBack,
                    followUpDetail: row.followUpDetail,
                };
                await leadService.leadCreateService(leadData, req.user);
            }
            res.status(200).json({ message: 'Leads created successfully', data: results });
        } catch (error) {
            console.error('Error processing the Excel file:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        } finally {
            fs.unlinkSync(filePath);
        }
    },

    getLeadById: async (req, res) => {
        try {
            const leadId = req.params.leadId;
            const data = await leadService.leadGetServiceById(leadId);
            if (data) {
                res.status(200).send({ message: "success", data: data });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    deleteLead: async (req, res) => {
        try {
            const leadId = req.params.leadId;
            const user = req.user;

            const result = await leadService.deleteLeadById(leadId, user);
            if (!result) {
                return res.status(404).json({ message: 'Lead Data not found' });
            }
            res.status(200).json({ message: 'Lead Data deleted successfully', data: result });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

module.exports = { leadController };
