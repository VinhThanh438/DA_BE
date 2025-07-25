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
exports.OrganizationEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const redis_adapter_1 = require("../infrastructure/redis.adapter");
const organization_interface_1 = require("../interfaces/organization.interface");
const logger_1 = __importDefault(require("../logger"));
const organization_repo_1 = require("../repositories/organization.repo");
const event_constant_1 = require("../../config/event.constant");
const redis_key_constant_1 = require("../../config/redis-key.constant");
class OrganizationEvent {
    /**
     * Register Organization event
     */
    static register() {
        eventbus_1.default.on(event_constant_1.EVENT_UPDATE_ORGANIZATION_CACHE_DATA, this.updateOrgCacheHandler.bind(this));
    }
    static updateOrgCacheHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let organizations = (yield redis_adapter_1.RedisAdapter.get(redis_key_constant_1.ORGANIZATION_DATA_KEY, true));
                switch (body.action) {
                    case organization_interface_1.ActionType.CREATE:
                        const newOrg = yield this.organizationRepo.findOne({ id: body.id });
                        if (newOrg) {
                            organizations.push(newOrg);
                        }
                        break;
                    case organization_interface_1.ActionType.UPDATE:
                        const updatedOrg = yield this.organizationRepo.findOne({ id: body.id });
                        if (updatedOrg) {
                            const index = organizations.findIndex((org) => org.id === body.id);
                            if (index !== -1) {
                                organizations[index] = updatedOrg;
                            }
                            else {
                                organizations.push(updatedOrg);
                            }
                        }
                        break;
                    case organization_interface_1.ActionType.DELETE:
                        organizations = organizations.filter((org) => org.id !== body.id);
                        break;
                    default:
                        logger_1.default.warn(`OrganizationEvent.handler: Unknown action ${body.action}`);
                        return;
                }
                yield redis_adapter_1.RedisAdapter.set(redis_key_constant_1.ORGANIZATION_DATA_KEY, organizations, 0, true);
                logger_1.default.info(`OrganizationEvent.handler: update org cache data successfully!`);
            }
            catch (error) {
                logger_1.default.error(`OrganizationEvent.handler: Error processing ${body.action} action:`, error);
            }
        });
    }
}
exports.OrganizationEvent = OrganizationEvent;
OrganizationEvent.organizationRepo = new organization_repo_1.OrganizationRepo();
