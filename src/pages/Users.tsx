import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import type { User } from '../../types';
import { Button } from '../../components/Button';
import { Shield } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      const { data } = await apiClient.get<User[]>('/user'); // API lấy danh sách user
      setUsers(data);
    } catch(err) {
      console.error("Lỗi get users", err);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'; // Tùy chỉnh theo ENUM backend (nếu có BANNED thì truyền BANNED)
      try {
         await apiClient.patch(`/user/${id}/status?status=${newStatus}`);
         loadUsers();
      } catch (err) {
         alert("Lỗi đổi trạng thái");
      }
  };

  const toggleRole = async (id: string, currentRole: string) => {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      try {
         await apiClient.patch(`/user/${id}/role?role=${newRole}`);
         loadUsers();
      } catch (err) {
         alert("Lỗi đổi quyền");
      }
  };
  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" không?`)) {
       try {
         await apiClient.delete(`/user/${id}`);
         loadUsers();
       } catch (err) {
         alert("Lỗi xóa tài khoản");
       }
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>Quản lý người dùng</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Người dùng</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Vai trò</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Trạng thái</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>#{u.id}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={u.avatarUrl} alt={u.userName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: u.role === 'ADMIN' ? 'rgba(0,102,204,0.1)' : 'rgba(108,117,125,0.1)', 
                    color: u.role === 'ADMIN' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {u.role === 'ADMIN' ? <Shield size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> : null}
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    backgroundColor: u.status === 'ACTIVE' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)', 
                    color: u.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-error)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị cấm'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" size="sm" onClick={() => setSelectedUser(u)}>
                      Xem
                    </Button>
                    <Button variant={u.role === 'ADMIN' ? 'danger' : 'primary'} size="sm" onClick={() => toggleRole(u.id, u.role)}>
                      {u.role === 'ADMIN' ? 'Gỡ Admin' : 'Cấp Admin'}
                    </Button>
                    <Button variant={u.status === 'ACTIVE' ? 'danger' : 'primary'} size="sm" onClick={() => toggleStatus(u.id, u.status)}>
                      {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                    </Button>
                    <button 
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: 'transparent', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.875rem' }}
                      onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                      title="Xóa tài khoản"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', minWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Thông tin người dùng</h2>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={selectedUser.avatarUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p style={{ margin: '0.25rem 0', color: 'var(--color-text-secondary)' }}>@{selectedUser.userName}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'rgba(0,102,204,0.1)', color: 'var(--color-primary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{selectedUser.role}</span>
                  <span style={{ padding: '0.25rem 0.5rem', backgroundColor: selectedUser.status === 'ACTIVE' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)', color: selectedUser.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-error)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{selectedUser.status}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <p><strong>ID:</strong> #{selectedUser.id}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Số điện thoại:</strong> {(selectedUser as any).phone || ''}</p>
              <p><strong>CMND/CCCD:</strong> {(selectedUser as any).identityNumber || ''}</p>
              <p><strong>Ngày sinh:</strong> {(selectedUser as any).dateOfBirth || ''}</p>
              <p><strong>Giới tính:</strong> {(selectedUser as any).sex || ''}</p>
              <p><strong>Số dư:</strong> {(selectedUser as any).balance != null ? `${Number((selectedUser as any).balance).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</p>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setSelectedUser(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
