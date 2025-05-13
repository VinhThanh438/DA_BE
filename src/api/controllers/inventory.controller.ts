import { BaseController } from './base.controller';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { Inventories } from '.prisma/client';
import { InventoryService } from '@common/services/inventory.service';

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
}
