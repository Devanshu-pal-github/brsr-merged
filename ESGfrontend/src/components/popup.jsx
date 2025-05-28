import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PopUp({ isOpen, onClose, fields, rowData, onSave }) {
  const [formData, setFormData] = useState(rowData || {});

  const handleChange = (key, value, type) => {
    let parsedValue = value;
    if (type === "number") {
      const numeric = Number(value);
      if (isNaN(numeric) || numeric < 0) return; // Prevent negative or invalid numbers
      parsedValue = numeric;
    }
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: parsedValue,
      },
    }));
  };

  const renderField = (key, field) => {
    if (!field || typeof field !== "object") return <span>Invalid</span>;

    const inputType = field.inputType || "number";

    switch (inputType) {
      case "number":
      case "text":
        return (
          <input
            className="w-full border p-1 rounded text-sm"
            type={inputType}
            value={field.value ?? ""}
            onChange={(e) => handleChange(key, e.target.value, inputType)}
          />
        );
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={field.value || false}
            onChange={(e) => handleChange(key, e.target.checked, "boolean")}
          />
        );
      default:
        return <span>{field.value}</span>;
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Row</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-sm font-medium">{field.label}</label>
              {renderField(field.key, formData[field.key])}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="border border-gray-300 px-4 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}