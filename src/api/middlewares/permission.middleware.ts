import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { IRoleAction, IRoleModule, IRouteModule } from '@common/interfaces/role.interface';
import logger from '@common/logger';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

export class PermissionMiddleware {
    /**
     * Check if the user has the required permission for a specific module and action
     * @param module The module to check permissions for
     * @param action The action to check permissions for
     * @returns Express middleware function
     */
    public static hasPermission(module: IRoleModule, action: IRoleAction) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const db = DatabaseAdapter.getInstance();

                const userId = req.user?.id;
                // Admin bypass check
                const isAdmin = await this.isAdminUser(db, userId);
                if (isAdmin) return next();

                // parse type
                const targetModule = this.resolveModuleFromType(req, module);

                const organizationId = Number(req.query.organizationId);

                if (!userId || !organizationId) {
                    throw new APIError({
                        message: 'auth.common.session-expired',
                        status: StatusCode.REQUEST_UNAUTHORIZED,
                    });
                }

                //
                const userRoles = await this.getUserRolesInOrganization(db, userId, organizationId);

                // flag xem ít hoặc đầy đủ
                const hasPermission =
                    action === 'r'
                        ? this.hasAnyPermissionForModule(userRoles, targetModule)
                        : this.hasSpecificPermission(userRoles, targetModule, action);

                if (!hasPermission) {
                    logger.warn(`User ${userId} does not have permission to ${action} in ${targetModule}`);
                    throw new APIError({
                        message: 'auth.forbidden',
                        status: StatusCode.REQUEST_FORBIDDEN,
                    });
                }

                return next();
            } catch (error) {
                logger.error('Permission check failed:', error);
                next(error);
            }
        };
    }

    /**
     * Resolve the correct module based on request type and module mappings
     * @private
     */
    private static resolveModuleFromType(req: Request, defaultModule: IRoleModule): IRoleModule {
        const requestType = (req.query.type as string) || req.body.type;
        if (!requestType) return defaultModule;

        const modules: Record<IRoleModule, IRouteModule[]> = {
            warehouse: ['customer', 'payment', 'production'],
            product: ['product', 'purchase_order'],
        } as Record<IRoleModule, IRouteModule[]>;

        for (const [source, target] of Object.entries(modules)) {
            if (defaultModule === source && target.includes(requestType)) {
                return requestType as IRoleModule;
            }
        }

        return defaultModule;
    }

    /**
     * Check if a user is an admin
     * @private
     */
    public static async checkAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const db = DatabaseAdapter.getInstance();
            const userId = req.user?.id;

            const isAdmin = await PermissionMiddleware.isAdminUser(db, userId);
            req.user.isAdmin = isAdmin;

            return next();
        } catch (error) {
            logger.error('Admin check failed:', error);
            next(error);
        }
    }

    private static async isAdminUser(db: any, userId: number) {
        const user = await db.users.findUnique({
            select: { username: true },
            where: { id: Number(userId) },
        });

        if (!user) return false;
        return user.username === process.env.ADMIN_USER_NAME;
    }

    /**
     * Get user roles in a specific organization
     * @private
     */
    private static async getUserRolesInOrganization(db: any, userId: number, organizationId: number) {
        return db.userRoles.findMany({
            where: {
                user_id: userId,
                organization_id: organizationId,
            },
            include: { role: true },
        });
    }

    /**
     * Check if user has any permission for the specified module
     * @private
     */
    private static hasAnyPermissionForModule(userRoles: any[], module: IRoleModule): boolean {
        for (const userRole of userRoles) {
            const permissions = userRole.role.permissions as Record<IRoleModule, IRoleAction[]>;

            if (permissions[module] && Array.isArray(permissions[module]) && permissions[module].length > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has a specific permission
     * @private
     */
    private static hasSpecificPermission(userRoles: any[], module: IRoleModule, action: IRoleAction): boolean {
        for (const userRole of userRoles) {
            const permissions = userRole.role.permissions as Record<IRoleModule, IRoleAction[]>;

            if (!Array.isArray(permissions[module]) || permissions[module].length === 0) {
                continue;
            }

            if (permissions[module].includes(action)) {
                return true;
            }
        }
        return false;
    }
}
