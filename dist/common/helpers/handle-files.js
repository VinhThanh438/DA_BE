"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFiles = handleFiles;
const merge_file_url_1 = require("./merge-file-url");
function handleFiles(files_add, files_delete, current_files) {
    if (!files_add && !files_delete)
        return current_files;
    let filesUpdate = null;
    if (files_add || files_delete) {
        const updatedFiles = (0, merge_file_url_1.mergeFileUrl)({
            current: current_files || [],
            deletes: files_delete || [],
            update: files_add || [],
        });
        filesUpdate = updatedFiles;
    }
    return filesUpdate;
}
