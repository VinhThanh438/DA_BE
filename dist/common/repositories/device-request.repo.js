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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRequestRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const app_constant_1 = require("../../config/app.constant");
const prisma_select_1 = require("./prisma/prisma.select");
class DeviceRequestRepo {
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.delete({
                where: { id },
            });
        });
    }
    static findOne(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.findFirst({
                where,
            });
        });
    }
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.create({
                data,
                include: {
                    user: true,
                },
            });
        });
    }
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.findMany({
                where: {
                    status: app_constant_1.RequestStatus.PENDING,
                },
                select: prisma_select_1.DeviceRequestSelection,
            });
        });
    }
    static update(id, status, approvedId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = yield this.db.update({
                where: { id },
                data: {
                    status,
                    approved_id: approvedId || null,
                    updated_at: new Date(),
                },
                include: {
                    user: true,
                },
            });
            return { id: updateData.id, userId: updateData.user_id };
        });
    }
}
exports.DeviceRequestRepo = DeviceRequestRepo;
DeviceRequestRepo.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().deviceRequests;
