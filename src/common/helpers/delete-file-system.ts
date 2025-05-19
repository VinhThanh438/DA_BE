import path from 'path';
import fs from 'fs';
import logger from '@common/logger';

export async function deleteFileSystem(filesToDelete: string[]) {
    // Set root folder path to project root
    const ROOT_FOLDER = path.join(__dirname, '../../..');

    filesToDelete.forEach((filename) => {
        let filePath;

        if (filename.startsWith('/uploads/') || filename.startsWith('uploads/')) {
            filePath = path.join(ROOT_FOLDER, filename.startsWith('/') ? filename.substring(1) : filename);
        } else {
            filePath = path.join(ROOT_FOLDER, 'uploads', filename);
        }

        logger.info(`remove file -> path = ${filePath}`);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Successfully deleted file: ${filename}`);
        } else {
            logger.warn(`File does not exist: ${filePath}`);
        }
    });
}
