"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeFileUrl = mergeFileUrl;
function mergeFileUrl(body) {
    const { current = [], deletes = [], update = [] } = body;
    let updatedFiles = current.filter((file) => !deletes.includes(file));
    return [...updatedFiles, ...update];
}
