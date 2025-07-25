import eventbus from '@common/eventbus';
import { deleteFileSystem } from '@common/helpers/delete-file-system';
import logger from '@common/logger';
import { EVENT_DELETE_UNUSED_FILES } from '@config/event.constant';

export class FileEvent {
    /**
     * Register File event
     */
    public static register(): void {
        eventbus.on(EVENT_DELETE_UNUSED_FILES, this.deleteUnusedFilesHandler.bind(this));
    }

    private static async deleteUnusedFilesHandler(body: string[]): Promise<void> {
        try {
            await deleteFileSystem(body);
            logger.info('FileEvent.deleteUnusedFilesHandler: Unused files deleted successfully.');
        } catch (error: any) {
            logger.error('FileEvent.deleteUnusedFilesHandler:', error);
        }
    }
}
