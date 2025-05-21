import { deleteFileSystem } from './delete-file-system';
import { mergeFileUrl } from './merge-file-url';

export function handleFiles(files_add: string[] | undefined, files_delete: string[] | undefined, current_files: any) {
    let filesUpdate = null;
    if (files_add || files_delete) {
        const updatedFiles = mergeFileUrl({
            current: current_files || [],
            deletes: files_delete || [],
            update: files_add || [],
        });

        filesUpdate = updatedFiles;
    }

    return filesUpdate;
}
