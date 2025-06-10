import { useState } from "react";
import { useGetAllPlantEmployeesQuery, useCreateNotificationMutation } from "../../api/apiSlice";
import { Button, TextField, Typography, Box, IconButton, TextareaAutosize, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NotifyPopup = ({ onClose }) => {
  const { data: employees, isLoading, error } = useGetAllPlantEmployeesQuery();
  const [selected, setSelected] = useState([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendNotification, { isLoading: isSending }] = useCreateNotificationMutation();

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredEmployees = employees?.filter((emp) =>
      searchTerm
        ? emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employee_id.toString().includes(searchTerm)
        : true
    );
    const allSelected = filteredEmployees?.every((emp) =>
      selected.includes(emp.id || emp.employee_id)
    );
    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !filteredEmployees.some((emp) => (emp.id || emp.employee_id) === id))
      );
    } else {
      setSelected((prev) => [
        ...prev,
        ...filteredEmployees
          .map((emp) => emp.id || emp.employee_id)
          .filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleNotify = () => {
    if (selected.length > 0) setShowNotificationForm(true);
  };

  const handleSend = async () => {
    try {
      await sendNotification({
        title,
        description,
        recipients: selected.filter(Boolean),
      }).unwrap();
      setShowNotificationForm(false);
      setSelected([]);
      setTitle("");
      setDescription("");
      setSearchTerm("");
      onClose();
      alert("Notification sent successfully!");
    } catch (err) {
      alert("Failed to send notification. Please try again.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const filteredEmployees = employees?.filter((emp) =>
    searchTerm
      ? emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
      : true
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          p: 4,
          width: "100%",
          maxWidth: 600,
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: "gray.600" }}
        >
          <CloseIcon />
        </IconButton>
        {!showNotificationForm ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "gray.800" }}>
              Select Employees to Notify
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
              <TextField
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: "70%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    "& fieldset": { borderColor: "gray.300" },
                    "&:hover fieldset": { borderColor: "gray.500" },
                    "&.Mui-focused fieldset": { borderColor: "blue.600" },
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleSelectAll}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: "gray.300",
                  color: "gray.800",
                  "&:hover": { borderColor: "gray.500", bgcolor: "gray.50" },
                }}
              >
                {filteredEmployees?.every((emp) =>
                  selected.includes(emp.id || emp.employee_id)
                ) ? "Deselect All" : "Select All"}
              </Button>
            </Box>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Typography sx={{ color: "red.600" }}>Failed to load employees. Please try again.</Typography>
            ) : (
              <Box sx={{ mb: 3, border: "1px solid", borderColor: "gray.200", borderRadius: 1, overflow: "hidden" }}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees?.map((emp) => (
                      <tr
                        key={emp.id || emp.employee_id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-800">{emp.employee_id}</td>
                        <td className="py-3 px-4 text-gray-800 font-medium">{emp.name}</td>
                        <td className="py-3 px-4 text-gray-800">{emp.department}</td>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(emp.id || emp.employee_id)}
                            onChange={() => handleSelect(emp.id || emp.employee_id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                disabled={selected.length === 0}
                onClick={handleNotify}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  bgcolor: "blue.600",
                  "&:hover": { bgcolor: "blue.700" },
                  "&:disabled": { bgcolor: "gray.300", color: "gray.600" },
                }}
              >
                Notify
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "gray.800" }}>
              Send Notification
            </Typography>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "gray.300" },
                  "&:hover fieldset": { borderColor: "gray.500" },
                  "&.Mui-focused fieldset": { borderColor: "blue.600" },
                },
              }}
            />
            <TextareaAutosize
              minRows={4}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 4,
                border: "1px solid #d1d5db",
                marginBottom: 16,
                fontSize: 16,
                fontFamily: "inherit",
                resize: "vertical",
                "&:focus": { borderColor: "#2563eb", outline: "none" },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleSend}
                disabled={!title || !description || isSending}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  bgcolor: "blue.600",
                  "&:hover": { bgcolor: "blue.700" },
                  "&:disabled": { bgcolor: "white", color: "gray.600" },
                }}
              >
                {isSending ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowNotificationForm(false)}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: "gray.300",
                  color: "gray.800",
                  "&:hover": { borderColor: "gray.500", bgcolor: "gray.50" },
                }}
              >
                Back
              </Button>
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};

export default NotifyPopup;