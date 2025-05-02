export function filterDataExclude<T extends Record<string, any>>(
    data: T | T[],
    excludedFields: string[],
    listFields: string[] = [],
): Partial<T> | Partial<T>[] {
    const processItem = (item: T): Partial<T> => {
        const filteredItem: Partial<T> = {};

        for (const key in item) {
            if (excludedFields.includes(key)) {
                continue;
            }

            const value = item[key];

            if (listFields.includes(key) && Array.isArray(value)) {
                filteredItem[key] = value.map((element: any) => {
                    if (typeof element === 'object' && element !== null) {
                        const filteredElement: Record<string, any> = {};
                        for (const subKey in element) {
                            if (!excludedFields.includes(subKey)) {
                                filteredElement[subKey] = element[subKey];
                            }
                        }
                        return filteredElement;
                    }
                    return element;
                });
            } else {
                filteredItem[key] = value;
            }
        }

        return filteredItem;
    };

    if (Array.isArray(data)) {
        return data.map(processItem);
    } else {
        return processItem(data);
    }
}
