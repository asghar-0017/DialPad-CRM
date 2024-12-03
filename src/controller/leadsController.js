const leadService = require("../service/leadsService");
const generateLeadId = require("../utils/token");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const leadController = {
    createLead: async (io, req, res) => {
        try {
          const data=req.body
          data.leadId = generateLeadId();
          const user = req.user;
          const sheetId = req.params.sheetId;
          const lead = await leadService.leadCreateService(data, user, sheetId);
          if (!lead) {
            return res.status(400).json({ message: "Failed to create lead" });
          }
          const { dynamicLead = {} } = lead;
          io.emit("receive_message", dynamicLead);
          return res.status(200).json({ message: "Lead created successfully", data: lead });
        } catch (error) {
          console.error("Error creating lead:", error);
          return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
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
      const labels = await leadService.getAllLabels();
      return res.status(200).json({ message: "Success", data: labels });
    } catch (error) {
      console.error("Error fetching labels:", error.message);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  readLead: async (io, req, res) => {
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
      io.emit("receive_message", processedData);
      res.status(200).json({ message: "Success", data: processedData });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  deleteLead: async (io, req, res) => {
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
      io.emit("receive_message", result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  getLeadsByLabels: async (req, res) => {
    try {
      const groupedLeads = await leadService.getLeadsGroupedByLabels();
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

  saveExcelFileData: async (io, req, res) => {
    if (!req.file || !req.body.sheetName) {
      return res.status(400).json({ message: "Please upload an Excel file and specify a sheet name." });
    }
    const { sheetName } = req.body;
    const filePath = path.join(__dirname, "../uploads/", req.file.filename);
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
      if (!sheetData.length) {
        return res.status(400).json({ message: "No data found in the Excel file." });
      }
      const leadCreate = [];
      for (const row of sheetData) {
        const leadData = {
          ...row,
          leadId: generateLeadId(),
          sheetName,
        };
        try {
          const assignedLead = await leadService.leadCreateService(sheetName, leadData, req.user);
          if (assignedLead) {
            const { dynamicLead, ...leadDetails } = assignedLead;
            leadCreate.push({ ...leadDetails, ...dynamicLead });
          }
        } catch (error) {
          console.error(`Error creating lead for row: ${JSON.stringify(row)}`, error.message);
        }
      }
  
      if (leadCreate.length > 0) {
        io.emit("send_message", leadCreate);
        return res.status(200).json({
          message: "Leads created successfully",
          data: leadCreate,
        });
      } else {
        return res.status(400).json({ message: "No leads were created." });
      }
    } catch (error) {
      console.error("Error processing the Excel file:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
      fs.unlinkSync(filePath);
    }
  },
  
  getLeadsForSheet: async (req, res) => {
    try {
      const { sheetId } = req.params;
      const leads = await leadService.getLeadsBySheetId(sheetId);

      if (!leads || leads.length === 0) {
        return res.status(404).json({ message: "No leads found for this sheet" });
      }
      const processedData = leads.map((lead) => {
        const { dynamicLead = {} } = lead;
        const mergedLead = {
          ...dynamicLead,
        };

        return mergedLead;
      });

      return res.status(200).json({ message: "Leads retrieved successfully",steetId:processedData[0].sheetId, data: processedData });
    } catch (error) {
      console.error("Error fetching leads for sheet:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },
};

module.exports = { leadController };
