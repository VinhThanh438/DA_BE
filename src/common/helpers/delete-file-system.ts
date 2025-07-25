import path from 'path';
import fs from 'fs';
import logger from '@common/logger';

export async function deleteFileSystem(filesToDelete: string[] | undefined) {
    if (!filesToDelete || filesToDelete.length === 0) {
        logger.info('No files to delete.');
        return;
    }
    // Set root folder path to project root
    const ROOT_FOLDER = path.join(__dirname, '../../..');

    await Promise.all(
        filesToDelete.map(async (filename) => {
            let filePath;

            if (filename.startsWith('/uploads/') || filename.startsWith('uploads/')) {
                filePath = path.join(ROOT_FOLDER, filename.startsWith('/') ? filename.substring(1) : filename);
            } else {
                filePath = path.join(ROOT_FOLDER, 'uploads', filename);
            }

            logger.info(`remove file -> path = ${filePath}`);

            try {
                await fs.promises.access(filePath);
                await fs.promises.unlink(filePath);
                logger.info(`Successfully deleted file: ${filename}`);
            } catch (error) {
                logger.warn(`File does not exist or cannot be deleted: ${filePath}`);
            }
        }),
    );
}
