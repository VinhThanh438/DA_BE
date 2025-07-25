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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationRequestService = void 0;
const quotation_request_repo_1 = require("../repositories/quotation-request.repo");
const quotation_request_detail_service_1 = require("./master/quotation-request-detail.service");
const handle_files_1 = require("../helpers/handle-files");
const base_service_1 = require("./master/base.service");
const partner_repo_1 = require("../repositories/partner.repo");
const representative_repo_1 = require("../repositories/representative.repo");
const common_service_1 = require("./common.service");
const app_constant_1 = require("../../config/app.constant");
const queue_service_1 = require("./queue.service");
const job_constant_1 = require("../../config/job.constant");
const eventbus_1 = __importDefault(require("../eventbus"));
const event_constant_1 = require("../../config/event.constant");
class QuotationRequestService extends base_service_1.BaseService {
    constructor() {
        super(new quotation_request_repo_1.QuotationRequestRepo());
        this.quotationReqDetailService = quotation_request_detail_service_1.QuotationRequestDetailService.getInstance();
        this.partnerRepo = new partner_repo_1.PartnerRepo();
        this.representativeRepo = new representative_repo_1.RepresentativeRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new QuotationRequestService();
        }
        return this.instance;
    }
    create(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = 0;
            const code = yield common_service_1.CommonService.getCode('QUOTATION_REQUEST');
            // await this.isExist({ code: request.code });
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { details } = request, restData = __rest(request, ["details"]);
                // const partnerId = await this.findOrCreatePartner(request, tx);
                // await this.findOrCreateRepresentative(partnerId, request, tx);
                id = yield this.repo.create(Object.assign(Object.assign({}, restData), { code }), tx);
                yield this.quotationReqDetailService.createMany(id, details, tx);
            }));
            return { id };
        });
    }
    update(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const { add, update, delete: deleteIds, files_add, files_delete } = request, restData = __rest(request, ["add", "update", "delete", "files_add", "files_delete"]);
            try {
                const itemExist = yield this.findById(id);
                if (!itemExist)
                    return { id };
                // handle files
                let filesUpdate = (0, handle_files_1.handleFiles)(files_add, files_delete, itemExist.files);
                yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield this.repo.update({ id }, Object.assign(Object.assign({}, restData), (filesUpdate !== null && { files: filesUpdate })), tx);
                    if (add && add.length > 0)
                        yield this.quotationReqDetailService.createMany(id, add, tx);
                    if (update && update.length > 0)
                        yield this.quotationReqDetailService.updateMany(update, tx);
                    if (deleteIds && deleteIds.length > 0)
                        yield this.quotationReqDetailService.deleteMany(deleteIds, tx);
                }));
                // clean up file
                if (files_delete && files_delete.length > 0) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_delete);
                }
                return { id };
            }
            catch (error) {
                if (files_add && files_add.length > 0) {
                    eventbus_1.default.emit(event_constant_1.EVENT_DELETE_UNUSED_FILES, files_add);
                }
                throw error;
            }
        });
    }
    findOrCreatePartner(body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { organization_name, tax, address, phone, email } = body;
            const existingPartnerByTax = yield this.partnerRepo.findOne({ tax: tax }, false, tx);
            if (existingPartnerByTax) {
                return existingPartnerByTax.id || 0;
            }
            const newPartnerId = yield this.partnerRepo.create({
                name: organization_name,
                code: yield common_service_1.CommonService.getCode('CUSTOMER'),
                tax,
                address,
                representative_name: organization_name,
                representative_phone: phone,
                representative_email: email,
                type: 'customer',
            }, tx);
            return newPartnerId;
        });
    }
    findOrCreateRepresentative(partnerId, body, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requester_name, phone, email } = body;
            const existingRepByPhone = yield (tx === null || tx === void 0 ? void 0 : tx.representatives.findFirst({
                where: {
                    OR: [{ phone: phone, email }],
                },
            }));
            if (existingRepByPhone) {
                return existingRepByPhone.id || 0;
            }
            const newRepresentativeId = yield this.representativeRepo.create({
                name: requester_name,
                phone,
                email,
                partner_id: partnerId,
            }, tx);
            return newRepresentativeId;
        });
    }
    approve(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.validateStatusApprove(id);
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { files } = body, restData = __rest(body, ["files"]);
                let dataToUpdate = Object.assign({}, restData);
                if (files && files.length > 0) {
                    let filesUpdate = (0, handle_files_1.handleFiles)(files, [], data.files || []);
                    dataToUpdate.files = filesUpdate;
                }
                const mapData = this.autoMapConnection([dataToUpdate]);
                yield this.repo.update({ id }, mapData[0], tx);
                const isSave = mapData[0].status === app_constant_1.CommonApproveStatus.CONFIRMED ||
                    (mapData[0].status === app_constant_1.CommonApproveStatus.REJECTED && body.is_save === true);
                if (isSave) {
                    const partnerId = yield this.findOrCreatePartner(data, tx);
                    yield this.findOrCreateRepresentative(partnerId, data, tx);
                    yield this.repo.update({ id }, { partner_id: partnerId }, tx);
                }
                // send mail if reject
                if (mapData[0].status === app_constant_1.CommonApproveStatus.REJECTED) {
                    const { email, name } = data;
                    // alway add default data
                    const sendMailData = {
                        email,
                        name,
                        rejected_reason: mapData[0].rejected_reason,
                        requester_name: data.requester_name,
                        organization_name: 'DEFAULT',
                        organization_phone: 'DEFAULT',
                        organization_address: 'DEFAULT',
                        organization_email: 'DEFAULT',
                    };
                    yield (yield queue_service_1.QueueService.getQueue(job_constant_1.SEND_REJECT_QUOTATION_MAIL_JOB)).add(job_constant_1.SEND_REJECT_QUOTATION_MAIL_JOB, sendMailData);
                }
            }));
            return { id };
        });
    }
}
exports.QuotationRequestService = QuotationRequestService;
