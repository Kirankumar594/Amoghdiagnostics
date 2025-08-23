// controllers/bannerController.js
import Banner from "../models/bannerModel.js";
import { uploadFile2, deleteFile, updateFile } from "../Utils/Aws.upload.js";

export const createBanner = async (req, res) => {
  try {
    const { title, description, cta } = req.body;

    if (!title || !description || !cta || !req.file) {
      return res
        .status(400)
        .json({ message: "All fields including image are required." });
    }

    // Upload to S3
    const imageUrl = await uploadFile2(req.file, "banners");

    const banner = await Banner.create({
      title,
      description,
      cta,
      image: imageUrl,
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { title, description, cta } = req.body;
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (req.file) {
      // Replace old image on S3
      const updatedImageUrl = await updateFile(banner.image, req.file);
      banner.image = updatedImageUrl;
    }

    banner.title = title || banner.title;
    banner.description = description || banner.description;
    banner.cta = cta || banner.cta;

    await banner.save();
    res.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (banner.image) {
      await deleteFile(banner.image);
    }

    await banner.deleteOne();
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ message: error.message });
  }
};
