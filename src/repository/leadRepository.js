const dataSource = require("../infrastructure/psql");
const Lead = require('../entities/lead');

const leadRepository = {
    saveLead: async (lead) => {
        try {
            return await dataSource.getRepository(Lead).save(lead);
        } catch (error) {
            throw error;
        }
    },

    getLeadData: async () => {
        try {
            return await dataSource.getRepository(Lead).find();
        } catch (error) {
            throw error;
        }
    },

    updateLeadData: async ({ data, leadId, user }) => {
        try {
            let lead;
            if (user.role === 'agent') {
                lead = await dataSource.getRepository(Lead).findOne({ where: { id: leadId, agent: user.id } });
            } else if (user.role === 'admin') {
                lead = await dataSource.getRepository(Lead).findOne({ where: { id: leadId } });
            }

            if (!lead) {
                throw new Error('Lead not found or does not belong to the agent');
            }

            await dataSource.getRepository(Lead).update({ id: leadId }, data);
            return await dataSource.getRepository(Lead).findOne({ where: { id: leadId } });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = leadRepository;
