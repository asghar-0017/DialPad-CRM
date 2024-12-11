const leadService = require("../service/leadsService");
const generateLeadId = require("../utils/token");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const Lead = require('../entities/lead')
const dataSource = require('../infrastructure/psql')


const leadController = {
  createLead: async (req, res) => {
    try {
      const data = req.body;
      data.leadId = generateLeadId();
      const user = req.user;

      const sheetId = req.params.sheetId;
      const lead = await leadService.leadCreateService(data, user, sheetId);
  
      if (!lead || !lead.leadId) {
        return res.status(400).json({ message: "Failed to create lead" });
      }
  
      const { dynamicLead = {} } = lead;
      // io.emit("receive_message", dynamicLead);
      return res.status(200).json({ message: "Lead created successfully", data: lead });
    } catch (error) {
      console.error("Error creating lead:", error.message);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },
      
  updateKeysOnly: async (req, res) => {
    const { sheetId } = req.params;
    const { renameKeys } = req.body;
  
    if (!sheetId) {
      return res.status(400).json({ message: "sheetId is required." });
    }
  
    if (!renameKeys || typeof renameKeys !== "object" || Array.isArray(renameKeys) || Object.keys(renameKeys).length === 0) {
      return res.status(400).json({ 
        message: "renameKeys must be a non-empty object with { oldKey: newKey } pairs." 
      });
    }
    try {
      const sheetRepository = dataSource.getRepository("createSheet");
      const leadRepository = dataSource.getRepository("lead");
        const sheet = await sheetRepository.findOne({ where: { sheetId } });
      if (!sheet) {
        return res.status(404).json({ message: "Sheet not found." });
      }
      const leads = await leadRepository.find({ where: { sheetId } });
      if (!leads || leads.length === 0) {
        return res.status(404).json({ message: "No leads found for the given sheetId." });
      }
        const updatedColumns = [...sheet.columns];
      for (const [oldKey, newKey] of Object.entries(renameKeys)) {
        const oldColumnIndex = updatedColumns.findIndex(col => col.name === oldKey);
        const newColumnExists = updatedColumns.some(col => col.name === newKey);
  
        if (oldColumnIndex !== -1) updatedColumns.splice(oldColumnIndex, 1);
        if (!newColumnExists) updatedColumns.push({ name: newKey, type: "string" });
      }
      sheet.columns = updatedColumns;
      await sheetRepository.save(sheet);
        const updatedLeads = leads.map(lead => {
        const updatedDynamicLead = { ...lead.dynamicLead };
  
        for (const [oldKey, newKey] of Object.entries(renameKeys)) {
          if (updatedDynamicLead.hasOwnProperty(oldKey)) {
            updatedDynamicLead[newKey] = updatedDynamicLead[oldKey];
            delete updatedDynamicLead[oldKey];
          } else if (!updatedDynamicLead.hasOwnProperty(newKey)) {
            updatedDynamicLead[newKey] = ""; 
          }
        }
  
        return { ...lead, dynamicLead: updatedDynamicLead };
      });
        await Promise.all(
        updatedLeads.map(async updatedLead => 
          leadRepository.save({ id: updatedLead.id, dynamicLead: updatedLead.dynamicLead })
        )
      );
  
      return res.status(200).json({
        message: "Keys renamed successfully in leads and sheet columns updated.",
        updatedLeads,
        updatedColumns,
      });
    } catch (error) {
      console.error("Error renaming keys and updating sheet columns:", error);
      return res.status(500).json({ message: error.message });
    }
  },  
  
  updateLeadDynamicFields: async (io, req, res) => {
    try {
      const { leadId } = req.params;
      const updates = req.body;
      const user = req.user;

      const updatedLead = await leadService.updateLeadDynamicFields(
        leadId,
        updates,
        user
      );
      if (!updatedLead) {
        return res.status(400).json({ message: "Failed to update lead" });
      }

      io.emit("lead_updated", updatedLead);
      return res
        .status(200)
        .json({ message: "Lead updated successfully", data: updatedLead });
    } catch (error) {
      console.error("Error updating lead:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  getLabels: async (req, res) => {
    try {
      const sheetId=req.params.sheetId
      console.log("sheetid",sheetId)
      const status = await leadService.getAllLabels(sheetId);
      return res.status(200).json({ message: "Success", data: status });
    } catch (error) {
      console.error("Error fetching labels:", error.message);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  readLead: async (req, res) => {
    try {
      const data = await leadService.leadReadService();

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Data Not Found" });
      }

      const processedData = data.map((lead) => {
        const { dynamicLead = {} } = lead;
        const mergedLead = {
          ...dynamicLead,
        };

        if (mergedLead.role === "admin") {
          delete mergedLead.agentId;
        }

        return mergedLead;
      });
      // io.emit("receive_message", processedData);
      res.status(200).json({ message: "Success", data: processedData });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  readLeadBySheetId: async (req, res) => {
    try {
      const sheetId= req.params.sheetId
      const data = await leadService.leadReadService(sheetId);

      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Data Not Found" });
      }

      const processedData = data.map((lead) => {
        const { dynamicLead = {} } = lead;
        const mergedLead = {
          ...dynamicLead,
        };
        delete mergedLead.sheetId

        if (mergedLead.role === "admin") {
          delete mergedLead.agentId;
        }


        return mergedLead;
      });
      // io.emit("receive_message", processedData);
      res.status(200).json({ message: "Success",sheetId:sheetId, data: processedData });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  deleteLead: async ( req, res) => {
    try {
      const leadId = req.params.leadId;
      console.log("leadId in params", leadId);
      const user = req.user;
      const result = await leadService.deleteLeadById(leadId, user);
      if (!result) {
        return res.status(404).json({ message: "Lead Data not found" });
      }
      res
        .status(200)
        .json({ message: "Lead Data deleted successfully", data: result });
      // io.emit("receive_message", result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  
  getLeadsByLabels: async (req, res) => {
    try {
      const sheetId=req.params.sheetId
      const groupedLeads = await leadService.getLeadsGroupedByLabels(sheetId);
      return res.status(200).json({
        message: "Success",
        data: groupedLeads,
      });
    } catch (error) {
      console.error("Error fetching grouped leads:", error.message);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  saveExcelFileData: async ( req, res) => {
    console.log("API hit for uploading leads CSV");
  
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file." });
    }
  
    const filePath = path.join(__dirname, "../uploads/", req.file.filename);
  
    try {
      const sheetId = req.params.sheetId;
      console.log("Received Sheet ID:", sheetId);
  
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const results = xlsx.utils.sheet_to_json(sheet);
  
      if (!results.length) {
        return res.status(400).json({ message: "No data found in the Excel file." });
      }
  
      const leadCreate = [];
  
      for (const row of results) {
        const leadData = {
          ...row,
          leadId: generateLeadId(),
          sheetId,
        };
  
        console.log("Processing lead data:", leadData);
  
        try {
          const assignedLead = await leadService.leadCreateService(leadData, req.user, sheetId);
  
          if (assignedLead) {
            const { dynamicLead, ...leadDetails } = assignedLead;
            const flattenedLead = { ...leadDetails, ...dynamicLead };
            leadCreate.push(flattenedLead);
          }
        } catch (error) {
          console.error(`Error creating lead for row: ${JSON.stringify(row)}`, error.message);
        }
      }
  
      if (leadCreate.length > 0) {
        // io.emit("send_message", leadCreate);
        return res.status(200).json({
          message: "Leads created successfully",
          data: leadCreate,
        });
      } else {
        return res.status(400).json({
          message: "No leads were created due to missing data or errors.",
        });
      }
    } catch (error) {
      console.error("Error processing the Excel file:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    } finally {
      try {
        fs.unlinkSync(filePath);
        console.log("Temporary file deleted:", filePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError.message);
      }
    }
  },
  
  
  };

module.exports = { leadController };
