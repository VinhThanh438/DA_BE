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
exports.InitService = void 0;
const redis_adapter_1 = require("../infrastructure/redis.adapter");
const logger_1 = __importDefault(require("../logger"));
const organization_repo_1 = require("../repositories/organization.repo");
const app_constant_1 = require("../../config/app.constant");
const redis_key_constant_1 = require("../../config/redis-key.constant");
class InitService {
    static cacheOrganizationData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizations = yield this.organizationRepo.findMany({
                    OR: [{ type: app_constant_1.OrganizationType.HEAD_QUARTER }, { type: app_constant_1.OrganizationType.COMPANY }],
                });
                yield redis_adapter_1.RedisAdapter.set(redis_key_constant_1.ORGANIZATION_DATA_KEY, organizations, 0, true);
                logger_1.default.info(`Cache initialized: ${organizations.length} organizations loaded into Redis`);
            }
            catch (error) {
                logger_1.default.error('Error caching organization data:', error);
                throw error;
            }
        });
    }
}
exports.InitService = InitService;
InitService.organizationRepo = new organization_repo_1.OrganizationRepo();
