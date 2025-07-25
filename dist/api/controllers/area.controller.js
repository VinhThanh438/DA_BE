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
exports.AreaController = void 0;
const area_service_1 = require("../../common/services/master/area.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class AreaController extends base_controller_1.BaseController {
    constructor() {
        super(area_service_1.AreasService.getInstance());
        this.service = area_service_1.AreasService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new AreaController();
        }
        return this.instance;
    }
    sample(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const body = req.body as IArea;
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
exports.AreaController = AreaController;
