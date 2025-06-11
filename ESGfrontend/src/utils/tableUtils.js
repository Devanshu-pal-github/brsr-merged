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

    const { headers = [], rows = [] } = question.table_metadata;

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
    }));

    // Add S.No. column if not present
    if (!columns.some(col => col.col_id === 's_no')) {
        columns = [
            {
                col_id: 's_no',
                label: 'S No.',
                type: 'decimal',
                calc: true,
                required: false
            },
            ...columns
        ];
    }

    // Deduplicate S.No. columns
    columns = deduplicateSNoColumns(columns);

    // Transform rows
    const transformedRows = rows.map((row, index) => ({
        row_id: row.name || `row_${index + 1}`,
        name: row.name || `Row ${index + 1}`,
        required: row.required || false,
    }));

    return {
        columns,
        rows: transformedRows
    };
}; 