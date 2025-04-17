import { OrganizationRepo, OrganizationSelectionAll } from '@common/repositories/organization.repo';
import { BaseService } from './base.service';
import { Organizations, Prisma } from '.prisma/client';
import { OrganizationType } from '@config/app.constant';

interface IHierarchyModel {
    id: number;
    type: string;
    name: string;
    leader: string | null;
    sub_organizations: any[];
}

export class OrganizationService extends BaseService<
    Organizations,
    Prisma.OrganizationsSelect,
    Prisma.OrganizationsWhereInput
> {
    private static instance: OrganizationService;

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
                ? { id: orgId } as Prisma.OrganizationsWhereInput
                : { type: OrganizationType.HEAD_QUARTER } as Prisma.OrganizationsWhereInput,
            true,
        )) as Prisma.OrganizationsGetPayload<{ select: typeof OrganizationSelectionAll }> | null;

        if (!organization) return null;

        const result: IHierarchyModel = {
            id: organization.id,
            type: organization.type!,
            name: organization.name || '',
            leader: organization.leader?.name || null,
            sub_organizations: [],
        };

        const subOrgs = await this.repo.findMany({ parent_id: organization.id }, true);

        if (!subOrgs || !Array.isArray(subOrgs)) return result;

        for (const subOrg of subOrgs) {
            const subHierarchy = await this.getHierarchyModel(subOrg.id);
            if (subHierarchy) result.sub_organizations.push(subHierarchy);
        }

        return result;
    }
}
