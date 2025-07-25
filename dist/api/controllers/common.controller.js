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
exports.CommonController = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const common_service_1 = require("../../common/services/common.service");
class CommonController {
    static getCode(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const modelName = (_a = req.query.type) === null || _a === void 0 ? void 0 : _a.toString().toUpperCase();
                const newCode = yield common_service_1.CommonService.getCode(modelName);
                res.sendJson(newCode);
            }
            catch (error) {
                logger_1.default.error('CommonController.getCode', error);
                next(error);
            }
        });
    }
}
exports.CommonController = CommonController;
