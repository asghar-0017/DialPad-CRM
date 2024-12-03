const dataSource = require("../infrastructure/psql");
const Sheet = require("../entities/createSheet");

const sheetRepository = {
    createSheet: async (data) => {
        try {
            return await dataSource.getRepository(Sheet).save(data);
        } catch (error) {
            console.error("Error saving sheet:", error.message);
            throw error;
        }
    },

    getAllSheets: async () => {
        try {
            return await dataSource.getRepository(Sheet).find();
        } catch (error) {
            console.error("Error fetching sheets:", error.message);
            throw error;
        }
    },

    getSheetById: async (sheetId) => {
        try {
            return await dataSource.getRepository(Sheet).findOne({ where: { sheetId } });
        } catch (error) {
            console.error("Error fetching sheet by ID:", error.message);
            throw error;
        }
    },
};

module.exports = sheetRepository;
