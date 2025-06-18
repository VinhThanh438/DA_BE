import { BaseController } from './base.controller';
import { Contracts } from '.prisma/client';
import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { IContract } from '@common/interfaces/contract.interface';
import { ContractService } from '@common/services/contract.service';

export class ContractController extends BaseController<Contracts> {
    private static instance: ContractController;
    protected service: ContractService;

    private constructor() {
        super(ContractService.getInstance());
        this.service = ContractService.getInstance();
    }

    public static getInstance(): ContractController {
        if (!this.instance) {
            this.instance = new ContractController();
        }
        return this.instance;
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as IContract;
            const result = await this.service.createContract(body);
            res.sendJson(result);
        } catch (error) {
            logger.error(`${this.constructor.name}.create: `, error);
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as IContract;
            const data = await this.service.updateContractEntity(id, body);
            res.sendJson(data);
        } catch (error) {
            logger.error(`${this.constructor.name}.update: `, error);
            next(error);
        }
    }
}
