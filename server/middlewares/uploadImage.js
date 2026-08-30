// Recoit une photo JPG PNG ou WebP, max 5 Mo.
import multer from 'multer';
import path from 'path';
import fs from 'fs';

function createImageUpload(destinationFolder) {
    const storage = multer.diskStorage({
        destination: function (req, file, callBack) {
            fs.mkdirSync(destinationFolder, { recursive: true });
            callBack(null, destinationFolder);
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

    return upload.single('photo');
}

export const uploadRecipePhoto = createImageUpload('uploads/recipes/');
export const uploadCategoryImage = createImageUpload('uploads/categories/');
export const uploadOriginImage = createImageUpload('uploads/origins/');
