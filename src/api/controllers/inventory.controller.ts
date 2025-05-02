import { IPaginationInput } from '@common/interfaces/common.interface';
import { Inventory, IPaginationInventory, IUpdateInventory } from '@common/interfaces/inventory.interface';
import logger from '@common/logger';
import { InventoryService } from '@common/services/inventory.service';
import { NextFunction, Request, Response } from 'express';

export class InventoryController {
    private static instance: InventoryController;
    protected service: InventoryService;

    constructor() {
        this.service = InventoryService.getInstance();
    }

    public static getInstance(): InventoryController {
        if (!this.instance) {
            this.instance = new InventoryController();
        }
        return this.instance;
    }
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const input = req.body as Inventory;

            const output = await this.service.createInventory(input);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const output = await this.service.deleteInventory(Number(id));
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.delete: `, error);
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const input = req.body as IUpdateInventory;

            const output = await this.service.updateInventory(Number(id), input);
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, type, startAt, endAt } = req.query as IPaginationInventory;

            const output = await this.service.getInventory({ page, limit, args: { startAt, endAt } }, String(type));
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.getAll: `, error);
            next(error);
        }
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const output = await this.service.getById(Number(id));
            res.sendJson(output);
        } catch (error) {
            logger.error(`${this.constructor.name}.getById: `, error);
            next(error);
        }
    }
}
