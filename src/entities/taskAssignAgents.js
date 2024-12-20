const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "agentsTaskAssign",
  tableName: "agentsTaskAssign",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    // agentId: {
    //   type: "varchar",
    // },
    leadId: {
      type: "varchar",
    },
    DynamicData: {
      type: 'jsonb',
      nullable: true,
    },
    // taskNo: {
    //   type: "int", 
    // },
    
    // deadLine: {
    //   type: "timestamp",
    // },
    // priority: {
    //   type: "int", 
    // },
    status: {
      type: "enum",
      enum: ["progress", "complete"], 
      default: "progress",
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
