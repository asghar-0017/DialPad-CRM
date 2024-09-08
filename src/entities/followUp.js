const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "followUp",
  tableName: "followUps",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    leadId:{
        type: "varchar",
      nullable:'true'
    },
    agentId:{
      type: "varchar",
    nullable: true,
  },
    dynamicLead:{
      type:'jsonb',
      nullable: true
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
    lead: {
      type: "many-to-one",
      target: "lead",
      joinColumn: { name: "leadId", referencedColumnName: "leadId" },
      onDelete: "CASCADE",
    },
    agent: {
      type: "many-to-one",
      target: "agent",
      joinColumn: { name: "agentId", referencedColumnName: "agentId" },
      onDelete: "SET NULL",
    },
  },
});
