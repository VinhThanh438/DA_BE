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
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            let folderPath: string;

            folderPath = path.join(__dirname, '../../../uploads');

            try {
                await fs.promises.access(folderPath);
            } catch {
                await fs.promises.mkdir(folderPath, { recursive: true });
            }

            const storage = multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, folderPath);
                },
                filename: (req, file, cb) => {
                    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                    const fileExtension = fileName.split('.').pop();
                    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                    const now = Date.now();
                    cb(null, `${fileNameWithoutExt}-${now}.${fileExtension}`);
                },
            });

            const upload = multer({
                storage,
                limits: {
                    fileSize: 20 * 1024 * 1024, // 20MB
                },
            }).any();

            upload(req, res, async (err) => {
                if (err) {
                    logger.error('UploadMiddleware error:', err);

                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return next(
                            new APIError({
                                message: 'common.too-large',
                                status: StatusCode.BAD_REQUEST,
                            }),
                        );
                    }

                    return next(
                        new APIError({
                            message: 'common.upload.error',
                            status: StatusCode.SERVER_ERROR,
                        }),
                    );
                }

                const files = req.files as Express.Multer.File[];
                let keys = req.body.keys;

                if (!Array.isArray(keys)) {
                    keys = keys ? [keys] : [];
                }

                if (!files || files.length !== keys.length) {
                    return next(
                        new APIError({
                            message: 'common.upload.mismatch',
                            status: StatusCode.BAD_REQUEST,
                        }),
                    );
                }

                try {
                    let uploadedUrls: Record<string, string> = {};

                    files.forEach((file, index) => {
                        const fileUrl = `/uploads/${file.filename}`;
                        uploadedUrls[keys[index]] = fileUrl;
                    });

                    res.json(uploadedUrls);
                } catch (error) {
                    logger.error('UploadMiddleware: Error during upload processing:', error);
                    return next(
                        new APIError({
                            message: 'common.upload.failed',
                            status: StatusCode.SERVER_ERROR,
                        }),
                    );
                }
            });
        };
    };
}
