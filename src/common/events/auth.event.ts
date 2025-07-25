import eventbus from '@common/eventbus';
import { ICreateDeviceRequest, ICreateToken } from '@common/interfaces/auth.interface';
import { IEventUserFirstLoggin } from '@common/interfaces/user.interface';
import logger from '@common/logger';
import { AuthService } from '@common/services/auth.service';
import { DeviceRequestService } from '@common/services/device-request.service';
import { UserService } from '@common/services/user.service';
import {
    EVENT_TOKEN_EXPIRED,
    EVENT_USER_LOGIN,
    EVENT_DEVICE_PENDING_APPROVAL,
    EVENT_USER_FIRST_LOGIN,
} from '@config/event.constant';

export class AuthEvent {
    /**
     * Register auth event
     */
    static register(): void {
        eventbus.on(EVENT_TOKEN_EXPIRED, this.tokenExpiredHandler);
        eventbus.on(EVENT_USER_LOGIN, this.userLogInHandler);
        eventbus.on(EVENT_DEVICE_PENDING_APPROVAL, this.devicePendingApprovalHandler);
        eventbus.on(EVENT_USER_FIRST_LOGIN, this.updateLogginStatusHandler);
    }

    private static userService = UserService.getInstance();

    private static async tokenExpiredHandler(id: number): Promise<void> {
        try {
            await AuthService.deleteToken(id);
            logger.info(`AuthEvent.tokenExpiredHandler: Token deleted`);
        } catch (error: any) {
            logger.error(`AuthEvent.tokenExpiredHandler: `, error.message);
        }
    }

    private static async userLogInHandler(data: ICreateToken): Promise<void> {
        try {
            await AuthService.createToken(data);
            logger.info(`AuthEvent.userLogInHandler: Token has been saved`);
        } catch (error: any) {
            logger.error(`AuthEvent.userLogInHandler: `, error.message);
        }
    }

    private static async devicePendingApprovalHandler(data: ICreateDeviceRequest): Promise<void> {
        try {
            await DeviceRequestService.devicePendingApproval(data);
            logger.info(`AuthEvent.devicePendingApprovalHandler: Device pending approval`);
        } catch (error: any) {
            logger.error(`AuthEvent.devicePendingApprovalHandler:`, error.message);
        }
    }

    private static async updateLogginStatusHandler(data: IEventUserFirstLoggin): Promise<void> {
        try {
            if (data.status) {
                await AuthService.revokeAllTokens(data.id);
            }
            const result = await this.userService.updateLoginStatus(data);
            logger.info(`AuthEvent.updateLogginStatusHandler: User first loggin status updated id: ${result.id}`);
        } catch (error: any) {
            logger.error(`AuthEvent.updateLogginStatusHandler:`, error.message);
        }
    }
}
