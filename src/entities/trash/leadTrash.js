// const { EntitySchema } = require("typeorm");

// module.exports = new EntitySchema({
//   name: "leadsTrash",
//   tableName: "leadsTrash",
//   columns: {
//     id: {
//       type: "int",
//       primary: true,
//       generated: true,
//     },
//     leadId: {
//       type: "int",
//       unique: true,
//     },
//     leadName: {
//       type: "varchar",
//     },
//     address: {
//       type: "text",
//     },
//     phone: {
//       type: "varchar",
//     },
//     website: {
//       type: "varchar",
//     },
//     email: {
//       type: "varchar",
//     },
//     customer_feedBack: {
//       type: "enum",
//       enum: ['onGoing', 'voiceMail', 'hangUp', 'followUp', 'other'],
//     },
//     followUpDetail: {
//       type: "varchar",
//       nullable: true,
//     },
//     otherDetail: {
//       type: "varchar",
//       nullable: true,
//     },
//     role: {
//         type: "varchar",
//     },
//     agentId: {
//       type: 'int',
//       nullable: true,
//     },
 
//     created_at: {
//       type: "timestamp",
//       default: () => "CURRENT_TIMESTAMP",
//     },
//     updated_at: {
//       type: "timestamp",
//       default: () => "CURRENT_TIMESTAMP",
//       onUpdate: "CURRENT_TIMESTAMP",
//     },
//   },
//   relations: {
//     agent: {
//       type: "many-to-one",
//       target: "agent",
//       joinColumn: { name: "agentId", referencedColumnName: "agentId" },
//       onDelete: "SET NULL",
//     },
//   },
// });
