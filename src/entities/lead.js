const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "lead",
  tableName: "leads",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    leadId: {
      type: "int",
      unique: true,
    },
    leadName: {
      type: "varchar",
    },
    address: {
      type: "text",
    },
    phone: {
      type: "varchar",
    },
    website: {
      type: "varchar",
    },
    email: {
      type: "varchar",
    },
    customer_feedBack: {
      type: "enum",
      enum: ['onGoing', 'voiceMail', 'hangUp', 'followUp', 'other'],
    },
    followUpDetail: {
      type: "varchar",
      nullable: true,
    },
    otherDetail: {
      type: "varchar",
      nullable: true,
    },
    role: {
        type: "varchar",
    },
    agentId: {
      type: 'int',
      nullable: true,
    },
    createdByAdmin: {
      type: "int",
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
  relations: {
    createdByAdmin: {
      type: "many-to-one",
      target: "auth",
      joinColumn: { name: "createdByAdmin", referencedColumnName: "id" },
      onDelete: "SET NULL",
    },
    agent: {
      type: "many-to-one",
      target: "agent",
      joinColumn: { name: "agentId", referencedColumnName: "agentId" },
      onDelete: "SET NULL",
    },
  },
});
