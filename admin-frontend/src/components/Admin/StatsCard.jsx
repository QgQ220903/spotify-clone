const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="flex items-center bg-[#1e1e1e] p-5 rounded-2xl shadow-md hover:shadow-lg transition">
      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${color} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
