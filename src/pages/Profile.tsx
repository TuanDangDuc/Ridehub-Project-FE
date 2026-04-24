import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const Profile: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [avatarSrc, setAvatarSrc] = useState('https://i.pravatar.cc/150?u=u1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  const saved = localStorage.getItem('user');
  if (saved) {
    const u = JSON.parse(saved);

    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      phone: u.phone || ''
    });

    if (u.avatarUrl) {
      setAvatarSrc(u.avatarUrl);
    }
  }
}, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

const updatedUser = {
  ...currentUser,
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  avatarUrl: avatarSrc,
};

localStorage.setItem('user', JSON.stringify(updatedUser));

const users = JSON.parse(localStorage.getItem('users') || '[]');

const updatedUsers = users.map((u: any) =>
  u.id === currentUser.id ? updatedUser : u
);

localStorage.setItem('users', JSON.stringify(updatedUsers));
      setSuccess('Cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-8 mb-8">
      <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>Hồ sơ của tôi</h1>
      <div style={{ maxWidth: '600px', backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        {success && <div style={{ backgroundColor: 'rgba(40,167,69,0.1)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{success}</div>}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <img src={avatarSrc} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #dee2e6' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{formData.firstName} {formData.lastName}</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Thành viên từ: Tháng 3, 2026</p>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
            <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Đổi ảnh đại diện</Button>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Họ" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} fullWidth />
            <Input label="Tên" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} fullWidth />
          </div>
          <Input label="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} fullWidth />
          <Input label="Số điện thoại" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} fullWidth />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" isLoading={isSaving}>Lưu thay đổi</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
