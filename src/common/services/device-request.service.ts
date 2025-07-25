import { DeviceRequests } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { ICreateDeviceRequest } from '@common/interfaces/auth.interface';
import { ICreateAndUpdateResponse, IJobSendConfirmEmailData } from '@common/interfaces/common.interface';
import { DeviceRequestRepo } from '@common/repositories/device-request.repo';
import { RequestStatus } from '@config/app.constant';
import { SEND_CONFIRM_MAIL_JOB } from '@config/job.constant';
import { QueueService } from './queue.service';
import eventbus from '@common/eventbus';
import { IEventUserFirstLoggin } from '@common/interfaces/user.interface';
import { EVENT_USER_FIRST_LOGIN } from '@config/event.constant';
import { UserRepo } from '@common/repositories/user.repo';

export class DeviceRequestService {
    private static userRepo = new UserRepo();

    public static async getAll(): Promise<DeviceRequests[]> {
        return DeviceRequestRepo.getAll();
    }

    public static async devicePendingApproval(data: ICreateDeviceRequest): Promise<void> {
        const existRequest = await DeviceRequestRepo.findOne({
            device_uid: data.device,
            user_id: data.userId,
        });

        if (!existRequest) {
            await DeviceRequestRepo.create({
                device_uid: data.device,
                ip_address: data.ip,
                user_agent: data.ua,
                user_id: data.userId,
            });
        }
    }

    public static async approveRequest(
        id: number,
        status: RequestStatus,
        approvedBy?: number,
    ): Promise<ICreateAndUpdateResponse> {
        const existRequest = await DeviceRequestRepo.findOne({ id, status: RequestStatus.PENDING });
        if (!existRequest) {
            throw new APIError({
                message: 'request.common.not-found',
                status: StatusCode.REQUEST_NOT_FOUND,
            });
        }

        const data = (await DeviceRequestRepo.update(id, status, approvedBy)) as ICreateAndUpdateResponse;
        if (!data) {
            throw new APIError({
                message: 'request.common.not-found',
                status: StatusCode.REQUEST_NOT_FOUND,
            });
        }

        const userData = await this.userRepo.findOne({ id: data.userId });
        if (!userData) {
            throw new APIError({
                message: 'user.common.not-found',
                status: StatusCode.REQUEST_NOT_FOUND,
            });
        }

        // send email
        await (
            await QueueService.getQueue(SEND_CONFIRM_MAIL_JOB)
        ).add(SEND_CONFIRM_MAIL_JOB, {
            email: userData?.email as string,
            name: userData?.username,
            status,
        });

        // allow user loggin without device id
        eventbus.emit(EVENT_USER_FIRST_LOGIN, {
            id: userData.id,
            device: undefined,
            status: true,
        } as IEventUserFirstLoggin);

        return data;
    }
}
