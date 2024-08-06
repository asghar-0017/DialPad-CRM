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
    leadId:{
      type:"int",
      unique:true,
      
    },
    leadName: {
      type: "varchar",
    },
    leadDetails: {
      type: "text",
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
  relations: {
    agent: {
      type: "many-to-one",
      target: "agent",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});
