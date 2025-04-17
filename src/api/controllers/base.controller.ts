import { IPaginationInput } from '@common/interfaces/common.interface';
import logger from '@common/logger';
import { BaseService } from '@common/services/base.service';
import { Request, Response, NextFunction } from 'express';

export abstract class BaseController<T = any> {
    constructor(protected readonly service: BaseService<T, any, any>) {}

    public async paginate(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPaginationInput;
            const data = await this.service.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }

    public async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as IPaginationInput;
            const data = await this.service.paginate(query);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await this.service.findById(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.getById: `, error);
            next(error);
        }
    }

    public async getCode(req: Request, res: Response, next: NextFunction) {
        try {
            const code = await this.service.getCode();
            res.sendJson(code);
        } catch (error) {
            logger.error(`${this.constructor.name}.getCode: `, error);
            next(error);
        }
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.service.create(req.body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await this.service.update(id, req.body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const data = await this.service.delete(id);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            next(error);
        }
    }
}
