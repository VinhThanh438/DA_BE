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
exports.TokenRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
class TokenRepo {
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
            });
        });
    }
    static deleteMany(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.deleteMany({
                where,
            });
        });
    }
}
exports.TokenRepo = TokenRepo;
TokenRepo.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().tokens;
