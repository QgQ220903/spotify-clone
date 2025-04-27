import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table } from 'antd';
const data = [
  { name: 'Tháng 1', congviechoanthanh: 43 , cvchucht: 1 },
  { name: 'Tháng 2', congviechoanthanh: 54 , cvchucht: 1 },
  { name: 'Tháng 3', congviechoanthanh: 43 , cvchucht: 3 },
  { name: 'Tháng 4', congviechoanthanh: 45 , cvchucht: 1 },
  { name: 'Tháng 5', congviechoanthanh: 56 , cvchucht: 2},
  { name: 'Tháng 6', congviechoanthanh: 76 , cvchucht: 1},
  { name: 'Tháng 7', congviechoanthanh: 67 , cvchucht: 2},
  { name: 'Tháng 8', congviechoanthanh: 56 , cvchucht: 1},
  { name: 'Tháng 9', congviechoanthanh: 45 , cvchucht: 3},
  { name: 'Tháng 10', congviechoanthanh: 46 , cvchucht: 1},
  { name: 'Tháng 11', congviechoanthanh: 34 , cvchucht: 2},
  { name: 'Tháng 12', congviechoanthanh: 53 , cvchucht: 3},
];

export const LineChartDb = () => (
  <LineChart width={500} height={300} data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <CartesianGrid strokeDasharray="3 3" />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="congviechoanthanh" stroke="#8884d8"  name="Cong viec hoàn thành"/>
    <Line type="monotone" dataKey="cvchucht" stroke="red"  name="Cong viec chua hoàn thành"/>
  </LineChart>
);


const columns = [
    {
      title: 'Tháng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Công việc hoàn thành',
      dataIndex: 'congviechoanthanh',
      key: 'congviechoanthanh',
    },
    {
      title: 'Công việc chưa hoàn thành',
      dataIndex: 'cvchucht',
      key: 'cvchucht',
    },
  ];
  
 export const TableChart = () => (
    <Table columns={columns} dataSource={data} 
    pagination={
      {
        pageSize: 4,
      }
    }
    />
  );


  