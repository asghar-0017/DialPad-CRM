const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "createSheet",
    tableName: "createSheet",
    columns: {
      id: {
        type: "int",
        primary: true,
        generated: true,
      },
      sheetId:{type:'varchar'},
      sheetName: { type: "varchar" },
      columns: {
        type: "jsonb", 
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
    }
  });

