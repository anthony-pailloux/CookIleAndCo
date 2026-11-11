// Lit la largeur et la hauteur d'un fichier photo déjà enregistré.
// JPEG, PNG, WebP ou GIF. Si le format n'est pas lisible, on n'invente pas de taille.
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const utilsDir = path.dirname(fileURLToPath(import.meta.url));
const recipesUploadDir = path.join(utilsDir, '..', 'uploads', 'recipes');

function readUInt16BE(buffer, offset) {
    return buffer.readUInt16BE(offset);
}

function readUInt16LE(buffer, offset) {
    return buffer.readUInt16LE(offset);
}

function readUInt24LE(buffer, offset) {
    const low = buffer[offset];
    const mid = buffer[offset + 1];
    const high = buffer[offset + 2];

    return low + (mid * 256) + (high * 65536);
}

function readUInt32BE(buffer, offset) {
    return buffer.readUInt32BE(offset);
}

function readUInt32LE(buffer, offset) {
    return buffer.readUInt32LE(offset);
}

function usableSize(width, height) {
    if (Number.isInteger(width) === false || Number.isInteger(height) === false) {
        return null;
    }

    if (width <= 0 || height <= 0) {
        return null;
    }

    // Au-delà, l'en-tête est incohérent : on omet plutôt que d'inventer.
    if (width > 20000 || height > 20000) {
        return null;
    }

    return {
        width: width,
        height: height,
    };
}

function readPngSize(buffer) {
    if (buffer.length < 24) {
        return null;
    }

    const isPng = buffer[0] === 0x89
        && buffer[1] === 0x50
        && buffer[2] === 0x4e
        && buffer[3] === 0x47
        && buffer[4] === 0x0d
        && buffer[5] === 0x0a
        && buffer[6] === 0x1a
        && buffer[7] === 0x0a;

    if (isPng === false) {
        return null;
    }

    const chunkType = buffer.toString('ascii', 12, 16);

    if (chunkType !== 'IHDR') {
        return null;
    }

    return usableSize(readUInt32BE(buffer, 16), readUInt32BE(buffer, 20));
}

function readGifSize(buffer) {
    if (buffer.length < 10) {
        return null;
    }

    const header = buffer.toString('ascii', 0, 6);

    if (header !== 'GIF87a' && header !== 'GIF89a') {
        return null;
    }

    return usableSize(readUInt16LE(buffer, 6), readUInt16LE(buffer, 8));
}

function readWebpSize(buffer) {
    if (buffer.length < 30) {
        return null;
    }

    if (buffer.toString('ascii', 0, 4) !== 'RIFF') {
        return null;
    }

    if (buffer.toString('ascii', 8, 12) !== 'WEBP') {
        return null;
    }

    const chunk = buffer.toString('ascii', 12, 16);

    // WebP étendu : largeur et hauteur du canevas, moins 1, sur 24 bits.
    if (chunk === 'VP8X') {
        const width = 1 + readUInt24LE(buffer, 24);
        const height = 1 + readUInt24LE(buffer, 27);

        return usableSize(width, height);
    }

    // WebP avec perte : code de départ puis 14 bits de largeur et de hauteur.
    if (chunk === 'VP8 ') {
        const hasStartCode = buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a;

        if (hasStartCode === false) {
            return null;
        }

        const width = readUInt16LE(buffer, 26) & 0x3fff;
        const height = readUInt16LE(buffer, 28) & 0x3fff;

        return usableSize(width, height);
    }

    // WebP sans perte : signature 0x2f, puis largeur et hauteur moins 1 sur 14 bits.
    if (chunk === 'VP8L') {
        if (buffer[20] !== 0x2f) {
            return null;
        }

        const bits = readUInt32LE(buffer, 21);
        const width = (bits & 0x3fff) + 1;
        const height = ((bits >> 14) & 0x3fff) + 1;

        return usableSize(width, height);
    }

    return null;
}

function isJpegStartOfFrame(marker) {
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3) {
        return true;
    }

    if (marker === 0xc5 || marker === 0xc6 || marker === 0xc7) {
        return true;
    }

    if (marker === 0xc9 || marker === 0xca || marker === 0xcb) {
        return true;
    }

    if (marker === 0xcd || marker === 0xce || marker === 0xcf) {
        return true;
    }

    return false;
}

function readJpegSize(buffer) {
    if (buffer.length < 4) {
        return null;
    }

    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return null;
    }

    let offset = 2;
    let size = null;

    while (size === null && offset + 1 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset = buffer.length;
        } else {
            while (offset < buffer.length && buffer[offset] === 0xff) {
                offset = offset + 1;
            }

            if (offset >= buffer.length) {
                offset = buffer.length;
            } else {
                const marker = buffer[offset];
                offset = offset + 1;

                const isStandalone = marker === 0xd8
                    || marker === 0xd9
                    || (marker >= 0xd0 && marker <= 0xd7);

                if (isStandalone) {
                    // Marqueur sans longueur : on passe au suivant.
                } else if (marker === 0xda || offset + 1 >= buffer.length) {
                    // Début du scan, ou fichier coupé : plus de taille à lire.
                    offset = buffer.length;
                } else {
                    const segmentLength = readUInt16BE(buffer, offset);

                    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
                        offset = buffer.length;
                    } else if (isJpegStartOfFrame(marker)) {
                        if (segmentLength < 8) {
                            offset = buffer.length;
                        } else {
                            const height = readUInt16BE(buffer, offset + 3);
                            const width = readUInt16BE(buffer, offset + 5);
                            size = usableSize(width, height);
                            offset = buffer.length;
                        }
                    } else {
                        offset = offset + segmentLength;
                    }
                }
            }
        }
    }

    return size;
}

function readImageSize(buffer) {
    let size = readPngSize(buffer);

    if (size === null) {
        size = readGifSize(buffer);
    }

    if (size === null) {
        size = readWebpSize(buffer);
    }

    if (size === null) {
        size = readJpegSize(buffer);
    }

    return size;
}

function recipePhotoAbsolutePath(photo) {
    if (typeof photo !== 'string' || photo === '') {
        return null;
    }

    const prefix = '/uploads/recipes/';

    if (photo.startsWith(prefix) === false) {
        return null;
    }

    const filename = photo.slice(prefix.length);
    const hasForbiddenChar = filename === ''
        || filename.indexOf('/') !== -1
        || filename.indexOf('\\') !== -1
        || filename.indexOf('..') !== -1;

    if (hasForbiddenChar) {
        return null;
    }

    return path.join(recipesUploadDir, filename);
}

export async function readRecipePhotoDimensions(photo) {
    const filePath = recipePhotoAbsolutePath(photo);

    if (filePath === null) {
        return null;
    }

    let buffer = null;

    try {
        buffer = await fs.readFile(filePath);
    } catch {
        buffer = null;
    }

    if (buffer === null) {
        return null;
    }

    const size = readImageSize(buffer);

    if (size === null) {
        return null;
    }

    console.log('photo recette — dimensions: ' + size.width + ' ' + size.height);

    return size;
}
