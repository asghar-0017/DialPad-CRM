const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "lead",
  tableName: "leads",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    leadId: {
      type: "int",
      unique: true,
    },
    dynamicLead: {
      type: 'jsonb',
      nullable: true,
      name: "dynamicLead"  // Added name to explicitly specify the column name.

    },
    agentId:{
        type: "varchar",
      nullable: true,
    },
    sheetId: {
      type: "varchar",
      nullable: true, 
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
});
