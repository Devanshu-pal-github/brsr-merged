import { useEffect, useRef, useState, useMemo } from "react";
import { PencilIcon, X, Search } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import { useGetAllPlantEmployeesQuery } from "../../api/apiSlice";
import Select from "react-select";
import EmployeePopup from "./createEmployeePopup";
import DeleteRolesPopup from "./DeleteRolesPopup";
import toast, { Toaster } from "react-hot-toast";

const EmployeeListPopup = ({ onClose }) => {
  const { data: employees, isLoading, isError, error } = useGetAllPlantEmployeesQuery();
  const [dropdownInfo, setDropdownInfo] = useState(null);
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);
  const [showDeleteRolesPopup, setShowDeleteRolesPopup] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ department: "", roles: [] });
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

  const handleActionClick = (event, index) => {
    const employee = employees[index];
    if (!employee) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = popupRef.current.getBoundingClientRect();
    setDropdownInfo({
      top: rect.bottom - containerRect.top + 8,
      left: rect.left - containerRect.left - 80,
      index,
      employeeId: employee.employee_id,
    });
    buttonRef.current = event.currentTarget;
  };

  const handleUpdateClick = () => {
    const employee = employees[dropdownInfo.index];
    setSelectedEmployee(employee);
    setShowEmployeePopup(true);
    setDropdownInfo(null);
  };

  const handleDeleteClick = () => {
    const employee = employees[dropdownInfo.index];
    setSelectedEmployee(employee);
    setShowDeleteRolesPopup(true);
    setDropdownInfo(null);
  };

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setShowEmployeePopup(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const departmentOptions = useMemo(() => {
    const departments = [...new Set(employees?.map((emp) => emp.department).filter(Boolean))];
    return [{ value: "", label: "All Departments" }, ...departments.map((dep) => ({ value: dep, label: dep }))];
  }, [employees]);

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "it", label: "IT" },
    { value: "legal", label: "Legal" },
    { value: "hr", label: "Hr" },
  ];

  const filteredRows = useMemo(() => {
    return (employees || []).map((employee, index) => ({
      id: index,
      employeeId: employee.employee_id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      roles: employee.user_role.map((role) => role.charAt(0).toUpperCase() + role.slice(1)),
      originalRoles: employee.user_role, // Store original lowercase roles
    })).filter((row) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        row.employeeId.toLowerCase().includes(searchLower) ||
        row.name.toLowerCase().includes(searchLower) ||
        row.email.toLowerCase().includes(searchLower) ||
        row.department.toLowerCase().includes(searchLower);
      const matchesDepartment = !filters.department || row.department === filters.department;
      const matchesRoles =
        filters.roles.length === 0 ||
        filters.roles.some((role) => row.originalRoles.includes(role.value));
      return matchesSearch && matchesDepartment && matchesRoles;
    });
  }, [employees, searchQuery, filters]);

  const columns = [
    { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1.2 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "department", headerName: "Department", flex: 1 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 2,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center h-full gap-2 flex-wrap">
          {params.row.roles.map((role, i) => (
            <span
              key={i}
              className="inline-flex justify-center items-center bg-gradient-to-r from-[#2c3e50] to-[#1A2341] text-white text-xs  px-3 py-1 rounded-full shadow-md"
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      flex: 0.6,
      sortable: false,
      renderCell: (params) => {
        const index = (employees || []).findIndex((d) => d.employee_id === params.row.employeeId);
        return (
          <div className="flex items-center justify-center w-full h-full">
            <button
              onClick={(e) => handleActionClick(e, index)}
              className="bg-[#1A2341] text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1A2341]/70 transition cursor-pointer"
            >
              <PencilIcon size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={popupRef}
        className="bg-white rounded-xl w-[90vw] max-w-[1000px] max-h-[90vh] overflow-auto p-5 relative scrollbar-none"
      >
        <Toaster position="top-right" />
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[1.2vw] font-semibold text-[#1A2341]">Employee List</h1>
          <button
            onClick={onClose}
            className="text-[#1A2341] hover:text-[#1A2341]/50 transition-all cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        
        <div className="mb-6  rounded-xl shadow-inner border border-slate-200/60  p-4  w-full">

          
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">

            
            {/* Search */}
            <div className="relative flex-1 min-w-[250px] max-w-[400px] ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 " />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by ID, Name, Email, or Department"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2341] text-sm"
              />
            </div>

            {/* Department Filter */}
            <div className="flex flex-col w-[200px]">
              {/* <label className="text-sm font-medium text-[#1A2341] mb-1">Department</label> */}
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange("department", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2341] text-sm"
              >
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex flex-col w-[250px] ">
              {/* <label className="text-sm font-medium text-[#1A2341] mb-1">Roles</label> */}
              <Select
                isMulti
                options={roleOptions}
                value={roleOptions.filter((option) => filters.roles.some((r) => r.value === option.value))}
                onChange={(selected) => handleFilterChange("roles", selected || [])}
                placeholder="Select roles..."
                className="text-sm "
                styles={{
                  control: (provided) => ({ ...provided, minHeight: "2.5rem", height: "2.5rem" }),
                  valueContainer: (provided) => ({ ...provided, padding: "0 0.5rem" }),
                  input: (provided) => ({ ...provided, margin: 0, padding: 0 }),
                  indicatorsContainer: (provided) => ({ ...provided, height: "2.5rem" }),
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                }}
              />
            </div>


            {/* Create Employee Button */}
            <button
              onClick={handleCreateEmployee}
              className="bg-[#1A2341] text-white px-6   rounded-md hover:bg-[#0F1D42]/90 transition cursor-pointer whitespace-nowrap "
            >
              Create Employee
            </button>
          </div>
        </div>

        {isLoading && <div className="text-center py-4">Loading employees...</div>}
        {isError && (
          <div className="text-center py-4 text-red-600">
            Error: {error?.data?.detail || "Failed to fetch employees"}
          </div>
        )}
        {!isLoading && !isError && (
          <div style={{ height: 500, width: "100%" }} className="mb-5">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={6}
              rowsPerPageOptions={[6]}
              disableRowSelectionOnClick
              hideFooter
              sortingOrder={["asc", "desc"]}
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
        {dropdownInfo && (
          <div
            ref={dropdownRef}
            className="absolute bg-white border border-gray-200 rounded-md shadow-xl z-[9999] w-32"
            style={{ top: dropdownInfo.top, left: dropdownInfo.left }}
          >
            <div
              onClick={handleUpdateClick}
              className="px-3 py-2 text-sm text-[#1A2341] hover:bg-gray-100 cursor-pointer"
            >
              Update
            </div>
            <div
              onClick={handleDeleteClick}
              className="px-3 py-2 text-sm text-[#1A2341] hover:bg-gray-100 cursor-pointer"
            >
              Delete
            </div>
          </div>
        )}
        {showEmployeePopup && (
          <EmployeePopup
            onClose={() => setShowEmployeePopup(false)}
            employee={selectedEmployee}
          />
        )}
        {showDeleteRolesPopup && (
          <DeleteRolesPopup
            onClose={() => setShowDeleteRolesPopup(false)}
            employee={selectedEmployee}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeListPopup;