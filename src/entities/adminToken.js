const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "AdminToken",
    tableName: "AdminToken",
    columns: {
      id: {
        type: "int",
        primary: true,
        generated: true,
      },
      adminId: {
        type: "int",
      },
      token: {
        type: "varchar",
      },
      createdAt: {
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
      },
    },
    relations: {
      admin: {
        type: "many-to-one",
        target: "auth",
        joinColumn: true,
        onDelete: "CASCADE",
      },
    },
  });
  