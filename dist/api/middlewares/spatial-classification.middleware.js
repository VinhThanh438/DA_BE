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
exports.SpatialClassificationMiddleware = void 0;
const logger_1 = __importDefault(require("../../common/logger"));
const redis_adapter_1 = require("../../common/infrastructure/redis.adapter");
const redis_key_constant_1 = require("../../config/redis-key.constant");
class SpatialClassificationMiddleware {
    static handle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizationId = Number(req.query.organizationId);
                if (!organizationId)
                    return next();
                const organizations = (yield redis_adapter_1.RedisAdapter.get(redis_key_constant_1.ORGANIZATION_DATA_KEY, true));
                const children = organizations.filter((org) => org.parent_id === organizationId);
                const organizationIds = [organizationId, ...children.map((org) => org.id)].filter((id) => typeof id === 'number' && id !== undefined);
                const conditionArray = [{ organization_id: { in: organizationIds } }, { organization_id: null }];
                req.query.OR = conditionArray;
                return next();
            }
            catch (error) {
                logger_1.default.error('SpatialClassificationMiddleware.handle error:', error);
                next(error);
            }
        });
    }
    static assignInfoToRequest(req, res, next) {
        try {
            const organizationId = req.query.organizationId;
            if (organizationId) {
                req.body.organization_id = Number(organizationId);
            }
            return next();
        }
        catch (error) {
            logger_1.default.error('SpatialClassificationMiddleware.assignInfoToRequest error:', error);
            return next(error);
        }
    }
    static assignInfoToQuery(req, res, next) {
        try {
            const organizationId = req.query.organizationId;
            if (organizationId) {
                req.query.organization_id = Number(organizationId);
                delete req.query.organizationId;
            }
            return next();
        }
        catch (error) {
            logger_1.default.error('SpatialClassificationMiddleware.assignInfoToQuery error:', error);
            return next(error);
        }
    }
}
exports.SpatialClassificationMiddleware = SpatialClassificationMiddleware;
