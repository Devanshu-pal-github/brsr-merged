import React from "react";

export default function BigTable({ title, fields, rows, onEditClick ,onAIHelpClick = () => console.log("AI Help clicked"), onUpdate = () => {} } ) {
  const [editing, setEditing] = React.useState(false);
  const [editValues, setEditValues] = React.useState(rows || []); // Defensive default

  const handleEditClick = () => {
    if (editing) {
      // Apply formulas for fields with type: "calc"
      let finalValues = editValues.map(row => {
        const updatedRow = { ...row };
        fields.forEach(field => {
          if (field.key !== "category" && row[field.key]?.type === "calc") {
            try {
              const formulaFn = new Function("rows", `return ${row[field.key].formula}`);
              let result = formulaFn(editValues);

              // Handle invalid results (undefined, NaN, Infinity, negative)
              if (
                result === undefined ||
                isNaN(result) ||
                !isFinite(result)
              ) {
                result = 0; // Default to 0 for invalid results
              } else if (result < 0) {
                result = 0; // Prevent negative results
              }

              updatedRow[field.key] = {
                ...updatedRow[field.key],
                value: result
              };
            } catch (error) {
              console.error("Error applying formula:", error);
              updatedRow[field.key] = {
                ...updatedRow[field.key],
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
    console.error("BigTable: fields prop is not a valid array", fields);
    return <div>Error: Table fields are missing or invalid.</div>;
  }

  if (!Array.isArray(editValues)) {
    console.error("BigTable: editValues is not an array", editValues);
    return <div>Error: Table rows are missing or invalid.</div>;
  }

  return (
    <div className="w-full max-w-full h-auto p-3 pt-0 rounded-[8px] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] md:text-[14px] font-semibold text-[#000D30]">{title || "Untitled Table"}</h2>
         <div className="flex gap-2">
          {onEditClick && (
            <button
              onClick={handleEditClick}
              className="w-[38px] h-[23px] bg-[#002A85] text-white text-[9px] rounded-md flex items-center justify-center"
            >
              {editing ? "Save" : "Edit"}
            </button>
          )}
          <button
            onClick={onAIHelpClick}
            className="w-[50px] h-[22px] bg-[#002A85] text-white text-[9px] rounded-md flex items-center justify-center"
          >
            AI Help
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[8px] overflow-x-auto shadow-sm">
        <table className="w-full min-w-[360px] table-fixed">
          <thead>
            <tr className="bg-[#F3F4F6]">
              {fields.map((field, idx) => (
                <th
                  key={idx}
                  className={`py-2 px-1 sm:px-2 font-medium text-gray-700 text-[10px] ${
                    field.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editValues.length > 0 ? (
              editValues.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex === editValues.length - 1
                      ? "bg-gray-50 font-medium"
                      : "border-b border-gray-200"
                  }`}
                >
                  {fields.map((field, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-1 px-1 sm:px-2 text-[12px] text-black ${
                        field.align === "center" ? "text-center" : ""
                      }`}
                    >
                      {editing &&
                      field.key !== "category" &&
                      row[field.key] &&
                      typeof row[field.key] === "object" &&
                      row[field.key].type !== "calc" ? (
                        renderInput(row, rowIndex, field.key)
                      ) : (
                        row[field.key]?.value ?? row[field.key] ?? "N/A"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={fields.length} className="py-2 text-center text-[12px] text-gray-500">
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