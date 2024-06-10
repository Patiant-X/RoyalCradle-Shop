import path from 'path';
import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    console.log('Setting filename');
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const videoFileFilter = (req, file, cb) => {
  console.log('Filtering file');
  const filetypes = /mp4|mkv|webm|avi/;
  const mimetypes = /video\/mp4|video\/x-matroska|video\/webm|video\/x-msvideo/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Videos only!'), false);
  }
};
function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const audioFileFilter = (req, file, cb) => {
  console.log('Filtering audio file');
  const filetypes = /mp3|wav|ogg|flac/;
  const mimetypes = /audio\/mpeg|audio\/wav|audio\/ogg|audio\/flac/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Audio files only!'), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single('image');

const uploadVideo = multer({ storage, fileFilter: videoFileFilter });
const uploadSingleVideo = uploadVideo.single('video');

const uploadAudio = multer({ storage, fileFilter: audioFileFilter });
const uploadSingleAudio = uploadAudio.single('audio');

router.post('/', (req, res) => {
  uploadSingleImage(req, res, async function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    if (req.file) {
      //Save image to cloudinary
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: req.body.restaurantName.toUpperCase().replace(/\s+/g, ''),
          resource_type: 'image',
          quality: 'auto:good',
          width: 640,
          height: 510,
        });
        console.log('image uploaded proper');
      } catch (error) {
        res.status(500).json(error);
        return;
      }
      res.status(200).send({
        message: 'Image uploaded successfully',
        image: `${uploadedFile.secure_url}`,
      });
      return;
    } else {
      res.status(400).json({ error: 'Failed to upload Image' });
    }
  });
});

router.post('/video', (req, res) => {
  console.log('Received upload request');
  uploadSingleVideo(req, res, async function (err) {
    if (err) {
      console.log('Multer error:', err);
      return res.status(400).send({ message: err.message });
    }

    if (req.file) {
      console.log('File received:', req.file);
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: req.body.restaurantName.toUpperCase().replace(/\s+/g, ''),
          resource_type: 'video',
        });
      } catch (error) {
        res.status(500).json(error);
        return;
      }
      res.status(200).send({
        message: 'Video uploaded successfully',
        video: `${uploadedFile.secure_url}`,
      });
    } else {
      res.status(400).json({ error: 'Failed to upload video' });
    }
  });
});

router.post('/audio', (req, res) => {
  console.log('Received audio upload request');
  uploadSingleAudio(req, res, async function (err) {
    if (err) {
      console.log('Multer error:', err);
      return res.status(400).send({ message: err.message });
    }

    if (req.file) {
      console.log('Audio file received:', req.file);
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: req.body.restaurantName.toUpperCase().replace(/\s+/g, ''),
          resource_type: 'auto',
        });
      } catch (error) {
        res.status(500).json(error);
        return;
      }
      res.status(200).send({
        message: 'Audio uploaded successfully',
        audio: `${uploadedFile.secure_url}`,
      });
    } else {
      res.status(400).json({ error: 'Failed to upload audio' });
    }
  });
});

export default router;
