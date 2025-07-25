"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDataExclude = filterDataExclude;
function filterDataExclude(data, excludedFields, listFields = []) {
    const processItem = (item) => {
        const filteredItem = {};
        for (const key in item) {
            if (excludedFields.includes(key)) {
                continue;
            }
            const value = item[key];
            if (listFields.includes(key) && Array.isArray(value)) {
                filteredItem[key] = value.map((element) => {
                    if (typeof element === 'object' && element !== null) {
                        const filteredElement = {};
                        for (const subKey in element) {
                            if (!excludedFields.includes(subKey)) {
                                filteredElement[subKey] = element[subKey];
                            }
                        }
                        return filteredElement;
                    }
                    return element;
                });
            }
            else {
                filteredItem[key] = value;
            }
        }
        return filteredItem;
    };
    if (Array.isArray(data)) {
        return data.map(processItem);
    }
    else {
        return processItem(data);
    }
}
