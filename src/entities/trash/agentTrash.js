const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "agentTrash",
  tableName: "agentTrash",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    agentId: {
      type: "int",
      unique: true,
    },
    firstName: {
      type: "varchar",
      nullable: true,
    },
    lastName: {
      type: "varchar",
      nullable: true,
    },
    email: {
      type: "varchar",
      nullable: true,
    },
    phone: {
      type: "varchar",
      nullable: true,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    role: {
      type: "varchar",
      default: "agent",
    },
    verifyToken:{
      type: "varchar",
      default: ''
    },
    resetCode:{
      type: "varchar",
      default: ''
    },
    isActivated:{
    type: Boolean,
    default: true
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
    leads: {
      type: "one-to-many",
      target: "lead",
      mappedBy: "agent",
    },
    followUps: {
      type: "one-to-many",
      target: "followUp",
      mappedBy: "agent",
    },
    // agentMessages: {
    //   type: "one-to-many",
    //   target: "agentMessage",
    //   mappedBy: "agent",
    // },
    // adminMessages: {
    //   type: "one-to-many",
    //   target: "adminMessage",
    //   mappedBy: "agent",
    // },
  },
});
