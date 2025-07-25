import { MeshService } from '@common/services/mesh.service';
import { NextFunction, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Mesh } from '.prisma/client';
import logger from '@common/logger';
import { ICreateMesh, IUpdateMesh } from '@common/interfaces/mesh.interface';

export class MeshController extends BaseController<Mesh> {
    private static instance: MeshController;
    protected service: MeshService;

    private constructor() {
        super(MeshService.getInstance());
        this.service = MeshService.getInstance();
    }

    static getInstance(): MeshController {
        if (!this.instance) {
            this.instance = new MeshController();
        }
        return this.instance;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as ICreateMesh;
            const output = await this.service.create(body);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IUpdateMesh;
            const { id } = req.params;
            const output = await this.service.update(Number(id), body);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    // async paginate(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const output = await this.service.paginate({ ...req.query, isPublic: true });
    //         res.sendJson(output);
    //     } catch (error) {
    //         logger.error(`${this.constructor.name}.paginate: `, error);
    //         next(error);
    //     }
    // }
}
