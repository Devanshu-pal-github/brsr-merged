import { useEffect, useRef } from "react";
import { PencilIcon, X } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import { useGetAllPlantEmployeesQuery } from "../api/apiSlice"; // Import the RTK Query hook
import CreateEmployeePopup from "./createEmployeePopup";
import { useState } from "react";
const roleOptions = ["Admin", "HR", "Manager", "Staff", "IT"];

const EmployeeListPopup = ({ onClose }) => {
  const { data: employees, isLoading, isError, error } = useGetAllPlantEmployeesQuery();
  const [dropdownInfo, setDropdownInfo] = useState(null);
  const [showCreateEmployeePopup, setShowCreateEmployeePopup] = useState(false);
  const popupRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownInfo(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = (index, newRole) => {
    const updatedEmployees = [...(employees || [])];
    if (!updatedEmployees[index].user_role.includes(newRole.toLowerCase())) {
      updatedEmployees[index].user_role.push(newRole.toLowerCase());
      // Note: This updates local state only; you may need to call an API to persist changes
      // Consider integrating with an updateEmployeeRoles mutation
    }
    // Since RTK Query manages state, you may need to refetch or use optimistic updates
    setDropdownInfo(null);
  };

  const handleCreateEmployee = () => {
    setShowCreateEmployeePopup(true);
  };

  const handleDropdownOpen = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = popupRef.current.getBoundingClientRect();

    setDropdownInfo({
      top: rect.bottom - containerRect.top + 8,
      left: rect.left - containerRect.left - 80,
      index,
    });

    buttonRef.current = event.currentTarget;
  };

  const columns = [
    { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1.2 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "department", headerName: "Department", flex: 1 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 2,
      renderCell: (params) => (
        <div className="flex items-center h-full gap-2 flex-wrap">
          {params.row.roles.map((role, i) => (
            <span
              key={i}
              className="inline-flex justify-center items-center bg-gradient-to-r from-[#2c3e50] to-[#1A2341] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md"
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      sortable: false,
      renderCell: (params) => {
        const index = (employees || []).findIndex((d) => d.employee_id === params.row.employeeId);
        return (
          <div className="flex items-center justify-center w-full h-full">
            <button
              onClick={(e) => handleDropdownOpen(e, index)}
              className="bg-[#1A2341] text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1A2341]/70 transition cursor-pointer"
            >
              <PencilIcon size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  // Map API data to match component's expected fields
  const rows = (employees || []).map((employee, index) => ({
    id: index,
    employeeId: employee.employee_id,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    roles: employee.user_role.map((role) => role.charAt(0).toUpperCase() + role.slice(1)), // Capitalize roles
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={popupRef}
        className="bg-white rounded-xl w-[90vw] max-w-[1000px] max-h-[90vh] overflow-auto p-5 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[1.2vw] font-semibold text-[#1A2341]">Employee List</h1>
          <button
            onClick={onClose}
            className="text-[#1A2341] hover:text-[#1A2341]/50 transition-all cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && <div className="text-center py-4">Loading employees...</div>}

        {/* Error State */}
        {isError && (
          <div className="text-center py-4 text-red-600">
            Error: {error?.data?.detail || "Failed to fetch employees"}
          </div>
        )}

        {/* DataGrid */}
        {!isLoading && !isError && (
          <div style={{ height: 500, width: "100%" }} className="mb-5">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={6}
              rowsPerPageOptions={[6]}
              disableRowSelectionOnClick
              hideFooter
              sx={{
                fontSize: "0.875rem",
                ".MuiDataGrid-columnHeaders": {
                  backgroundColor: "#F5F6FA",
                  color: "#1A2341",
                  fontWeight: "bold",
                },
                ".MuiDataGrid-cell": { alignItems: "center" },
              }}
            />
          </div>
        )}

        {/* Create Button */}
        <div className="flex justify-start">
          <button
            onClick={handleCreateEmployee}
            className="bg-[#1A2341] text-white px-6 py-3 hover:bg-[#1A2341]/80 transition cursor-pointer"
          >
            Create Employee
          </button>
        </div>

        {/* Dropdown Menu */}
        {dropdownInfo && (
          <div
            ref={dropdownRef}
            className="absolute bg-white border border-gray-200 rounded-md shadow-xl z-[9999] w-32"
            style={{ top: dropdownInfo.top, left: dropdownInfo.left }}
          >
            {roleOptions.map((role, i) => (
              <div
                key={i}
                onClick={() => handleRoleChange(dropdownInfo.index, role)}
                className="px-3 py-2 text-sm text-[#1A2341] hover:bg-gray-100 cursor-pointer"
              >
                {role}
              </div>
            ))}
          </div>
        )}
      </div>
      {showCreateEmployeePopup && (
        <CreateEmployeePopup onClose={() => setShowCreateEmployeePopup(false)} />
      )}
    </div>
  );
};

export default EmployeeListPopup;