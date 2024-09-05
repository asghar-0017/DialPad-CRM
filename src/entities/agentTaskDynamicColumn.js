// const { EntitySchema } = require('typeorm');

// module.exports = new EntitySchema({
//   name: 'agentTaskDynamicData',
//   tableName: 'agentTaskDynamicData',
//   columns: {
//     id: {
//       type: 'int',
//       primary: true,
//       generated: true,
//     },
//     agentTaskId: {
//       type: 'int',
//     },
//     columnName: {
//       type: 'varchar',
//     },
//     value: {
//       type: 'varchar',
//     },
//   },
//   relations: {
//     agentTask: {
//       type: 'many-to-one',
//       target: 'agentTask',
//       joinColumn: {
//         name: 'agentTaskId',
//         referencedColumnName: 'id',
//       },
//       onDelete: 'CASCADE',
//     },
//   },
// });
