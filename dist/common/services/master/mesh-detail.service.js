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
exports.MeshDetailService = void 0;
const base_service_1 = require("./base.service");
const logger_1 = __importDefault(require("../../logger"));
const mesh_detail_repo_1 = require("../../repositories/mesh-detail.repo");
class MeshDetailService extends base_service_1.BaseService {
    constructor() {
        super(new mesh_detail_repo_1.MeshDetailRepo());
        this.PI = Math.PI;
        this.STEEL_DENSITY = 7.85; // g/cm³
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new MeshDetailService();
        }
        return this.instance;
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            delete query.organizationId;
            delete query.OR;
            return this.repo.paginate(query, true);
        });
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const prepareData = Object.assign(Object.assign({}, body), { name: this.handleName(body) });
            const mapData = this.autoMapConnection([prepareData]);
            const id = yield this.repo.create(mapData[0]);
            return { id };
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const prepareData = Object.assign(Object.assign({}, body), { name: this.handleName(body) });
            const mapData = this.autoMapConnection([prepareData]);
            yield this.repo.update({ id }, mapData[0]);
            return { id };
        });
    }
    createMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || data.length === 0)
                return;
            yield this.repo.createMany(data, tx);
            logger_1.default.info(`Created ${data.length} product details successfully.`);
        });
    }
    updateMany(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || data.length === 0)
                return;
            for (const item of data) {
                yield this.repo.update({ id: item.id }, item, tx);
            }
            logger_1.default.info(`Updated ${data.length} product details successfully.`);
        });
    }
    deleteMany(ids, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ids || ids.length === 0)
                return;
            yield this.repo.deleteMany({ id: { in: ids } }, tx, false);
            logger_1.default.info(`Deleted ${ids.length} product details successfully.`);
        });
    }
    findAll(query, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.repo.findMany(query, false, tx));
            return data;
        });
    }
    handleName(data) {
        const baseName = 'Lưới thép hàn: ';
        const specification = `D${data.length_phi}x${data.width_phi}a${data.length_spacing}x${data.width_spacing}`;
        return baseName + specification;
    }
    /**
     * Gộp các tấm lưới thép hàn có cùng tên và cộng dồn số lượng, khối lượng, diện tích
     */
    mergeMeshData(meshes) {
        const meshMap = {};
        for (const mesh of meshes) {
            const key = mesh.name;
            const qty = mesh.quantity || 0;
            const weight = this.calculateWeightSheet(mesh);
            const area = this.calculateAreaSheet(mesh.length, mesh.width);
            if (meshMap[key]) {
                meshMap[key].total_quantity += qty;
                meshMap[key].total_weight += weight;
                meshMap[key].total_area += area;
            }
            else {
                meshMap[key] = Object.assign(Object.assign({}, mesh), { total_quantity: qty, total_weight: weight, total_area: area });
            }
        }
        return Object.values(meshMap);
    }
    /**
     * Tính khối lượng phi trên 1 mét chiều dài / rộng của tấm lưới thép hàn
     */
    calculateWeightPhiMeter(w) {
        const l = (Math.pow(w / 2, 2) * this.PI * this.STEEL_DENSITY) / 1000;
        return parseFloat(l.toFixed(2));
    }
    /**
     * Tính số thanh của chiều dài / rộng tấm lưới thép hàn
     */
    calculateBarPlate(w, spacing, left, rightL, inverseSpacing) {
        if (spacing === 0)
            return 0;
        const bars = (w - left - rightL) / inverseSpacing + 1;
        return Math.max(0, bars);
    }
    /**
     * Tính khối lượng 1 tấm lưới thép hàn
     */
    calculateWeightSheet(data) {
        const { length, width, length_spacing, length_left, length_right, width_spacing, width_left, width_right } = data;
        const barPlateLength = this.calculateBarPlate(length, length_spacing, length_left, length_right, width_spacing);
        const barPlateWidth = this.calculateBarPlate(width, width_spacing, width_left, width_right, length_spacing);
        const weightPhiMeterLength = this.calculateWeightPhiMeter(data.length_phi);
        const weightPhiMeterWidth = this.calculateWeightPhiMeter(data.width_phi);
        const totalWeight = (length * barPlateLength * weightPhiMeterLength) / 1000 +
            (width * barPlateWidth * weightPhiMeterWidth) / 1000;
        return parseFloat(totalWeight.toFixed(3));
    }
    /**
     * Tính tổng khối lượng của tất cả các tấm lưới thép hàn
     */
    calculateTotalWeight(data) {
        const total = data.reduce((total, item) => {
            const itemWeight = item.quantity * this.calculateWeightSheet(item);
            return total + itemWeight;
        }, 0);
        return parseFloat(total.toFixed(3));
    }
    /**
     * Tính diện tích 1 tấm lưới thép hàn
     */
    calculateAreaSheet(length, width) {
        const s = (length * width) / 1000000;
        return parseFloat(s.toFixed(2));
    }
    /**
     * Tính tổng diện tích của tất cả các tấm lưới thép hàn
     */
    calculateTotalArea(data) {
        const total = data.reduce((total, item) => {
            const s = this.calculateAreaSheet(item.length, item.width);
            return total + s;
        }, 0);
        return parseFloat(total.toFixed(3));
    }
}
exports.MeshDetailService = MeshDetailService;
