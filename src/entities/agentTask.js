const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "agentTask",
  tableName: "agentTask",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    agentId: {
      type: "varchar",
    },
    taskId: {
      type: "varchar",
    },
    // name: {
    //   type: 'varchar',
    //   nullable: true,
    // },
    // address: {
    //   type: 'varchar',
    //   nullable: true,
    // },
    // phoneNumber: {
    //   type: "varchar",
    //   nullable: true,
    // },
    // Website:{
    //   type: "varchar",
    //   nullable: true,
    // },
    // email:{
    //   type: "varchar",
    //   nullable: true,
    // },
    // CustomerFeedBack: {
    //   type: "enum",
    //   enum: ['onGoing', 'voiceMail', 'hangUp', 'followUp', 'other'],
    //   nullable: true,
    // },
    // FollowUpDetail: {
    //   type: "varchar",
    //   nullable: true,
    // },
    // OtherDetail: {
    //   type: "varchar",
    //   nullable: true,
    // },
    DynamicData:{
      type: 'jsonb',
      nullable: true,
    },
    taskNo: {
      type: "int", // Changed type to int
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
    agent: {
      type: "many-to-one",
      target: "agent",
      joinColumn: {
        name: "agentId",
        referencedColumnName: "agentId",
      },
      onDelete: "CASCADE",
    },
  },
});
