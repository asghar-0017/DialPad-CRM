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
    task: {
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
      joinColumn: {
        name: "agentId",
        referencedColumnName: "agentId"
      },
      onDelete: "CASCADE",
    },
  },
});
