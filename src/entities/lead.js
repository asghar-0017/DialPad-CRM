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
      enum: ['onGoing', 'hangUp', 'followUp'],
    },
    followUpDetail: {
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
  relations: {
    agent: {
      type: "many-to-one",
      target: "agent",
      joinColumn: true,
      nullable: true,
      onDelete: "CASCADE",
    },
    createdByAdmin: {
      type: "many-to-one",
      target: "auth",
      joinColumn: true,
      nullable: true,
      onDelete: "CASCADE",
    },
    followUps: {
      type: "one-to-many",
      target: "followUp",
      mappedBy: "lead",
    },
  },
});
