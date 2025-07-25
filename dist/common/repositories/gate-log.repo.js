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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateLogRepo = void 0;
const database_adapter_1 = require("../infrastructure/database.adapter");
const base_repo_1 = require("./base.repo");
const prisma_select_1 = require("./prisma/prisma.select");
class GateLogRepo extends base_repo_1.BaseRepo {
    constructor() {
        super(...arguments);
        this.db = database_adapter_1.DatabaseAdapter.getInstance().getClient().gateLogs;
        this.defaultSelect = prisma_select_1.GateLogSelection;
        this.detailSelect = prisma_select_1.GateLogSelectionAll;
        this.modelKey = 'gateLogs';
        this.timeFieldDefault = 'time_at';
        this.searchableFields = {
            basic: [{ path: ['name'] }],
        };
    }
    paginate(_a, includeRelations) {
        const _super = Object.create(null, {
            paginate: { get: () => super.paginate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var { page, size, keyword, startAt, endAt } = _a, args = __rest(_a, ["page", "size", "keyword", "startAt", "endAt"]);
            const _b = args, { plate, childrenId } = _b, restQuery = __rest(_b, ["plate", "childrenId"]);
            const customWhere = Object.assign({}, (plate && {
                inventory: { plate },
                entry_time: { not: null },
                exit_time: null,
            }));
            const orderBy = [{ idx: 'desc' }, { inventory_id: 'desc' }];
            return _super.paginate.call(this, Object.assign({ page,
                size,
                keyword,
                startAt,
                endAt }, restQuery), includeRelations, customWhere, null, orderBy);
        });
    }
}
exports.GateLogRepo = GateLogRepo;
