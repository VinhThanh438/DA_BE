import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { OrganizationType } from '@config/app.constant';
import { ORGANIZATION_DATA_KEY } from '@config/redis-key.constant';

export class InitService {
    private static organizationRepo: OrganizationRepo = new OrganizationRepo();

    public static async cacheOrganizationData(): Promise<void> {
        try {
            const organizations = await this.organizationRepo.findMany({
                OR: [{ type: OrganizationType.HEAD_QUARTER }, { type: OrganizationType.COMPANY }],
            });
            await RedisAdapter.set(ORGANIZATION_DATA_KEY, organizations, 0, true);
            logger.info(`Cache initialized: ${organizations.length} organizations loaded into Redis`);
        } catch (error) {
            logger.error('Error caching organization data:', error);
            throw error;
        }
    }
}
