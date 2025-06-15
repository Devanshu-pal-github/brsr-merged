const deduplicateSNoColumns = (columns) => {
    // Find all S.No. related columns
    const sNoColumns = columns.filter(col => 
        col.col_id.toLowerCase().replace(/[^a-z0-9]/g, '') === 'sno' ||
        col.label.toLowerCase().replace(/[^a-z0-9]/g, '').includes('sno')
    );

    if (sNoColumns.length <= 1) {
        return columns;
    }

    // Keep only the first S.No. column and remove others
    const sNoColIds = sNoColumns.map(col => col.col_id);
    return columns.filter(col => !sNoColIds.includes(col.col_id) || col.col_id === sNoColIds[0]);
};

export const transformTableMetadata = (question) => {
    if (!question?.table_metadata) return { columns: [], rows: [] };

    const { headers = [], rows = [], column_groups = [] } = question.table_metadata;

    // Transform headers into columns
    let columns = headers.map(header => ({
        col_id: header.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: header.label,
        type: header.cell_type || 'string',
        calc: false,
        required: header.required || false,
        allowed_values: header.allowed_values || [],
        min_value: header.min_value,
        max_value: header.max_value,
        default_value: header.default_value,
        parent: header.parent
    }));

    // Add Category column if not present
    if (!columns.some(col => col.col_id === 'category')) {
        columns = [
            {
                col_id: 'category',
                label: 'Category',
                type: 'string',
                calc: false,
                required: true
            },
            ...columns
        ];
    }

    // Transform column groups
    const transformedGroups = column_groups.length > 0 ? column_groups : [
        // If no groups defined, create default groups based on parent property
        ...new Set(columns.filter(col => col.parent).map(col => col.parent))
    ].map(groupLabel => {
        const groupColumns = columns.filter(col => col.parent === groupLabel);
        return {
            label: groupLabel,
            span: groupColumns.length || 1
        };
    });

    // Transform rows
    const transformedRows = rows.map((row, index) => ({
        row_id: row.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `row_${index + 1}`,
        name: row.name || `Row ${index + 1}`,
        required: row.required || false,
    }));

    return {
        columns,
        rows: transformedRows,
        column_groups: transformedGroups,
        restrictions: question.table_metadata.restrictions || {}
    };
};

export const createEmptyTableResponse = (meta) => {
    const { columns, rows } = meta;
    return {
        columns: columns,
        rows: rows.map((row) => ({
            row_id: row.row_id,
            cells: columns.map((col) => ({
                row_id: row.row_id,
                col_id: col.col_id,
                value: null,
                calc: col.calc || false
            }))
        }))
    };
}; 