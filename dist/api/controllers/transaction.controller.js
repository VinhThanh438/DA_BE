"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("../../common/services/transaction.service");
const base_controller_1 = require("./base.controller");
class TransactionController extends base_controller_1.BaseController {
    constructor() {
        super(transaction_service_1.TransactionService.getInstance());
        this.service = transaction_service_1.TransactionService.getInstance();
    }
    static getInstance() {
        if (!this.controller) {
            this.controller = new TransactionController();
        }
        return this.controller;
    }
}
exports.TransactionController = TransactionController;
