import logger from '@common/logger';
import { DoneCallback, Job, Queue } from 'bull';
import { DAILY_FILE_CLEANUP_JOB as JOB_NAME } from '@config/job.constant';
import { promises as fs } from 'fs';
import path from 'path';
import { QueueService } from '@common/services/queue.service';

const UPLOAD_DIR = path.join(__dirname, '../../../upload/excel');
const UPLOAD_TEMPLATE_DIR = path.join(__dirname, '../../../upload/template');
const UPLOAD_IMPORT_FILE_DIR = path.join(__dirname, '../../../upload/import');
const EXCEL_EXTENSIONS = ['.xlsx', '.xls'];

export class DeleteFileDailyJob {
    static async register(): Promise<Queue<unknown>> {
        logger.info(`Listening to queue: ${JOB_NAME}`);
        const queue = await QueueService.getQueue<unknown>(JOB_NAME);

        const jobOpts = {
            repeat: {
                // cron: '* * * * *', // Mỗi phút
                cron: '0 3 * * *', // 3 a.m mỗi ngày/
                tz: 'Asia/Ho_Chi_Minh',
            },
        };

        await queue.clean(5000, 'delayed');
        await queue.add({ job: JOB_NAME }, jobOpts);
        await queue.process(DeleteFileDailyJob.handler);

        return queue;
    }

    private static async deleteExcelFiles(directory: string): Promise<void> {
        const files = await fs.readdir(directory);

        for (const file of files) {
            if (EXCEL_EXTENSIONS.some((ext) => file.endsWith(ext))) {
                const filePath = path.join(directory, file);
                try {
                    await fs.unlink(filePath);
                    logger.info(`Deleted file: ${filePath}`);
                } catch (err) {
                    logger.error(`Failed to delete file: ${filePath}`, err);
                }
            }
        }
    }

    static async handler(job: Job, done: DoneCallback): Promise<void> {
        try {
            logger.debug(`Process job ${JOB_NAME}-${job.id}`);

            await Promise.all([
                DeleteFileDailyJob.deleteExcelFiles(UPLOAD_DIR),
                DeleteFileDailyJob.deleteExcelFiles(UPLOAD_TEMPLATE_DIR),
                DeleteFileDailyJob.deleteExcelFiles(UPLOAD_IMPORT_FILE_DIR),
            ]);

            logger.debug(`Processed job ${JOB_NAME}-${job.id}`);
            done();
        } catch (error) {
            logger.error(`Process ${JOB_NAME}-${job.id} error: `, error);
            done(error as Error);
        }
    }
}
