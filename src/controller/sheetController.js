const sheetRepository = require("../repository/sheetRepository");
const generateSheetId = require("../utils/token");
const generateLeadId = require("../utils/token");
const Lead = require("../entities/lead");
const dataSource = require("../infrastructure/psql");
const Sheet = require("../entities/createSheet");
const Label = require("../entities/labels"); // Assuming the label entity is imported here

const sheetController = {
  createSheet: async (req, res) => {
    try {
      const data = req.body;
      console.log("Data",data)
      data.sheetId = generateSheetId();
      const currentDate = new Date().toLocaleDateString();

      const initialData = [
        {
          lead: "New Lead",
          date: currentDate,
          text: "",
          email: "",
          status: "Lead",
          id: Date.now(),
        },
        {
          lead: "New Lead",
          date: currentDate,
          text: "",
          email: "",
          status: "Lead",
          id: Date.now()+1,
        },
        {
          lead: "New Lead",
          date: currentDate,
          text: "",
          email: "",
          status: "Lead",
          id: Date.now()+2,
        },
      ];

      const columns = [
        { name: "lead", type: "string" },
        { name: "date", type: "date" },
        { name: "text", type: "string" },
        { name: "email", type: "string" },
        { name: "status", type: "string" },
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
        { name: "Lead", sheetId: data.sheetId, color:'#FDBC64'},
        { name: "Qualified", sheetId: data.sheetId,color:'#33BB87'},
        { name: "FollowUp", sheetId: data.sheetId,color:'#339ECD'},
        { name: "Disqualified", sheetId: data.sheetId,color:'#E8697D' },
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
