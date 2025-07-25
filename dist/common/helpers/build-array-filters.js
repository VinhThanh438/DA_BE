"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildArrayFilters = buildArrayFilters;
/**
 * Enhanced generic utility to build where conditions for array-based filters
 */
function buildArrayFilters(filters, config) {
    const where = {};
    Object.entries(filters).forEach(([filterKey, values]) => {
        if (!(values === null || values === void 0 ? void 0 : values.length))
            return;
        const mapping = config[filterKey];
        if (!mapping)
            return;
        if (typeof mapping === 'string') {
            // Simple field mapping: warehouseIds -> warehouse_id
            where[mapping] = { in: values };
        }
        else {
            // Complex relationship mapping
            const { field, relation, type = 'some', isDirect = false } = mapping;
            if (relation) {
                const relationParts = relation.split('.');
                let current = where;
                // Build nested relationship structure
                relationParts.forEach((part, index) => {
                    if (index === relationParts.length - 1) {
                        // Last part - apply the filter
                        if (isDirect) {
                            // Direct relationship (1:1) - no some/every needed
                            current[part] = {
                                [field]: { in: values }
                            };
                        }
                        else {
                            // Array relationship (1:many) - use some/every/none
                            current[part] = {
                                [type]: {
                                    [field]: { in: values }
                                }
                            };
                        }
                    }
                    else {
                        // Intermediate parts
                        if (!current[part])
                            current[part] = {};
                        current = current[part];
                    }
                });
            }
            else {
                // Direct field with custom configuration
                where[field] = { in: values };
            }
        }
    });
    return where;
}
