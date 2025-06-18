/**
 * Enhanced generic utility to build where conditions for array-based filters
 */
export function buildArrayFilters<T = any>(
    filters: Record<string, any[] | undefined>,
    config: Record<string, string | FilterConfig>
): T {
    const where: any = {};

    Object.entries(filters).forEach(([filterKey, values]) => {
        if (!values?.length) return;
        
        const mapping = config[filterKey];
        if (!mapping) return;

        if (typeof mapping === 'string') {
            // Simple field mapping: warehouseIds -> warehouse_id
            where[mapping] = { in: values };
        } else {
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
                        } else {
                            // Array relationship (1:many) - use some/every/none
                            current[part] = {
                                [type]: {
                                    [field]: { in: values }
                                }
                            };
                        }
                    } else {
                        // Intermediate parts
                        if (!current[part]) current[part] = {};
                        current = current[part];
                    }
                });
            } else {
                // Direct field with custom configuration
                where[field] = { in: values };
            }
        }
    });

    return where;
}

/**
 * Configuration interface for complex filtering
 */
interface FilterConfig {
    field: string;           // Target field name
    relation?: string;       // Relationship path (e.g., 'details', 'shipping_plan', 'order')
    type?: 'some' | 'every' | 'none'; // Prisma relation filter type for array relationships
    isDirect?: boolean;      // True for direct relationships (1:1), false for array relationships (1:many)
}