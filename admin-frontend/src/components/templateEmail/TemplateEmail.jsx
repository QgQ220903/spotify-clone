export const TemplateEmailAssignment = ({name,jobName,jobDes,jobStart,jobEnd,role}) => {
    return (
      <div style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', color: '#333', backgroundColor: '#f4f4f4' }}>
        {/* Main Container */}
        <table width="100%" cellSpacing="0" cellPadding="0" style={{ backgroundColor: '#f4f4f4' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '20px 0' }}>
                {/* Email Container */}
                <table
                  width="600"
                  cellSpacing="0"
                  cellPadding="0"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Header */}
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: '30px',
                          textAlign: 'center',
                          backgroundColor: '#4a6fa5',
                          borderRadius: '8px 8px 0 0',
                        }}
                      >
                         <h1 style={{ margin: 0, color: '#ffffff' }}>THÔNG BÁO PHÂN CÔNG CÔNG VIỆC</h1>
                      </td>
                    </tr>
  
                    {/* Content */}
                    <tr>
                      <td style={{ padding: '30px' }}>
                        <h2 style={{ marginTop: 0, color: '#4a6fa5' }}>Gửi đến Anh/Chị [{name}],</h2>
                        <p style={{ lineHeight: 1.6 }}>
                          Căn cứ vào nhu cầu công việc hiện tại, Ban quản lý đã phân công công việc sau cho Anh/Chị:
                        </p>
  
                        {/* Work Info Table */}
                        <table
                          width="100%"
                          cellSpacing="0"
                          cellPadding="10"
                          style={{ margin: '20px 0', border: '1px solid #ddd', borderCollapse: 'collapse' }}
                        >
                          <tbody>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                              <td style={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Tên công việc</td>
                              <td style={{ border: '1px solid #ddd' }}>{jobName}</td>
                            </tr>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                              <td style={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Vai trò</td>
                              <td style={{ border: '1px solid #ddd' }}>{role}</td>
                            </tr>
                            <tr>
                              <td style={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Mô tả</td>
                              <td style={{ border: '1px solid #ddd' }}>{jobDes}</td>
                            </tr>
                         
                            <tr>
                              <td style={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Ngày bắt đầu</td>
                              <td style={{ border: '1px solid #ddd' }}>{jobStart}</td>
                            </tr>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                              <td style={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Hạn hoàn thành</td>
                              <td style={{ border: '1px solid #ddd' }}>{jobEnd}</td>
                            </tr>
                            <tr>
                              <td style={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Độ ưu tiên</td>
                              <td style={{ border: '1px solid #ddd', color: '#e74c3c', fontWeight: 'bold' }}>
                                {priority}
                              </td>
                            </tr>
                          </tbody>
                        </table>
  
                        <p style={{ lineHeight: 1.6 }}>
                          Anh/Chị vui lòng kiểm tra và xác nhận tiếp nhận công việc theo đường dẫn bên dưới:
                        </p>
  
                     
  
                        <p style={{ lineHeight: 1.6 }}>
                          Mọi thắc mắc về công việc được phân công, vui lòng liên hệ trực tiếp với người giao việc hoặc
                          qua email này.
                        </p>
                        
                      </td>
                    </tr>
  
                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: '20px',
                          textAlign: 'center',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '0 0 8px 8px',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        <p style={{ margin: 0 }}>© 2023 TQT. Mọi quyền được bảo lưu.</p>
                        <p style={{ margin: '10px 0 0' }}>
                          <a
                            href="#"
                            style={{ color: '#4a6fa5', textDecoration: 'none', margin: '0 10px' }}
                          >
                            Trang chủ
                          </a>
                          <a
                            href="#"
                            style={{ color: '#4a6fa5', textDecoration: 'none', margin: '0 10px' }}
                          >
                            Quy định
                          </a>
                          <a
                            href="#"
                            style={{ color: '#4a6fa5', textDecoration: 'none', margin: '0 10px' }}
                          >
                            Liên hệ
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  

  