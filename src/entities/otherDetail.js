const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "other",
  tableName: "other",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    otherDetail: {
      type: "varchar",
      nullable: true
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
