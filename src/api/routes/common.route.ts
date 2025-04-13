import { UploadMiddleware } from '@api/middlewares/upload.middleware';
import logger from '@common/logger';
import express, { NextFunction, Request, Response } from 'express';
import { readFile } from 'fs/promises';
import path from 'node:path';
const router = express.Router();

router.post('/uploads', UploadMiddleware.uploadFiles, (req: Request, res: Response) => {
    const data = req.file;
    res.sendJson(data);
});
router.get('/get-list-bank', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filePath = path.join(process.cwd(), 'data', 'bank.json');
        const fileContent = await readFile(filePath, 'utf8');
        const listBank = JSON.parse(fileContent);
        res.sendJson(listBank);
    } catch (error) {
        logger.error('Error reading bank list:', error);
        next(error);
    }
});
router.post('/check-bank-account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.sendJson()
    } catch (error) {
        logger.error('Error resolving account:', error);
        next(error);
    }
});

export default router;
