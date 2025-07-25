"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionStepController = void 0;
const production_step_service_1 = require("../../common/services/master/production-step.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class ProductionStepController extends base_controller_1.BaseController {
    constructor() {
        super(production_step_service_1.ProductionStepService.getInstance());
        this.service = production_step_service_1.ProductionStepService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProductionStepController();
        }
        return this.instance;
    }
    sample(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const body = req.body as IProductionStep;
                // const result = await this.service.connect(body);
                // res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.sample: `, error);
                next(error);
            }
        });
    }
}
exports.ProductionStepController = ProductionStepController;
