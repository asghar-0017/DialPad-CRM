const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "followUpTrash",
  tableName: "followUpTrash",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    followUpDetail: {
      type: "varchar",
      nullable: true,
    },
    leadId: {
      type: "int",
    },
    leadName: {
      type: "varchar",
    },
    phone: {
      type: "varchar",
    },
    email: {
      type: "varchar",
    },
    role: {
      type: "varchar",
    },
    agentId: {
      type: "int",
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
  relations: {
    lead: {
      type: "many-to-one",
      target: "lead",
      joinColumn: { name: "leadId", referencedColumnName: "leadId" },
      onDelete: "CASCADE",
    },
    // createdByAdmin: {
    //   type: "many-to-one",
    //   target: "auth",
    //   joinColumn: { name: "createdByAdmin", referencedColumnName: "id" },
    //   onDelete: "SET NULL",
    // },
    // agent: {
    //   type: "many-to-one",
    //   target: "agent",
    //   joinColumn: { name: "agentId", referencedColumnName: "agentId" },
    //   onDelete: "SET NULL",
    // },
  },
});
