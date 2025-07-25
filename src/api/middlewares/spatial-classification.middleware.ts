import { Request, Response, NextFunction } from 'express';
import logger from '@common/logger';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import { ORGANIZATION_DATA_KEY } from '@config/redis-key.constant';
import { IOrganization } from '@common/interfaces/organization.interface';

export class SpatialClassificationMiddleware {
    public static async handle(req: Request, res: Response, next: NextFunction) {
        try {
            const organizationId = Number(req.query.organizationId);

            if (!organizationId) return next();

            const organizations = (await RedisAdapter.get(ORGANIZATION_DATA_KEY, true)) as Array<IOrganization>;

            const children = organizations.filter((org) => org.parent_id === organizationId);

            const organizationIds = [organizationId, ...children.map((org) => org.id)].filter(
                (id): id is number => typeof id === 'number' && id !== undefined,
            );

            const conditionArray = [{ organization_id: { in: organizationIds } }, { organization_id: null }];

            (req.query as any).OR = conditionArray;

            return next();
        } catch (error) {
            logger.error('SpatialClassificationMiddleware.handle error:', error);
            next(error);
        }
    }

    public static assignInfoToRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const organizationId = req.query.organizationId;

            if (organizationId) {
                req.body.organization_id = Number(organizationId);
            }

            return next();
        } catch (error) {
            logger.error('SpatialClassificationMiddleware.assignInfoToRequest error:', error);
            return next(error);
        }
    }

    public static assignInfoToQuery(req: Request, res: Response, next: NextFunction) {
        try {
            const organizationId = req.query.organizationId;

            if (organizationId) {
                (req.query as any).organization_id = Number(organizationId);
                delete (req.query as any).organizationId;
            }

            return next();
        } catch (error) {
            logger.error('SpatialClassificationMiddleware.assignInfoToQuery error:', error);
            return next(error);
        }
    }
}
