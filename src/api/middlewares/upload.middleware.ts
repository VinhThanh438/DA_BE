import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { StatusCode } from '@common/errors';
import { APIError } from '@common/error/api.error';
import logger from '@common/logger';

export class UploadMiddleware {
    public static uploadFiles = () => {
        /**
         * Middleware to handle file uploads.
         *
         * This function initializes a multer storage engine to store uploaded files in a specified directory.
         * It validates the number of uploaded files against the provided keys and returns a JSON response
         * containing the uploaded file URLs.
         *
         * @returns {Function} Express middleware function
         */
        return (req: Request, res: Response, next: NextFunction) => {
            let folderPath: string;

            folderPath = path.join(__dirname, '../../../uploads/file');

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const storage = multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, folderPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
                    cb(null, uniqueSuffix);
                },
            });

            const upload = multer({ storage }).array('files', 10);

            upload(req, res, async (err) => {
                if (err) {
                    logger.error('Upload error:', err);
                    throw new APIError({
                        message: 'common.upload.error',
                        status: StatusCode.SERVER_ERROR,
                    });
                }

                const files = req.files as Express.Multer.File[];
                let keys = req.body.keys;

                if (!Array.isArray(keys)) {
                    keys = keys ? [keys] : [];
                }

                if (files.length !== keys.length) {
                    throw new APIError({
                        message: 'common.upload.mismatch',
                        status: StatusCode.BAD_REQUEST,
                    });
                }

                try {
                    let uploadedUrls: Record<string, string> = {};

                    files.forEach((file, index) => {
                        const fileUrl = `/uploads/${file.filename}`;
                        uploadedUrls[keys[index]] = fileUrl;
                    });
                    res.sendJson(uploadedUrls);
                } catch (error) {
                    logger.error('Error during upload processing:', error);
                    throw new APIError({
                        message: 'common.upload.failed',
                        status: StatusCode.SERVER_ERROR,
                    });
                }
            });
        };
    };
}
