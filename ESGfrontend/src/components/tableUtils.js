// tableUtils.js
export const transformTableMetadata = (backendMeta) => {
  if (!backendMeta?.table_metadata || !Array.isArray(backendMeta.table_metadata.columns) || backendMeta.table_metadata.columns.length === 0) {
    // Fallback: try to use headers as columns if present (for legacy/partial data)
    if (Array.isArray(backendMeta.table_metadata.headers) && backendMeta.table_metadata.headers.length > 0) {
      return {
        columns: backendMeta.table_metadata.headers.map((h, idx) => {
          if (typeof h === 'string') {
            return {
              col_id: h.replace(/\s+/g, '_').toLowerCase() || `col_${idx}`,
              label: h,
              type: 'string',
            };
          } else if (h && typeof h === 'object' && h.label) {
            return {
              col_id: h.label.replace(/\s+/g, '_').toLowerCase() || `col_${idx}`,
              label: h.label,
              type: h.type || 'string',
            };
          } else {
            return {
              col_id: `col_${idx}`,
              label: `Column ${idx + 1}`,
              type: 'string',
            };
          }
        }),
        rows: Array.isArray(backendMeta.table_metadata.rows)
          ? backendMeta.table_metadata.rows.map((row, idx) => ({
              row_id: row.name && typeof row.name === 'string' ? row.name.replace(/\s+/g, '_').toLowerCase() : `row_${idx}`,
              label: row.name || `Row ${idx + 1}`,
            }))
          : [],
        restrictions: backendMeta?.table_metadata?.restrictions || undefined
      };
    }
    // If no columns, fallback to empty
    return {
      columns: [],
      rows: Array.isArray(backendMeta.table_metadata.rows)
        ? backendMeta.table_metadata.rows.map((row, idx) => ({
            row_id: row.name.replace(/\s+/g, '_').toLowerCase() || `row_${idx}`,
            label: row.name,
          }))
        : [],
      restrictions: backendMeta?.table_metadata?.restrictions || undefined
    };
  }
  const { columns, rows } = backendMeta.table_metadata;
  return {
    columns: columns.map((col, idx) => ({
      col_id: (col.label ? col.label.replace(/\s+/g, '_').toLowerCase() : col.col_id || `col_${idx}`),
      label: col.label || col.col_id || `Column ${idx + 1}`,
      type: col.type || 'string',
      calc: col.special || false,
      note: col.calc_formula ? `Calculation: ${col.calc_formula}` : undefined
    })),
    rows: rows.map((row, idx) => ({
      row_id: (row.name ? row.name.replace(/\s+/g, '_').toLowerCase() : row.row_id || `row_${idx}`),
      label: row.name || row.row_id || `Row ${idx + 1}`,
      calc: row.special || false,
      note: row.calc_formula ? `Calculation: ${row.calc_formula}` : undefined
    })),
    restrictions: backendMeta.table_metadata.restrictions
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
