const ActionButtons = () => {
    const buttons = [
        "Generate Report",
        "View Analytics",
        "Generate Report",
        "Generate Report",
    ];

    return (
        <div className="flex flex-wrap gap-3 mb-8">
            {buttons.map((label, index) => (
                <button
                    key={index}
                    className="bg-[#14B8A6] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0f9d8a]"
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default ActionButtons;