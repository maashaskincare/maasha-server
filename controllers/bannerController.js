import Banner from "../models/Banner.js";

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createBanner = async (req, res) => {
  try {
    let image = {};
    
    // If file uploaded via multer
    if (req.file) {
      image = { url: req.file.path, publicId: req.file.filename };
    }
    // If image URL sent directly (from separate upload)
    else if (req.body.image) {
      image = { url: req.body.image, publicId: '' };
    }
    
    const banner = await Banner.create({ 
      title: req.body.title,
      subtitle: req.body.subtitle,
      link: req.body.link,
      isActive: req.body.active ?? req.body.isActive ?? true,
      order: req.body.order || 0,
      image 
    });
    res.status(201).json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateBanner = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.image && typeof req.body.image === 'string') {
      updateData.image = { url: req.body.image, publicId: '' };
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
