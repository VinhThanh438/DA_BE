import { OrganizationRepo } from '@common/repositories/organization.repo';
import { BaseService } from './master/base.service';
import { Organizations, Prisma } from '.prisma/client';
import { OrganizationType } from '@config/app.constant';
import { ActionType, IEventOrgCacheData, IOrganization } from '@common/interfaces/organization.interface';
import { IIdResponse } from '@common/interfaces/common.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { IEmployee } from '@common/interfaces/employee.interface';
import { OrganizationSelectionAll } from '@common/repositories/prisma/prisma.select';
import eventbus from '@common/eventbus';
import { EVENT_UPDATE_ORGANIZATION_CACHE_DATA } from '@config/event.constant';

interface IHierarchyModel {
    id: number;
    type: string;
    code?: string;
    industry?: string;
    logo?: string;
    name: string;
    address: string;
    phone: string;
    hotline: string;
    email: string;
    website: string;
    tax_code: string;
    leader?: IEmployee | null;
    children: any[];
}

export class OrganizationService extends BaseService<
    Organizations,
    Prisma.OrganizationsSelect,
    Prisma.OrganizationsWhereInput
> {
    private static instance: OrganizationService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();

    private constructor() {
        super(new OrganizationRepo());
    }

    public static getInstance(): OrganizationService {
        if (!this.instance) {
            this.instance = new OrganizationService();
        }
        return this.instance;
    }

    /**
     * Generates a hierarchical representation of the organization structure
     * starting from the headquarter.
     * @param orgId The ID of the starting organization (default: headquarter)
     * @returns Hierarchical structure as an object
     */
    public async getHierarchyModel(orgId?: number): Promise<IHierarchyModel | null> {
        const organization = (await this.repo.findOne(
            orgId
                ? ({ id: orgId } as Prisma.OrganizationsWhereInput)
                : ({ type: OrganizationType.HEAD_QUARTER } as Prisma.OrganizationsWhereInput),
            true,
        )) as Prisma.OrganizationsGetPayload<{ select: typeof OrganizationSelectionAll }> | null;

        if (!organization) return null;

        const result: IHierarchyModel = {
            id: organization.id,
            type: organization.type!,
            name: organization.name || '',
            logo: organization.logo || '',
            code: organization.code || '',
            industry: organization.industry || '',
            address: organization.address || '',
            phone: organization.phone || '',
            hotline: organization.hotline || '',
            email: organization.email || '',
            website: organization.website || '',
            tax_code: organization.tax_code || '',
            leader: (organization.leader as IEmployee) || null,
            children: [],
        };

        const subOrgs = await this.repo.findMany({ parent_id: organization.id }, true);

        if (!subOrgs || !Array.isArray(subOrgs)) return result;

        for (const subOrg of subOrgs) {
            const subHierarchy = await this.getHierarchyModel(subOrg.id);
            if (subHierarchy) result.children.push(subHierarchy);
        }

        return result;
    }

    public async createOrganization(request: Partial<IOrganization>): Promise<IIdResponse> {
        await this.isExist({ code: request.code });

        await this.validateForeignKeys(request, {
            leader_id: this.employeeRepo,
            parent_id: this.organizationRepo,
        });

        const id = await this.repo.create(request);

        if ([OrganizationType.COMPANY, OrganizationType.HEAD_QUARTER].includes(request.type as OrganizationType)) {
            // Cache the organization data if it's a company
            eventbus.emit(EVENT_UPDATE_ORGANIZATION_CACHE_DATA, {
                id,
                action: ActionType.CREATE,
            } as IEventOrgCacheData);
        }

        return { id };
    }

    public async updateOrganization(id: number, request: Partial<IOrganization>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ name: request.name, code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            leader_id: this.employeeRepo,
            parent_id: this.organizationRepo,
        });

        await this.repo.update({ id }, request);

        eventbus.emit(EVENT_UPDATE_ORGANIZATION_CACHE_DATA, { id, action: ActionType.UPDATE } as IEventOrgCacheData);

        return { id };
    }

    public async deleteOrganization(id: number): Promise<IIdResponse> {
        await this.findOne({ id });

        await this.repo.delete({ id });

        eventbus.emit(EVENT_UPDATE_ORGANIZATION_CACHE_DATA, { id, action: ActionType.DELETE } as IEventOrgCacheData);

        return { id };
    }
}
