const leadService = require('../service/leadService');
const leadId = require('../utils/token');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

const leadController = {
    createLead: async (req, res) => {
        try {
            const data = req.body;
            data.leadId = leadId();
            const user = req.user;

            if (data.customer_feedBack === 'followUp' && !data.followUpDetail) {
                return res.status(400).json({ message: 'followUpDetail is required when customer_feedBack is followUp' });
            }

            const lead = await leadService.leadCreateService(data, user);
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
            const leadId = req.params.id;
            const user = req.user;

            const lead = await leadService.updateLeadByService({ data, leadId, user });
            res.status(201).json({ message: 'Lead Updated successfully', lead });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    saveExcelFileData: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an Excel file.' });
        }

        const filePath = path.join(__dirname, '../uploads/', req.file.filename);
        console.log("Path", filePath);

        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const results = xlsx.utils.sheet_to_json(sheet);

            console.log("Excel Data:", results);

            for (const row of results) {
                if (!row.leadName) {
                    console.error("Missing leadName in row:", row);
                    continue; 
                }
                row.leadId = leadId();
                const leadData = {
                    leadId: row.leadId,
                    leadName: row.leadName,
                    phone: row.phone,
                    email: row.email,
                    address:row.address,
                    website:row.website,
                    customer_feedBack: row.customer_feedBack,
                    followUpDetail: row.followUpDetail,
                };
                await leadService.leadCreateService(leadData, req.user);
            }
            res.status(200).json({ message: 'Leads created successfully', data:results });
        } catch (error) {
            console.error('Error processing the Excel file:', error);
            throw error
        } finally {
            fs.unlinkSync(filePath);
        }
    }

};

module.exports = { leadController };
