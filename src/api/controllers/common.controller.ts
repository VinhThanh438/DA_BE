import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { generateUniqueCode } from '@common/helpers/generate-unique-code.helper';
import { ModelPrefixMap, ModelStringMaps, PrefixCode } from '@config/app.constant';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { readFile } from 'fs/promises';
import path from 'node:path';

export class CommonController {
    private static resolvePrefixCode(name: string): PrefixCode {
        const entityName = name.toUpperCase();
        const prefix = ModelPrefixMap[entityName];

        if (!prefix) {
            return ModelPrefixMap[PrefixCode.OTHER];
        }

        return prefix;
    }

    public static async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.file;
            res.sendJson(data);
        } catch (error) {
            logger.error('CommonController.uploadFile', error);
            next(error);
        }
    }

    public static async getCode(req: Request, res: Response, next: NextFunction) {
        try {
            const modeName = req.query.type?.toString().toUpperCase();
            if (!modeName || !(modeName in ModelStringMaps)) {
                return next(
                    new APIError({
                        message: 'model.not_found',
                        status: StatusCode.BAD_REQUEST,
                    }),
                );
            }
            let lastRecord = await ModelStringMaps[modeName].findFirst({
                orderBy: {
                    id: 'desc',
                },
                select: {
                    id: true,
                    code: true,
                },
            });
            if (!lastRecord) lastRecord = 0
            const newCode = generateUniqueCode({
                lastCode: lastRecord?.code || null,
                prefix: CommonController.resolvePrefixCode(modeName),
            });
            res.sendJson(newCode);
        } catch (error) {
            logger.error('CommonController.getCode', error);
            next(error);
        }
    }

    public static async getListBank(req: Request, res: Response, next: NextFunction) {
        try {
            const filePath = path.join(process.cwd(), 'data', 'bank.json');
            const fileContent = await readFile(filePath, 'utf8');
            const listBank = JSON.parse(fileContent);
            res.sendJson(listBank);
        } catch (error) {
            logger.error('CommonController.getListBank', error);
            next(error);
        }
    }

    public static async checkBankAccount(req: Request, res: Response, next: NextFunction) {
        try {
            res.sendJson();
        } catch (error) {
            logger.error('CommonController.checkBankAccount', error);
            next(error);
        }
    }
}
