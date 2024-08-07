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
    followUpDetail: {
      type: "varchar",
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
  // relations: {
  //   lead: {
  //     type: "many-to-one",
  //     target: "lead",
  //     joinColumn: { name: "leadId", referencedColumnName: "leadId" },
  //     onDelete: "CASCADE",
  //   },
  // },
});
