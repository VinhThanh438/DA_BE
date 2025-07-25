import { QuotationRequestRepo } from '@common/repositories/quotation-request.repo';
import { IQuotationRequest } from '@common/interfaces/quotation-request.interface';
import { QuotationRequestDetailService } from './master/quotation-request-detail.service';
import { IApproveRequest, IIdResponse, IJobSendRejectQuotationEmailData } from '@common/interfaces/common.interface';
import { QuotationRequests, Prisma } from '.prisma/client';
import { handleFiles } from '@common/helpers/handle-files';
import { BaseService } from './master/base.service';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { CommonService } from './common.service';
import { CommonApproveStatus } from '@config/app.constant';
import { QueueService } from './queue.service';
import { SEND_REJECT_QUOTATION_MAIL_JOB } from '@config/job.constant';
import eventbus from '@common/eventbus';
import { EVENT_DELETE_UNUSED_FILES } from '@config/event.constant';

export class QuotationRequestService extends BaseService<
    QuotationRequests,
    Prisma.QuotationRequestsSelect,
    Prisma.QuotationRequestsWhereInput
> {
    private static instance: QuotationRequestService;
    private quotationReqDetailService: QuotationRequestDetailService = QuotationRequestDetailService.getInstance();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();

    private constructor() {
        super(new QuotationRequestRepo());
    }

    static getInstance(): QuotationRequestService {
        if (!this.instance) {
            this.instance = new QuotationRequestService();
        }
        return this.instance;
    }

    async create(request: IQuotationRequest): Promise<IIdResponse> {
        let id = 0;

        const code = await CommonService.getCode('QUOTATION_REQUEST');
        // await this.isExist({ code: request.code });

        await this.db.$transaction(async (tx) => {
            const { details, ...restData } = request;

            // const partnerId = await this.findOrCreatePartner(request, tx);
            // await this.findOrCreateRepresentative(partnerId, request, tx);

            id = await this.repo.create(
                {
                    ...restData,
                    code,
                    // partner_id: partnerId,
                },
                tx,
            );

            await this.quotationReqDetailService.createMany(id, details, tx);
        });

        return { id };
    }

    async update(id: number, request: IQuotationRequest): Promise<IIdResponse> {
        const { add, update, delete: deleteIds, files_add, files_delete, ...restData } = request;

        try {
            const itemExist = await this.findById(id);
            if (!itemExist) return { id };

            // handle files
            let filesUpdate = handleFiles(files_add, files_delete, itemExist.files);

            await this.db.$transaction(async (tx) => {
                await this.repo.update(
                    { id },
                    {
                        ...restData,
                        ...(filesUpdate !== null && { files: filesUpdate }),
                    },
                    tx,
                );

                if (add && add.length > 0) await this.quotationReqDetailService.createMany(id, add, tx);

                if (update && update.length > 0) await this.quotationReqDetailService.updateMany(update, tx);

                if (deleteIds && deleteIds.length > 0) await this.quotationReqDetailService.deleteMany(deleteIds, tx);
            });

            // clean up file
            if (files_delete && files_delete.length > 0) {
                eventbus.emit(EVENT_DELETE_UNUSED_FILES, files_delete);
            }

            return { id };
        } catch (error) {
            if (files_add && files_add.length > 0) {
                eventbus.emit(EVENT_DELETE_UNUSED_FILES, files_add);
            }
            throw error;
        }
    }

    private async findOrCreatePartner(body: IQuotationRequest, tx?: Prisma.TransactionClient): Promise<number> {
        const { organization_name, tax, address, phone, email } = body;
        const existingPartnerByTax = await this.partnerRepo.findOne({ tax: tax }, false, tx);
        if (existingPartnerByTax) {
            return existingPartnerByTax.id || 0;
        }

        const newPartnerId = await this.partnerRepo.create(
            {
                name: organization_name,
                code: await CommonService.getCode('CUSTOMER'),
                tax,
                address,
                representative_name: organization_name,
                representative_phone: phone,
                representative_email: email,
                type: 'customer',
            },
            tx,
        );

        return newPartnerId;
    }

    private async findOrCreateRepresentative(
        partnerId: number,
        body: IQuotationRequest,
        tx?: Prisma.TransactionClient,
    ): Promise<number> {
        const { requester_name, phone, email } = body;
        const existingRepByPhone = await tx?.representatives.findFirst({
            where: {
                OR: [{ phone: phone, email }],
            },
        });
        if (existingRepByPhone) {
            return existingRepByPhone.id || 0;
        }

        const newRepresentativeId = await this.representativeRepo.create(
            {
                name: requester_name,
                phone,
                email,
                partner_id: partnerId,
            },
            tx,
        );

        return newRepresentativeId;
    }

    async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const data = await this.validateStatusApprove(id);

        await this.db.$transaction(async (tx) => {
            const { files, ...restData } = body;
            let dataToUpdate: any = { ...restData };
            if (files && files.length > 0) {
                let filesUpdate = handleFiles(files, [], data.files || []);
                dataToUpdate.files = filesUpdate;
            }
            const mapData = this.autoMapConnection([dataToUpdate]);
            await this.repo.update({ id }, mapData[0], tx);

            const isSave =
                mapData[0].status === CommonApproveStatus.CONFIRMED ||
                (mapData[0].status === CommonApproveStatus.REJECTED && body.is_save === true);

            if (isSave) {
                const partnerId = await this.findOrCreatePartner(data, tx);
                await this.findOrCreateRepresentative(partnerId, data, tx);

                await this.repo.update({ id }, { partner_id: partnerId }, tx);
            }

            // send mail if reject
            if (mapData[0].status === CommonApproveStatus.REJECTED) {
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
                await (
                    await QueueService.getQueue(SEND_REJECT_QUOTATION_MAIL_JOB)
                ).add(SEND_REJECT_QUOTATION_MAIL_JOB, sendMailData);
            }
        });

        return { id };
    }
}
