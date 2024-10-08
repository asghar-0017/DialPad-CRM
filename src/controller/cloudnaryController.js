const cloudinary = require("cloudinary").v2;
const dataSource = require("../infrastructure/psql");
const Image = require("../entities/image");
const cloudinaryController = {
  uploadImage: async (req, res) => {
    try {
      console.log("API Hit");
      if (!req.file) {
        return res.status(400).send({ message: "No file uploaded" });
      }
      const result = await cloudinary.uploader.upload(req.file.path);

      const imageRepository = await dataSource.getRepository(Image);
      const newImage = imageRepository.create({
        image_url: result.secure_url,
        cloudinary_id: result.public_id,
      });

      await imageRepository.save(newImage);

      res.status(200).send({
        message: "Image uploaded successfully",
        url: result.secure_url,
        id: newImage.id,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).send({ message: "Image upload failed", error });
    }
  },

  getImageFromCloudnary: async (req, res) => {
    try {
      const { id } = req.params;
      const imageRepository = await dataSource.getRepository(Image);
      const image = await imageRepository.findOne({ where: { id } });

      if (!image) {
        return res.status(404).send({ message: "Image not found" });
      }

      res.status(200).send({
        message: "Image retrieved successfully",
        url: image.image_url,
      });
    } catch (error) {
      console.error("Error retrieving image:", error);
      res.status(500).send({ message: "Error retrieving image", error });
    }
  },
};

module.exports = cloudinaryController;
