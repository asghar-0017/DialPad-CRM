const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "agentReview",
  tableName: "agentReview",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    agentId: {
      type: "varchar",
    },
    reviewId: {
      type: "varchar",
    },
    review: {
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
        referencedColumnName: "agentId",
      },
      onDelete: "CASCADE",
    },
    // task: { // Add relation to agentTask based on taskNo
    //   type: "many-to-one",
    //   target: "agentTask", // Reference agentTask entity
    //   joinColumn: {
    //     name: "taskNo", // Reference the taskNo field in agentReview
    //     referencedColumnName: "taskNo", // Reference the taskNo column in agentTask
    //   },
    //   onDelete: "SET NULL", // Optional: Handle task deletion
    // },
  },
});
