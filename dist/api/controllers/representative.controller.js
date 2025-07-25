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
exports.RepresentativeController = void 0;
const representative_service_1 = require("../../common/services/representative.service");
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
class RepresentativeController extends base_controller_1.BaseController {
    constructor() {
        super(representative_service_1.RepresentativeService.getInstance());
        this.service = representative_service_1.RepresentativeService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RepresentativeController();
        }
        return this.instance;
    }
    getDebt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query;
                const result = yield this.service.getDebt(query);
                res.sendJson(result);
            }
            catch (error) {
                logger_1.default.error(`${this.constructor.name}.getDebt: `, error);
                next(error);
            }
        });
    }
}
exports.RepresentativeController = RepresentativeController;
