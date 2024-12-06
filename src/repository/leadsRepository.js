const dataSource = require("../infrastructure/psql");
const Lead = require("../entities/lead");
const leadsTrash = require("../entities/leadTrash");
const sheetRepo = require('../entities/createSheet')

const leadRepository = {
  saveLead: async (role, leadId, lead) => {
    try {
      const sheetRepository = dataSource.getRepository(sheetRepo);
      const existSheetId = await sheetRepository.findOne({ where: { sheetId: lead.sheetId } });
  
      if (existSheetId) {
        const leadEntity = {
          leadId,
          agentId: lead.agentId || null,
          role,
          dynamicLead: lead.dynamicLead,
          sheetId: lead.sheetId || null,
        };
        return await dataSource.getRepository(Lead).save(leadEntity);
      } else {
        console.error(`Sheet ID not found: ${lead.sheetId}`);
        throw new Error(`Sheet ID not found: ${lead.sheetId}`);
      }
    } catch (error) {
      console.error("Error saving lead:", error.message);
      throw error;
    }
  },
  

  getLeadById: async (leadId) => {
    try {
      return await dataSource.getRepository(Lead).findOneBy({ leadId });
    } catch (error) {
      console.error("Error fetching lead by ID:", error.message);
      throw error;
    }
  },

  updateLead: async (leadId, updates) => {
    try {
      await dataSource.getRepository(Lead).update({ leadId }, updates);
      return await dataSource.getRepository(Lead).findOneBy({ leadId });
    } catch (error) {
      console.error("Error updating lead:", error.message);
      throw error;
    }
  },
  getAllUniqueStatuses: async (sheetId) => {
    try {
      const sheetData = dataSource.getRepository(sheetRepo);
      const existSheet = await sheetData.findOne({ where: { sheetId: sheetId } });
      console.log("ExistingSheet", existSheet);
  
      if (!existSheet) {
        return `Data not found with sheet ID ${sheetId}`;
      }
  
      const query = `
        SELECT DISTINCT("dynamicLead"->>'status') AS status
        FROM leads
        WHERE "sheetId" = $1 AND "dynamicLead"->>'status' IS NOT NULL;
      `;
  
      const result = await dataSource.query(query, [sheetId]);
  
      return result.map((row) => row.status);
    } catch (error) {
      console.error("Error fetching statuses:", error.message);
      throw new Error(`Error fetching statuses for sheet ID ${sheetId}: ${error.message}`);
    }
  },
  
  

  getLeadData: async (sheetId) => {
    try {
      const data = await dataSource.getRepository(Lead).find({where:{sheetId}});
      return data;
    } catch (error) {
      throw error;
    }
  },

  
  delete: async (leadId, user) => {
    try {
      const leadRepository = dataSource.getRepository(Lead);
      const leadTrashRepository = dataSource.getRepository(leadsTrash);

      const leadData = await leadRepository.findOne({ where: { leadId } });
      if (!leadData) {
        console.log("No lead data found for the given leadId");
        return { success: false, message: "No lead data found" };
      }
      const leadEntity = {
        agentId: leadData.agentId,
        role: user.role,
        leadId: leadData.leadId,
        dynamicLead: leadData.dynamicLead,
      };
      const createLeadInTrash = await leadTrashRepository.save(
        leadTrashRepository.create(leadEntity)
      );
      console.log("Created Lead In Trash:", createLeadInTrash);
      await leadRepository.remove(leadData);
      const TrashData = {
        createLeadInTrash,
      };
      return {
        success: true,
        TrashData,
      };
    } catch (error) {
      console.error("Error deleting lead:", error);
      return {
        success: false,
        message: "An error occurred while deleting the lead",
        error,
      };
    }
  },
  getAllLeadsGroupedByLabels: async (sheetId) => {
    try {
      const query = `
        SELECT 
          "dynamicLead"->>'status' AS status,
          json_agg("dynamicLead") AS leads
        FROM leads
        WHERE "dynamicLead"->>'status' IS NOT NULL
          AND "sheetId" = $1
        GROUP BY "dynamicLead"->>'status';
      `;
  
      const result = await dataSource.query(query, [sheetId]);
  
      return result.map(row => ({
        status: row.status, 
        leads: row.leads,
      }));
    } catch (error) {
      console.error("Error fetching leads grouped by statuses for sheetId:", error.message);
      throw new Error(`Error fetching leads for sheet ID ${sheetId}: ${error.message}`);
    }
  },
  

};

module.exports = leadRepository;
