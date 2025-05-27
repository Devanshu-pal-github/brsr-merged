const KPI = ({ label, value, color }) => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;700&display=swap');

          .metric-card {
            width: 208px;
            height: 88px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 16px;
            box-sizing: border-box;
          }

          .metric-card-label {
            font-family: 'Inter', sans-serif;
            font-weight: 300;
            font-size: 14px;
            color: #6b7280; /* Matches Tailwind's text-gray-500 */
            margin-bottom: 8px;
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
      <div className={`metric-card bg-white shadow-sm border border-gray-100`}>
        <div className="metric-card-label">{label}</div>
        <div className={`metric-card-value ${color}`}>{value}</div>
      </div>
    </>
  );
};

export default KPI;