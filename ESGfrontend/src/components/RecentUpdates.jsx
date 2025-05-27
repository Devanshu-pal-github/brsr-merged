const RecentUpdateItem = ({ description, timestamp }) => {
  return (
    <div className="py-2 border-b border-gray-200 last:border-b-0">
      <div className="text-sm font-medium text-gray-900">{description}</div>
      <div className="text-xs text-gray-500">{timestamp}</div>
    </div>
  );
};

export default RecentUpdateItem;