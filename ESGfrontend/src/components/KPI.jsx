const KPI = ({ label, value, color }) => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;700&display=swap');

          .metric-card {
            width: 208px;
            height: 88px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 8px;
            margin: 4px;
            box-sizing: border-box;
          }

          .metric-card-label {
            font-family: 'Inter', sans-serif;
            font-weight: 300;
            font-size: 14px;
            color: #6b7280; /* Matches Tailwind's text-gray-500 */
            margin-bottom: 4px;
            text-align: left;
          }

          .metric-card-value {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 24px;
            text-align: left;
          }
        `}
      </style>
      <div className={`metric-card bg-white shadow-sm`}>
        <div className="metric-card-label">{label}</div>
        <div className={`metric-card-value ${color}`}>{value}</div>
      </div>
    </>
  );
};

export default KPI;