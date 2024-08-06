const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "followUp",
  tableName: "followUp",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    followUpDeail:{
      type: "int",
      primary: true,
      unique:true
    },
    leadName: {
      type: "varchar",
      nullable:true,
    },
    phone: {
      type: "varchar",
      nullable:true,
    },
    email: {
      type: "varchar",
      nullable:true,

    },
    agentName:{
     type:"varchar",
     nullable:true,//if create admin then adminName else agentName

    },
    role: {
      type: "varchar",
      default: "agent", 
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
