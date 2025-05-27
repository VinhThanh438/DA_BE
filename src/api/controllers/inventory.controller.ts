import { IApproveRequest } from '@common/interfaces/common.interface';
import { BaseController } from './base.controller';
import { Inventories } from '.prisma/client';
import { IInventory } from '@common/interfaces/inventory.interface';
import logger from '@common/logger';
import { InventoryService } from '@common/services/inventory.service';
import { Request, Response, NextFunction } from 'express';

export class InventoryController extends BaseController<Inventories> {
    private static instance: InventoryController;
    protected service: InventoryService;

    private constructor() {
        super(InventoryService.getInstance());
        this.service = InventoryService.getInstance();
    }

    public static getInstance(): InventoryController {
        if (!this.instance) {
            this.instance = new InventoryController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IInventory;
            const result = await this.service.createInventory(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IInventory;
            const data = await this.service.updateInventory(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }

    public async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IApproveRequest;
            const id = Number(req.params.id);
            const result = await this.service.approve(id, body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.approveRequest: `, error);
            next(error);
        }
    }
}
