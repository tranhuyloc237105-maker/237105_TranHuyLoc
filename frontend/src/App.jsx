import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/employees';

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '',
    department: 'Kế toán',
    position: 'Nhân viên',
    email: '',
    phone: '',
    hireDate: '',
    status: 'Đang làm việc'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setEmployees(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi tải danh sách nhân viên: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      fullName: '',
      gender: 'Nam',
      dateOfBirth: '',
      department: 'Kế toán',
      position: 'Nhân viên',
      email: '',
      phone: '',
      hireDate: '',
      status: 'Đang làm việc'
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.fullName || !formData.email) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Mã NV, Họ tên và Email!' });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      } else {
        await axios.post(API_URL, formData);
        setMessage({ type: 'success', text: 'Thêm mới nhân viên thành công!' });
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      setMessage({ type: 'error', text: 'Thao tác thất bại: ' + (err.response?.data?.message || err.message) });
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData(emp);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}" không?`)) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setMessage({ type: 'success', text: 'Xóa nhân viên thành công!' });
        fetchEmployees();
      } catch (err) {
        setMessage({ type: 'error', text: 'Xóa thất bại: ' + err.message });
      }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>QUẢN LÝ NHÂN SỰ - 237105 TRẦN HUY LỘC</h2>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {/* Biểu mẫu Thêm / Sửa */}
      <div className="card">
        <h3>{editingId ? 'Cập Nhật Thông Tin Nhân Viên' : 'Thêm Hồ Sơ Nhân Viên Mới'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input name="employeeId" placeholder="Mã NV (*)" value={formData.employeeId} onChange={handleChange} disabled={!!editingId} required />
          <input name="fullName" placeholder="Họ và tên (*)" value={formData.fullName} onChange={handleChange} required />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
          <input name="department" placeholder="Phòng ban" value={formData.department} onChange={handleChange} />
          <input name="position" placeholder="Chức vụ" value={formData.position} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email (*)" value={formData.email} onChange={handleChange} required />
          <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
          <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc</option>
          </select>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Lưu cập nhật' : 'Thêm Nhân Viên'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button>}
          </div>
        </form>
      </div>

      {/* Tìm kiếm */}
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Tìm kiếm theo Mã NV hoặc Họ tên..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* Danh sách */}
      <div className="card">
        <h3>Danh Sách Nhân Viên</h3>
        {loading ? <p>Đang tải dữ liệu...</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                <tr key={emp._id}>
                  <td><strong>{emp.employeeId}</strong></td>
                  <td>{emp.fullName}</td>
                  <td>{emp.gender}</td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td><span className={`badge ${emp.status === 'Đang làm việc' ? 'active' : 'inactive'}`}>{emp.status}</span></td>
                  <td>
                    <button className="btn-sm btn-edit" onClick={() => handleEdit(emp)}>Sửa</button>
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(emp._id, emp.fullName)}>Xóa</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>Không tìm thấy nhân viên phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;