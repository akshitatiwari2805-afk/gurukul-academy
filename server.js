const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Cloudinary Setup (Aapki photo ke details)
cloudinary.config({
  cloud_name: 'dki9p3gi6', 
  api_key: '934349118624737', 
  api_secret: 'GMREtveY64pWS7qXSs0oDt8X4Ns' // 👈 Yahan apna copy kiya hua secret paste kijiye!
});

// 2. Cloud Storage Configuration for Lifetime Saving
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gurukul_notes', // Cloudinary par ye folder automatic ban jayega
    resource_type: 'auto',   // PDF, Images, Word Docs sab upload ho jayega
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
  },
});

const upload = multer({ storage: storage });

// 3. Database Schema
const fileSchema = new mongoose.Schema({
  name: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// 4. Routes
// Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Cloudinary ka permanent link MongoDB database me save hoga
    const newFile = new File({
      name: req.file.originalname,
      url: req.file.path // Cloudinary Link
    });
    
    await newFile.save();
    res.json({ success: true, file: newFile });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server upload error' });
  }
});

// Fetch Route
app.get('/api/fetch', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server fetch error' });
  }
});

// MongoDB connection string
mongoose.connect('mongodb+srv://akshitatiwari2805:akshi123@cluster0.p4yx.mongodb.net/gurukul?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB Connected & Cloudinary Linked Permanent!'))
  .catch(err => console.error(err));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));