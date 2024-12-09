const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "label",
  tableName: "labels",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    name: {
      type: "varchar",
    },
    sheetId:{
      type:'varchar'
    },
    labelId:{
      type:'varchar'

    },
    color: {
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
