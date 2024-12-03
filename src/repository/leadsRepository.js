const dataSource = require("../infrastructure/psql");
const Lead = require("../entities/lead");
const leadsTrash = require("../entities/leadTrash");

const leadRepository = {
  saveLead: async (role, leadId, lead) => {
    try {
      const leadEntity = {
        leadId,
        agentId: lead.agentId,
        role,
        dynamicLead: lead.dynamicLead,
        sheetId: lead.sheetId || null

      };

      return await dataSource.getRepository(Lead).save(leadEntity);
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
  getAllUniqueLabels: async () => {
    try {
      const query = `
            SELECT DISTINCT("dynamicLead"->>'label') AS label
            FROM leads
            WHERE "dynamicLead"->>'label' IS NOT NULL;
          `;
      const result = await dataSource.query(query);
      return result.map((row) => row.label);
    } catch (error) {
      console.error("Error fetching labels:", error.message);
      throw error;
    }
  },

  getLeadData: async () => {
    try {
      const data = await dataSource.getRepository(Lead).find();
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
  getAllLeadsGroupedByLabels: async () => {
    try {
      const query = `
        SELECT 
          "dynamicLead"->>'label' AS label,
          json_agg("dynamicLead") AS leads
        FROM leads
        WHERE "dynamicLead"->>'label' IS NOT NULL
        GROUP BY "dynamicLead"->>'label';
      `;
      const result = await dataSource.query(query);
      return result.map(row => ({
        label: row.label,
        leads: row.leads,
      }));
    } catch (error) {
      console.error("Error fetching leads grouped by labels:", error.message);
      throw error;
    }
  }
};

module.exports = leadRepository;
