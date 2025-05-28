import React from "react";

export default function DuoTableComponent({ title, fields = [], rows = [], onEditClick, onUpdate = () => {} }) {
  const [editing, setEditing] = React.useState(false);
  const [editValues, setEditValues] = React.useState(rows || []); // Defensive default

  const handleEditClick = () => {
    if (editing) {
      // Apply formulas for fields with type: "calc"
      let finalValues = editValues.map(row => {
        const updatedRow = { ...row };
        // Collect all field keys, including those in subFields
        const allFieldKeys = fields.flatMap(field => 
          field.subFields ? field.subFields.map(subField => subField.key) : field.key
        ).filter(key => key && key !== "category"); // Exclude category

        allFieldKeys.forEach(fieldKey => {
          if (row[fieldKey]?.type === "calc") {
            try {
              const formulaFn = new Function("rows", `return ${row[fieldKey].formula}`);
              let result = formulaFn(editValues);

              // Handle invalid results (undefined, NaN, Infinity, negative)
              if (result === undefined || isNaN(result) || !isFinite(result)) {
                result = 0; // Default to 0 for invalid results
              } else if (result < 0) {
                result = 0; // Prevent negative results
              }

              updatedRow[fieldKey] = {
                ...updatedRow[fieldKey],
                value: result
              };
            } catch (error) {
              console.error("Error applying formula:", error);
              updatedRow[fieldKey] = {
                ...updatedRow[fieldKey],
                value: 0
              };
            }
          }
        });
        return updatedRow;
      });

      // Save changes
      onUpdate(finalValues);
      setEditValues(finalValues);
    }
    setEditing(!editing);
    if (onEditClick) onEditClick();
  };

  const handleInputChange = (rowIndex, fieldKey, value, inputType) => {
    const updatedRows = [...editValues];
    let newValue;

    switch (inputType) {
      case "number":
        const numericValue = Number(value);
        if (numericValue < 0) return; // Restrict negative numbers
        newValue = numericValue || 0;
        break;
      case "text":
        newValue = value;
        break;
      case "boolean":
        newValue = value; // For checkbox, value is true/false
        break;
      default:
        newValue = value;
    }

    updatedRows[rowIndex][fieldKey] = {
      ...updatedRows[rowIndex][fieldKey],
      value: newValue
    };
    setEditValues(updatedRows);
  };

  const renderInput = (row, rowIndex, fieldKey) => {
    const field = row[fieldKey];
    // Validate field structure
    if (!field || typeof field !== "object" || !field.type) {
      return <span>Invalid data</span>;
    }

    const inputType = field.inputType || "number"; // Default to number if not specified

    switch (inputType) {
      case "number":
        return (
          <input
            type="number"
            value={field.value}
            onChange={(e) =>
              handleInputChange(rowIndex, fieldKey, e.target.value, "number")
            }
            placeholder="Enter a number"
            className="w-full text-center border rounded px-1 py-0.5 text-[12px]"
          />
        );
      case "text":
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) =>
              handleInputChange(rowIndex, fieldKey, e.target.value, "text")
            }
            placeholder="Enter text"
            className="w-full text-center border rounded px-1 py-0.5 text-[12px]"
          />
        );
      case "boolean":
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) =>
                handleInputChange(rowIndex, fieldKey, e.target.checked, "boolean")
              }
              className="mx-auto"
            />
          </div>
        );
      default:
        return <span>{field.value}</span>;
    }
  };

  // Defensive checks for props
  if (!Array.isArray(fields) || fields.length === 0) {
    console.error("DuoTableComponent: fields prop is not a valid array", fields);
    return <div>Error: Table fields are missing or invalid.</div>;
  }

  if (!Array.isArray(editValues)) {
    console.error("DuoTableComponent: editValues is not an array", editValues);
    return <div>Error: Table rows are missing or invalid.</div>;
  }

  // Calculate total number of columns (including subfields) for colSpan
  const totalColumns = fields.reduce((sum, field) => 
    sum + (field.subFields ? field.subFields.length : 1), 0);

  // Collect all editable field keys (excluding category) for formula application and rendering
  const editableFieldKeys = fields.flatMap(field => 
    field.subFields ? field.subFields.map(subField => subField.key) : field.key
  ).filter(key => key !== "category");

  return (
    <div className="w-full max-w-full h-auto p-3 pt-0 rounded-[8px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] md:text-[14px] font-semibold text-[#000D30]">{title || "Untitled Table"}</h2>
   {onEditClick && (
            <button
              onClick={handleEditClick}
              className="w-[38px] h-[23px] bg-[#002A85] text-white text-[9px] rounded-md flex items-center justify-center"
            >
              {editing ? "Save" : "Edit"}
            </button>
          )}
         
      </div>

      <div className="bg-white rounded-[8px] overflow-x-auto shadow-sm">
        <table className="w-full min-w-[600px] table-fixed">
          <thead>
            {/* First Header Row: Main columns and groups */}
            <tr className="bg-[#F3F4F6]">
              {fields.map((field, idx) => (
                field.subFields ? (
                  <th
                    key={idx}
                    colSpan={field.subFields.length}
                    className={`py-1.5 px-4 text-center font-semibold text-[#000D30] text-xs ${
                      field.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {field.label}
                  </th>
                ) : (
                  <th
                    key={idx}
                    rowSpan={2}
                    className={`py-1.5 px-4 font-semibold text-gray-700 text-xs ${
                      field.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {field.label}
                  </th>
                )
              ))}
            </tr>
            {/* Second Header Row: Subcolumns for grouped fields */}
            <tr className="bg-[#F3F4F6]">
              {fields.map((field, idx) => (
                field.subFields ? (
                  field.subFields.map((subField, subIdx) => (
                    <th
                      key={`${idx}-${subIdx}`}
                      className={`py-1 px-2 text-[10px] text-gray-700 border-gray-300 ${
                        subField.align === "center" ? "text-center" : "text-left"
                      }`}
                    >
                      {subField.label}
                    </th>
                  ))
                ) : null
              ))}
            </tr>
          </thead>
          <tbody>
            {editValues.length > 0 ? (
              editValues.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex === editValues.length - 1 ? "bg-gray-50 font-medium" : "border-b border-gray-200"
                  }`}
                >
                  {fields.map((field, fieldIdx) => (
                    field.subFields ? (
                      field.subFields.map((subField, subIdx) => (
                        <td
                          key={`${fieldIdx}-${subIdx}`}
                          className={`py-1.5 px-2 text-[10px] md:text-[12px] border-gray-300 ${
                            subField.align === "center" ? "text-center" : "text-left"
                          }`}
                        >
                          {editing &&
                          row[subField.key] &&
                          typeof row[subField.key] === "object" &&
                          row[subField.key].type !== "calc" ? (
                            renderInput(row, rowIndex, subField.key)
                          ) : (
                            row[subField.key]?.value ?? row[subField.key] ?? "N/A"
                          )}
                        </td>
                      ))
                    ) : (
                      <td
                        key={fieldIdx}
                        className={`py-1.5 px-4 text-[10px] md:text-[12px] text-black border-gray-300 ${
                          field.align === "center" ? "text-center" : "text-left"
                        }`}
                      >
                        {row[field.key]}
                      </td>
                    )
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={totalColumns} className="py-2 text-center text-[12px] text-gray-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}