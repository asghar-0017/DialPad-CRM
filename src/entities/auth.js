const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "auth",
  tableName: "adminAuth",
  columns: {
    id: {
        type: "int",
        primary: true,
        generated: true,
      },
      adminId:{
        type: "int",
        unique:true
      },
      userName: {
        type: "varchar",
      },
      email: {
        type: "varchar",
      },
      password: {
        type: "varchar",
        nullable: true,
      },
      role: {
        type: "varchar",
        default: "admin",
      },
      verifyToken:{
        type: "varchar",
        default: ''
      },
      resetCode:{
        type: "varchar",
        default: ''
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