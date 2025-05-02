import { BaseController } from './base.controller';
import { Orders } from '.prisma/client';
import { OrderService } from '@common/services/order.service';

export class OrderController extends BaseController<Orders> {
    private static instance: OrderController;
    protected service: OrderService;

    private constructor() {
        super(OrderService.getInstance());
        this.service = OrderService.getInstance();
    }

    public static getInstance(): OrderController {
        if (!this.instance) {
            this.instance = new OrderController();
        }
        return this.instance;
    }
}
