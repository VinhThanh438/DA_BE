import { Request, Response, NextFunction } from 'express';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import logger from '@common/logger';
import { OrganizationType } from '@config/app.constant';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';

export class SpatialClassificationMiddleware {
    public static async handle(req: Request, res: Response, next: NextFunction) {
        try {
            const organizationId = Number(req.query.organizationId);

            if (!organizationId) return next();

            const organizationRepo: OrganizationRepo = new OrganizationRepo();

            const children = await organizationRepo.findMany({
                parent_id: organizationId,
                OR: [{ type: OrganizationType.DEPARTMENT }, { type: OrganizationType.COMPANY }],
            });

            if (!children || children.length === 0) {
                throw new APIError({
                    message: 'common.not-found',
                    status: StatusCode.REQUEST_NOT_FOUND,
                    errors: [`organizationId.${ErrorKey.NOT_FOUND}`],
                });
            }

            const organizationIds = [organizationId, ...children.map((org) => org.id)].filter(
                (id): id is number => typeof id === 'number' && id !== undefined,
            );

            (req.query as any).organization_id = { in: organizationIds };
            return next();
        } catch (error) {
            logger.error('SpatialClassificationMiddleware.assignOrganizationToBody error:', error);
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
}
