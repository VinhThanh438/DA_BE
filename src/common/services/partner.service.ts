import { PartnerRepo } from '@common/repositories/partner.repo';
import { BaseService } from './base.service';
import { Partners, Prisma } from '.prisma/client';
import { IPartner } from '@common/interfaces/partner.interface';
import { IIdResponse, IUpdateChildAction } from '@common/interfaces/common.interface';
import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { ClauseRepo } from '@common/repositories/clause.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BankRepo } from '@common/repositories/bank.repo';

export class PartnerService extends BaseService<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    private static instance: PartnerService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private parterGroupRepo: PartnerGroupRepo = new PartnerGroupRepo();
    private clauseRepo: ClauseRepo = new ClauseRepo();
    private bankRepo: BankRepo = new BankRepo();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();

    private constructor() {
        super(new PartnerRepo());
    }

    public static getInstance(): PartnerService {
        if (!this.instance) {
            this.instance = new PartnerService();
        }
        return this.instance;
    }

    public async create(request: IPartner): Promise<IIdResponse> {
        let parterId = 0;

        await this.validateForeignKeys(request, {
            partner_group_id: this.parterGroupRepo,
            employee_id: this.employeeRepo,
            clause_id: this.clauseRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { representatives, ...partnerData } = request;

            parterId = await this.repo.create(partnerData as Partial<IPartner>, tx);

            if (representatives && representatives.length > 0) {
                for (const ele of representatives) {
                    let { banks, key, ...representativeData } = ele;

                    representativeData.partner = parterId ? { connect: { id: parterId } } : undefined;

                    const representativeId = await this.representativeRepo.create(representativeData, tx);

                    const mappedDetails = banks?.map((item: any) => {
                        return {
                            ...item,
                            representative: representativeId ? { connect: { id: representativeId } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['banks']);
                    await this.bankRepo.createMany(filteredData, tx);
                }
            }
        });

        return { id: parterId };
    }

    // public async update(id: number, request: Partial<IPartner>): Promise<IIdResponse> {
    //     await this.findById(id);

    //     await this.isExist({ code: request.code, id }, true);

    //     await this.validateForeignKeys(request, {
    //         partner_id: this.partnerRepo,
    //         employee_id: this.employeeRepo,
    //         organization_id: this.organizationRepo,
    //     });

    //     const { delete: deteleItems, update, add, ...body } = request;

    //     await this.db.$transaction(async (tx) => {
    //         await this.repo.update({ id }, body as Partial<IContract>, tx);

    //         const detailItems = [...(request.add || []), ...(request.update || [])];
    //         if (detailItems.length > 0) {
    //             await this.validateForeignKeys(
    //                 detailItems,
    //                 {
    //                     product_id: this.productRepo,
    //                     unit_id: this.productRepo,
    //                 },
    //                 tx,
    //             );
    //         }

    //         const mappedDetails: IUpdateChildAction = {
    //             add: this.mapDetails(request.add || [], { contract_id: id }),
    //             update: this.mapDetails(request.update || [], { contract_id: id }),
    //             delete: request.delete,
    //         };

    //         const filteredData = {
    //             add: this.filterData(mappedDetails.add, DEFAULT_EXCLUDED_FIELDS, ['key']),
    //             update: this.filterData(mappedDetails.update, DEFAULT_EXCLUDED_FIELDS, ['key']),
    //             delete: mappedDetails.delete,
    //         };

    //         if (
    //             filteredData.add.length > 0 ||
    //             filteredData.update.length > 0 ||
    //             (filteredData.delete?.length || 0) > 0
    //         ) {
    //             await this.updateChildEntity(filteredData, this.contractDetailRepo, tx);
    //         }
    //     });

    //     return { id };
    // }
}
