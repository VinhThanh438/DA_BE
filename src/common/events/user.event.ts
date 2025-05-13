import eventbus from '@common/eventbus';
import { IEmployee } from '@common/interfaces/employee.interface';
import { IUpdateEmployeeAccountStatus } from '@common/interfaces/user.interface';
import logger from '@common/logger';
import { EmployeeService } from '@common/services/employee.service';
import { EVENT_USER_CREATED_OR_DELETED } from '@config/event.constant';

export class UserEvent {
    /**
     * Register user event
     */
    static register(): void {
        eventbus.on(EVENT_USER_CREATED_OR_DELETED, this.updateEmployeeAccountStatusHandler);
    }

    private static employeeService = EmployeeService.getInstance()

    private static async updateEmployeeAccountStatusHandler(body: IUpdateEmployeeAccountStatus): Promise<void> {
        try {
            await this.employeeService.update(body.employeeId, { has_user_account: body.status } as IEmployee);
            logger.info('UserEvent.updateEmployeeAccountStatusHandler: Employee status updated successfully!');
        } catch (error: any) {
            logger.error('UserEvent.updateEmployeeAccountStatusHandler:', error.message);
        }
    }
}
