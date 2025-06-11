// tableUtils.js
export const transformTableMetadata = (question) => {
  if (!question.table_metadata) return { columns: [], rows: [] };

  // Transform headers into columns
  const columns = question.table_metadata.headers?.map(header => ({
    col_id: header.label?.toLowerCase().replace(/\s+/g, '_').replace(/[()%]/g, ''),
    label: header.label,
    type: header.cell_type || 'string',
    calc: false,
    required: header.required || false
  })) || [];

  // Transform rows
  const rows = question.table_metadata.rows?.map(row => ({
    row_id: row.name?.toLowerCase().replace(/\s+/g, '_'),
    label: row.name,
    calc: false
  })) || [];

  return {
    columns,
    rows,
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
        calc: col.calc || row.calc || false
      }))
    }))
  };
};
