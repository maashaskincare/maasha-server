import Banner from "../models/Banner.js";

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createBanner = async (req, res) => {
  try {
    const image = req.file ? { url: req.file.path, publicId: req.file.filename } : {};
    const banner = await Banner.create({ ...req.body, image });
    res.status(201).json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};