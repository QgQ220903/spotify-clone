import React, { useEffect, useState } from 'react';
import { DatePicker, Space, Table } from 'antd';
import { dashboardGetAPI } from '@/Services/DashboardService';

import { Progress, Tag } from "antd";

import { splitEmployeeNames, getRandomColor } from "@/utils/cn"

import { Link } from 'react-router-dom';

import EmptyTemplate from "@/components/emptyTemplate/EmptyTemplate";


import PageHeader from "@/components/PageHeader";

const { RangePicker } = DatePicker;

// Đường dẫn
const itemsBreadcrumb = [
  {
      title: <Link to="/">Trang chủ</Link>,
  },

  {
      title: "Thống kê",
  },
];



const DashboardPage = () => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [tableData, setTableData] = useState(null);

  const handleRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setStartTime(dates[0].format('YYYY-MM-DD'));
      setEndTime(dates[1].format('YYYY-MM-DD'));

      // Log kiểm tra
      console.log("Start Date:", dates[0].format('YYYY-MM-DD'));
      console.log("End Date:", dates[1].format('YYYY-MM-DD'));
    } else {
      setStartTime(null);
      setEndTime(null);
    }
  };


  useEffect(() => {
    if(setStartTime && endTime) {
      var obj = {
        start_date: startTime,
        end_date: endTime
      }
      dashboardGetAPI(obj).then((res) => {
        if (res.status == 200) {
          console.log(res.data)
          var a = res.data.map((item) => ({
            ...item,
            key: item.id
          }));
          setTableData(a)
        }
      })
    }
  
  }, [startTime, endTime])

  // useEffect(()=>{

  //   const elements = document.getElementsByClassName('ant-table-row');
  //   elements.array.forEach(item => {
  //     var x = tableData.filter((i) => {
  //       return i.id ==item.dataset.row_key;
  //     })
  //     if(x[0].level == 0 )
  //     {
  //       item.style.backgroundColor = 'blue'
  //     }
  //   });

  // })




  const columns = [
    { title: "ID", dataIndex: "key", key: "key" },
    { title: "Công việc", dataIndex: "task_display_name", key: "task_display_name" },
    {
      title: "Dự án",
      dataIndex: "project_part_name",
      key: "project_part_name",
    },
    {
      title: "Đường đi",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "% Hoàn thành",
      dataIndex: "completion_percentage",
      key: "completion_percentage",
      render: (value, record) => {
        return <Progress type="circle" percent={record.completion_percentage} size={45} format={(percent) => {
          if (percent === 100) {
            return 'Done';
          }
          return percent + "%";

        }} />
      }
    },  {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Tên nhân viên",
      dataIndex: "employee_names",
      key: "employee_names",
      render: (value, record) => {
        const names = splitEmployeeNames(value);
        return (
          <Space wrap>
            {names.map((name, index) => (
              <Tag key={index} color={'blue'}>
                {name}
              </Tag>
            ))}
          </Space>
        );
      }
    },
  
  ];
  return (
    <>
      <PageHeader title={"Thống kê"} itemsBreadcrumb={itemsBreadcrumb}>

      </PageHeader>
      
      <div className='mt-5'>
      <RangePicker onChange={handleRangeChange} format="YYYY-MM-DD" />

        {/* <div style={{ marginTop: 16 }}>
          <p>Start Date: {startTime || 'Chưa chọn'}</p>
          <p>End Date: {endTime || 'Chưa chọn'}</p>
        </div> */}
  
        <div className="mt-5">
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            rowClassName={(record) => {
              var color='';
              if(record.level == 0)
                color='bg-orange-500'
              else  if(record.level == 1)
                color = 'bg-sky-300'
              else
              color = 'bg-yellow-200'
              return color;
            }}
            locale={{
              triggerDesc: "Sắp xếp giảm dần",
              triggerAsc: "Sắp xếp tăng dần",
              cancelSort: "Hủy sắp xếp",
              emptyText: <EmptyTemplate title={"Bạn không dữ liệu !"} />,
          }}
          />
        </div>
      </div>

    </>
  );
};

export default DashboardPage;
