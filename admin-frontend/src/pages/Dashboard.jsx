import StatsCard from '../components/Admin/StatsCard';
import { FaUsers, FaMusic, FaCompactDisc, FaUserAlt, FaPlayCircle, FaPlusSquare } from 'react-icons/fa';

const Dashboard = () => {
  const stats = [
    { title: 'Total Users', value: '12,345', icon: <FaUsers className="text-white text-2xl" />, color: 'bg-green-500' },
    { title: 'Total Songs', value: '56,789', icon: <FaMusic className="text-white text-2xl" />, color: 'bg-blue-500' },
    { title: 'Total Albums', value: '8,901', icon: <FaCompactDisc className="text-white text-2xl" />, color: 'bg-purple-500' },
    { title: 'Total Artists', value: '2,345', icon: <FaUserAlt className="text-white text-2xl" />, color: 'bg-yellow-500' },
    { title: 'New Songs Today', value: '125', icon: <FaPlusSquare className="text-white text-2xl" />, color: 'bg-teal-500' },
    { title: 'Songs Played Today', value: '18,765', icon: <FaPlayCircle className="text-white text-2xl" />, color: 'bg-orange-500' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="bg-green-100 text-green-500 p-3 rounded-full mr-4">
              <FaUserAlt className="text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">New user registered</p>
              <p className="text-sm text-gray-500">2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="bg-blue-100 text-blue-500 p-3 rounded-full mr-4">
              <FaPlusSquare className="text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">New song added</p>
              <p className="text-sm text-gray-500">15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="bg-purple-100 text-purple-500 p-3 rounded-full mr-4">
              <FaCompactDisc className="text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">New album created</p>
              <p className="text-sm text-gray-500">30 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="bg-yellow-100 text-yellow-500 p-3 rounded-full mr-4">
              <FaPlayCircle className="text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">User started playing a song</p>
              <p className="text-sm text-gray-500">45 minutes ago</p>
            </div>
          </div>

          {/* Add more activity blocks here if needed */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;