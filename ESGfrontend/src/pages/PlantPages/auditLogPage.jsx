import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import { useGetAuditLogQuery } from "../../api/apiSlice";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import Layout from "../../components/Layout";

const AuditLogPage = () => {
    const { data: auditLog, isLoading, isError, error } = useGetAuditLogQuery();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ action: "", user_role: [] });

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const actionOptions = useMemo(() => {
        const actions = [...new Set(auditLog?.actions?.map((action) => action.action).filter(Boolean))];
        return [{ value: "", label: "All Actions" }, ...actions.map((act) => ({ value: act, label: act }))];
    }, [auditLog]);

    const roleOptions = useMemo(() => {
        const roles = [...new Set(auditLog?.actions?.map((action) => action.user_role).filter(Boolean))];
        return roles.map((role) => ({ value: role, label: role.charAt(0).toUpperCase() + role.slice(1) }));
    }, [auditLog]);

    const filteredRows = useMemo(() => {
        return (auditLog?.actions || []).map((action, index) => {
            const userRole = typeof action.user_role === "string" ? action.user_role : "";
            console.log(`Action ${index} user_role:`, action.user_role); // Debug log
            return {
                id: index,
                action: action.action,
                targetId: action.target_id,
                performedBy: action.user_id,
                userRole,
                performedAt: action.performed_at,
                details: action.details ? JSON.stringify(action.details) : "None",
            };
        }).filter((row) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                row.action.toLowerCase().includes(searchLower) ||
                row.targetId.toLowerCase().includes(searchLower) ||
                row.performedBy.toLowerCase().includes(searchLower);
            const matchesAction = !filters.action || row.action === filters.action;
            const matchesRoles =
                filters.user_role.length === 0 ||
                filters.user_role.some((role) => row.userRole === role.value);
            return matchesSearch && matchesAction && matchesRoles;
        });
    }, [auditLog, searchQuery, filters]);

    const columns = [
        { field: "action", headerName: "Action", flex: 1 },
        { field: "targetId", headerName: "Target ID", flex: 1 },
        { field: "performedBy", headerName: "Performed By", flex: 1 },
        {
            field: "userRole",
            headerName: "User Role",
            flex: 1.5,
            sortable: false,
            renderCell: (params) => (
                <div className="flex items-center h-full gap-2 flex-wrap">
                    {params.row.userRole ? (
                        <span
                            className="inline-flex justify-center items-center bg-gradient-to-r from-[#2c3e50] to-[#1A2341] text-white text-xs px-3 py-1 rounded-full shadow-md "
                        >
                            {params.row.userRole.charAt(0).toUpperCase() + params.row.userRole.slice(1)}
                        </span>
                    ) : (
                        <span className="text-gray-500 text-xs">No role</span>
                    )}
                </div>
            ),
        },
        {
            field: "performedAt",
            headerName: "Performed At",
            flex: 1.5,
            renderCell: (params) => new Date(params.value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        },
        { field: "details", headerName: "Details", flex: 2 },
    ];

    return (
        <Layout>
            <div className="min-h-screen flex flex-col  px-[2vw] py-[1vw]" style={{ overflow: "hidden" }}>
                <h1 className="text-[1.1vw] font-semibold text-[#1A2341]  pl-[0.2vw]">
                    Audit Logs
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-[1vw]">
                    {/* Main Content: Audit Log Table */}
                    <div className="lg:col-span-4 flex flex-col gap-[1vw]">
                        <div className="bg-white rounded-[0.4vw] p-[0.7vw] shadow-sm hover:shadow-md transition-shadow duration-200">
                            <Toaster position="top-right" />
                            <div className="rounded-xl shadow-inner border border-slate-200/60 p-[0.7vw] mb-[0.7vw]">
                                <div className="flex flex-wrap items-center justify-between gap-[0.7vw] w-full">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-[250px] max-w-[400px]">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Search by Action, Target ID, or Performed By"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2341] text-sm"
                                        />
                                    </div>

                                    {/* Action Filter */}
                                    <div className="flex flex-col w-[200px]">
                                        <select
                                            value={filters.action}
                                            onChange={(e) => handleFilterChange("action", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2341] text-sm"
                                        >
                                            {actionOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Role Filter */}
                                    <div className="flex flex-col w-[250px]">
                                        <Select
                                            isMulti
                                            options={roleOptions}
                                            value={roleOptions.filter((option) =>
                                                filters.user_role.some((r) => r.value === option.value)
                                            )}
                                            onChange={(selected) => handleFilterChange("user_role", selected || [])}
                                            placeholder="Select roles..."
                                            className="text-sm"
                                            styles={{
                                                control: (provided) => ({ ...provided, minHeight: "2.5rem", height: "2.5rem" }),
                                                valueContainer: (provided) => ({ ...provided, padding: "0 0.5rem" }),
                                                input: (provided) => ({ ...provided, margin: 0, padding: 0 }),
                                                indicatorsContainer: (provided) => ({ ...provided, height: "2.5rem" }),
                                                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isLoading && <div className="text-center py-4">Loading audit logs...</div>}
                            {isError && (
                                <div className="text-center py-4 text-red-600">
                                    Error: {error?.data?.detail || "Failed to fetch audit logs"}
                                </div>
                            )}
                            {!isLoading && !isError && (
                                <div style={{ height: "65vh", width: "100%" }} className="mb-[0.7vw]">
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
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AuditLogPage;