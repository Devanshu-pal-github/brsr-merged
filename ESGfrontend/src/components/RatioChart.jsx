import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function GenderRatioChart() {
  const data = [
    { name: "Male", value: 50, color: "#1e40af" },
    { name: "Female", value: 50, color: "#10b981" },
  ];

  return (
    <div className="w-full max-w-[150px] mx-auto px-2 bg-white space-y-2">
      {/* Title */}
      <h3 className="text-xs font-semibold text-center text-gray-800">
        Male/Female Ratio
      </h3>

      {/* Numbers & Legends */}
      <div className="flex justify-around text-[10px] text-gray-700">
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-2 rounded-full bg-blue-700"></div>
          <span>Male: {data[0].value}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>Female: {data[1].value}</span>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}