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
exports.FacilityController = void 0;
const base_controller_1 = require("./base.controller");
const logger_1 = __importDefault(require("../../common/logger"));
const facility_service_1 = require("../../common/services/master/facility.service");
class FacilityController extends base_controller_1.BaseController {
    constructor() {
        super(facility_service_1.FacilityService.getInstance());
        this.service = facility_service_1.FacilityService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FacilityController();
        }
        return this.instance;
    }
    sample(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const body = req.body as IFacility;
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
exports.FacilityController = FacilityController;
