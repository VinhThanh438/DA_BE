import eventbus from '@common/eventbus';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import { ActionType, IEventOrgCacheData, IOrganization } from '@common/interfaces/organization.interface';
import logger from '@common/logger';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { EVENT_UPDATE_ORGANIZATION_CACHE_DATA } from '@config/event.constant';
import { ORGANIZATION_DATA_KEY } from '@config/redis-key.constant';

export class OrganizationEvent {
    private static organizationRepo: OrganizationRepo = new OrganizationRepo();

    /**
     * Register Organization event
     */
    public static register(): void {
        eventbus.on(EVENT_UPDATE_ORGANIZATION_CACHE_DATA, this.updateOrgCacheHandler.bind(this));
    }

    private static async updateOrgCacheHandler(body: IEventOrgCacheData): Promise<void> {
        try {
            let organizations = (await RedisAdapter.get(ORGANIZATION_DATA_KEY, true)) as Array<IOrganization>;

            switch (body.action) {
                case ActionType.CREATE:
                    const newOrg = await this.organizationRepo.findOne({ id: body.id });
                    if (newOrg) {
                        organizations.push(newOrg as IOrganization);
                    }
                    break;

                case ActionType.UPDATE:
                    const updatedOrg = await this.organizationRepo.findOne({ id: body.id });
                    if (updatedOrg) {
                        const index = organizations.findIndex((org) => org.id === body.id);
                        if (index !== -1) {
                            organizations[index] = updatedOrg as IOrganization;
                        } else {
                            organizations.push(updatedOrg as IOrganization);
                        }
                    }
                    break;

                case ActionType.DELETE:
                    organizations = organizations.filter((org) => org.id !== body.id);
                    break;

                default:
                    logger.warn(`OrganizationEvent.handler: Unknown action ${body.action}`);
                    return;
            }

            await RedisAdapter.set(ORGANIZATION_DATA_KEY, organizations, 0, true);
            logger.info(`OrganizationEvent.handler: update org cache data successfully!`);
        } catch (error: any) {
            logger.error(`OrganizationEvent.handler: Error processing ${body.action} action:`, error);
        }
    }
}
