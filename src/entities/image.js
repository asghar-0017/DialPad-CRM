const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Image", // Entity name
  tableName: "image", // Table name in the database
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    image_url: {
      type: "varchar",
      length: 255,
    },
    cloudinary_id: {
      type: "varchar",
      length: 255,
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
