const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "adminMessage",
  tableName: "admin_message",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    adminId: {
      type: "int",
    },
    agentId: {
      type: "int",
    },
    messageId: {
      type: "varchar",
    },
    message: {
      type: "text",
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
  relations: {
    // admin: {
    //   type: "many-to-one",
    //   target: "auth",
    //   joinColumn: {
    //     name: "adminId",
    //     referencedColumnName: "adminId",
    //   },
    //   onDelete: "CASCADE",
    // },
    // agent: {
    //   type: "many-to-one",
    //   target: "agent",
    //   joinColumn: {
    //     name: "agentId",
    //     referencedColumnName: "agentId",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
});
