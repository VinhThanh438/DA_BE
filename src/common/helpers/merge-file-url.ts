export function mergeFileUrl(body: { current: string[]; deletes: string[]; update: string[] }): string[] {
    const { current = [], deletes = [], update = [] } = body;

    let updatedFiles = current.filter((file: string) => !deletes.includes(file));

    return [...updatedFiles, ...update];
}
