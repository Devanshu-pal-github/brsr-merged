import React from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography, Paper
} from "@mui/material";

/**
 * @typedef {Object} TableColumnResponse
 * @property {string} col_id
 * @property {string} [label]
 * @property {string} [type]
 * @property {boolean} [calc]
 * @property {string} [note]
 */

/**
 * @typedef {Object} TableCellResponse
 * @property {string} row_id
 * @property {string} col_id
 * @property {string|number|boolean|null} value
 * @property {boolean} [calc]
 * @property {string} [note]
 */

/**
 * @typedef {Object} TableRowResponse
 * @property {string} row_id
 * @property {TableCellResponse[]} cells
 * @property {boolean} [calc]
 * @property {string} [note]
 */

/**
 * @typedef {Object} TableQuestionResponse
 * @property {string} question_id
 * @property {TableColumnResponse[]} columns
 * @property {TableRowResponse[]} rows
 * @property {string} [meta_version]
 * @property {string} [last_updated]
 * @property {string} [updated_by]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} TableQuestionMeta
 * @property {TableColumnResponse[]} columns
 * @property {{row_id: string, label?: string, calc?: boolean, note?: string}[]} rows
 * @property {Object} [restrictions]
 */

const TableQuestionRenderer = ({ meta, response, editable = false, onCellChange }) => {
  // Helper: get value for a cell from response, or empty string if not present
  const getCellValue = (rowId, colId) => {
    const row = response?.rows?.find(r => r.row_id === rowId);
    if (!row) return "";
    const cell = row.cells.find(c => c.col_id === colId);
    return cell ? cell.value ?? "" : "";
  };

  // Helper: is cell calculated/readonly
  const isCellReadOnly = (rowId, colId) => {
    const col = meta.columns.find(c => c.col_id === colId);
    const row = meta.rows.find(r => r.row_id === rowId);
    return (col && col.calc) || (row && row.calc);
  };

  // Helper: get cell note
  const getCellNote = (rowId, colId) => {
    const row = response?.rows?.find(r => r.row_id === rowId);
    const cell = row?.cells.find(c => c.col_id === colId);
    return cell?.note || "";
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }} className="rounded-[6px] border border-gray-200 shadow-sm">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            {meta.columns.map(col => (
              <TableCell key={col.col_id} className="bg-gray-50 text-left px-3 py-2 text-xs font-semibold text-[#1A2341] border-b border-gray-200">
                <Tooltip title={col.note || ""}>
                  <span>
                    {col.label || col.col_id}
                    {col.calc && <span className="text-gray-500"> (calc)</span>}
                  </span>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {meta.rows.map(rowMeta => (
            <TableRow key={rowMeta.row_id}>
              <TableCell className="px-3 py-2 text-sm font-medium text-[#1A2341] bg-gray-50">
                <Tooltip title={rowMeta.note || ""}>
                  <span>
                    {rowMeta.label || rowMeta.row_id}
                    {rowMeta.calc && <span className="text-gray-500"> (calc)</span>}
                  </span>
                </Tooltip>
              </TableCell>
              {meta.columns.map(col => {
                const value = getCellValue(rowMeta.row_id, col.col_id);
                const readOnly = isCellReadOnly(rowMeta.row_id, col.col_id) || !editable;
                const cellNote = getCellNote(rowMeta.row_id, col.col_id);
                return (
                  <TableCell key={col.col_id} className="px-3 py-2 text-sm text-gray-600">
                    <Tooltip title={cellNote}>
                      <span>
                        {readOnly ? (
                          <Typography variant="body2">{String(value)}</Typography>
                        ) : (
                          <TextField
                            value={value}
                            size="small"
                            type={col.type === "number" ? "number" : "text"}
                            onChange={e =>
                              onCellChange &&
                              onCellChange(
                                rowMeta.row_id,
                                col.col_id,
                                col.type === "number" ? Number(e.target.value) : e.target.value
                              )
                            }
                            inputProps={{ readOnly }}
                            fullWidth
                            className="text-[13px]"
                          />
                        )}
                      </span>
                    </Tooltip>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Table-level notes */}
      {(response?.notes || meta?.restrictions) && (
        <Typography variant="caption" color="textSecondary" className="mt-2 block px-3 pb-2 text-[10px] text-gray-600 italic">
          {response?.notes && <>Notes: {response.notes} <br /></>}
          {meta?.restrictions && <>Restrictions: {JSON.stringify(meta.restrictions)}</>}
        </Typography>
      )}
    </TableContainer>
  );
};

export default TableQuestionRenderer;
