const sheetRepository = require("../repository/sheetRepository");
const generateSheetId = require("../utils/token");
const generateLeadId = require("../utils/token");
const Lead = require("../entities/lead");
const dataSource = require("../infrastructure/psql");
const Sheet = require("../entities/createSheet");
const Label = require("../entities/labels"); // Assuming the label entity is imported here

const sheetController = {
  createSheet: async (io, req, res) => {
    try {
      const data = req.body;
      data.sheetId = generateSheetId();
      const currentDate = new Date().toLocaleDateString();

      const initialData = [
        {
          Lead: "New Lead",
          Date: currentDate,
          Text: "",
          Email: "",
          Status: "Lead",
          id: Date.now(),
        },
        {
          Lead: "New Lead",
          Date: currentDate,
          Text: "",
          Email: "",
          Status: "Lead",
          id: Date.now(),
        },
        {
          Lead: "New Lead",
          Date: currentDate,
          Text: "",
          Email: "",
          Status: "Lead",
          id: Date.now(),
        },
      ];

      const columns = [
        { name: "Lead", type: "string" },
        { name: "Date", type: "date" },
        { name: "Text", type: "string" },
        { name: "Email", type: "string" },
        { name: "Status", type: "string" },
      ];

      const sheetEntity = {
        sheetId: data.sheetId,
        sheetName: data.sheetName,
        columns: columns,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const sheet = await sheetRepository.createSheet(sheetEntity);
      const initialLabels = [
        { name: "Lead", sheetId: data.sheetId },
        { name: "Qualified", sheetId: data.sheetId },
        { name: "FollowUp", sheetId: data.sheetId },
        { name: "Disqualified", sheetId: data.sheetId },
      ];

      const labelRepository = dataSource.getRepository('label'); 
      const existingLabels = await labelRepository.find({ where: { sheetId: data.sheetId } });

      const newLabels = initialLabels.map(label => {
        return {
          ...label,
          labelId: generateSheetId(), 
        };
      });
      const labelsToCreate = newLabels.filter(newLabel => {
        return !existingLabels.some(existingLabel => existingLabel.name === newLabel.name);
      });

      if (labelsToCreate.length > 0) {
        const createdLabels = await labelRepository.save(labelsToCreate);
        console.log("Created Labels:", createdLabels); 
      }
      const leads = [];
      for (const item of initialData) {
        const leadId = generateLeadId();
        const leadEntity = {
          leadId,
          agentId: req.user.agentId || null,
          role: req.user.user,
          dynamicLead: { ...item, leadId },
          sheetId: data.sheetId,
        };
        const savedLead = await dataSource.getRepository(Lead).save(leadEntity);
        leads.push(savedLead);
      }

      return res.status(201).json({
        message: "Sheet created successfully",
        leads,
        sheet,
        labels: labelsToCreate.length > 0 ? labelsToCreate : "No new labels added",
      });
    } catch (error) {
      console.error("Error creating sheet:", error.message);
      return res.status(500).json({ message: error.message });
    }
  },

  updateKeysOnly: async (req, res) => {
    try {
      const { sheetId, newKeys } = req.body;
  
      if (!sheetId || !Array.isArray(newKeys)) {
        return res.status(400).json({ message: "Invalid input. Provide 'sheetId' and 'newKeys' array." });
      }
  
      const leadRepository = dataSource.getRepository(Lead);
      const leads = await leadRepository.find({ where: { sheetId } });
  
      if (!leads.length) {
        return res.status(404).json({ message: "No leads found for the given sheetId." });
      }
  
      const defaultValues = {};
      newKeys.forEach(key => {
        defaultValues[key] = ""; // Default value for new keys
      });
  
      const updatedLeads = leads.map(lead => ({
        ...lead.dynamicLead,
        ...defaultValues, // Add new keys with default values
      }));
  
      for (const updatedLead of updatedLeads) {
        await leadRepository.update({ leadId: updatedLead.leadId }, { dynamicLead: updatedLead });
      }
  
      return res.status(200).json({ message: "Keys updated successfully", updatedLeads });
    } catch (error) {
      console.error("Error updating keys:", error.message);
      return res.status(500).json({ message: error.message });
    }
  },
  
  getAllSheets: async (req, res) => {
    try {
      const sheets = await sheetRepository.getAllSheets();
      return res
        .status(200)
        .json({ message: "Sheets retrieved successfully", data: sheets });
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
      return res
        .status(200)
        .json({ message: "Sheet retrieved successfully", data: sheet });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getSheetColumns: async (req, res) => {
    try {
      const { sheetId } = req.params;
      const sheet = await sheetRepository.getSheetById(sheetId);
      if (!sheet) {
        return res.status(404).json({ message: "Sheet not found" });
      }
      return res
        .status(200)
        .json({
          message: "Columns retrieved successfully",
          columns: sheet.columns,
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  addColumn: async (req, res) => {
    try {
        const { sheetId } = req.params;
        const { newColumn } = req.body;
        if (!newColumn || !newColumn.name || !newColumn.type) {
            return res.status(400).json({
                message: "Invalid column data. Provide 'name' and 'type'."
            });
        }
        const sheetRepository = dataSource.getRepository(Sheet);
        const sheet = await sheetRepository.findOne({ where: { sheetId: sheetId } });
        if (!sheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }
        const columnExists = sheet.columns.some(column => column.name === newColumn.name);
        if (columnExists) {
            return res.status(400).json({
                message: `Column '${newColumn.name}' already exists.`
            });
        }
        sheet.columns.push(newColumn);
        sheet.updated_at = new Date();
        const updatedSheet = await sheetRepository.save(sheet);
        return res.status(200).json({
            message: "Column added successfully",
            columns: updatedSheet.columns
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
},


  updateSheetColumns: async (req, res) => {
    try {
        const { sheetId } = req.params;
        const { columnsToUpdate } = req.body;

        if (!Array.isArray(columnsToUpdate)) {
            return res.status(400).json({
                message: "Invalid input. Provide an array of columns to update."
            });
        }

        const sheet = await sheetRepository.getSheetById(sheetId);
        if (!sheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }

        const updatedColumns = sheet.columns.map((existingColumn) => {
            const update = columnsToUpdate.find(col => col.name === existingColumn.name);
            if (update) {
                return {
                    name: update.newName || existingColumn.name,
                    type: update.type || existingColumn.type 
                };
            }
            return existingColumn; 
        });
        sheet.columns = updatedColumns;
        sheet.updated_at = new Date();
        const updatedSheet = await sheetRepository.save(sheet);
        return res.status(200).json({
            message: "Columns updated successfully",
            columns: updatedSheet.columns
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
},

};

module.exports = sheetController;
