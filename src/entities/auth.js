const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "auth",
  tableName: "adminauth",
  columns: {
    id: {
        type: "int",
        primary: true,
        generated: true,
      },
      userName: {
        type: "varchar",
      },
      email: {
        type: "varchar",
      },
      password: {
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