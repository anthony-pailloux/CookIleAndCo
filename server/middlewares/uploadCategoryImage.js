// JPG/PNG/WebP, max 5 Mo — images catégories.
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, callBack) {
        callBack(null, 'uploads/categories/');
    },
    filename: function (req, file, callBack) {
        const extension = path.extname(file.originalname);
        const uniqueName = Date.now() + extension;
        callBack(null, uniqueName);
    },
});

function fileFilter(req, file, callBack) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        callBack(null, true);
    } else {
        callBack(new Error('Format photo invalide (JPG, PNG ou WebP)'));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter,
});

export default upload.single('photo');