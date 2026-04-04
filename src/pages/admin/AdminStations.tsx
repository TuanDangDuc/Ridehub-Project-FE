import React, { useState, useEffect } from 'react';
import type { Station } from '../../types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Edit, Trash2, Power } from 'lucide-react';
import { api } from '../../services/api';

const AdminStations: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Station>>({});

  useEffect(() => {
    // Initial fetch
    api.getStations().then(setStations);
  }, []);

  const openModal = () => {
    setFormData({ 
      id: `00${stations.length + 1}`.slice(-3), // simple padded ID
      name: '', 
      address: '', 
      lat: 10.762622, 
      lng: 106.660172, 
      city: 'TP. Hồ Chí Minh',
      vehicleCapacity: 20,
      currentVehicleCount: 0
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStation: Station = {
      ...(formData as Station),
      status: 'ACTIVE'
    };
    
    const updatedStations = [newStation, ...stations];
    setStations(updatedStations);
    localStorage.setItem('stations_v1', JSON.stringify(updatedStations));
    closeModal();
  };

  const toggleStatus = (id: string, currentStatus?: string) => {
    const isInactive = currentStatus === 'INACTIVE';
    const action = isInactive ? 'khôi phục hoạt động' : 'dừng hoạt động';
    if (confirm(`Bạn có chắc chắn muốn ${action} trạm này không?`)) {
      const updatedStations = stations.map(s => {
        if (s.id === id) {
          return { ...s, status: isInactive ? 'ACTIVE' : 'INACTIVE' } as Station;
        }
        return s;
      });
      setStations(updatedStations);
      localStorage.setItem('stations_v1', JSON.stringify(updatedStations));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>Quản lý trạm xe</h1>
        <Button onClick={openModal}>+ Thêm trạm xe mới</Button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Mã trạm</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tên / Địa chỉ</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sức chứa</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Trạng thái</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                  Chưa có trạm xe nào ngoài hệ thống.
                </td>
              </tr>
            ) : (
              stations.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>#{s.id}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{s.address}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {s.currentVehicleCount} / {s.vehicleCapacity}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: s.status === 'INACTIVE' ? 'rgba(220,53,69,0.1)' : 'rgba(40,167,69,0.1)', 
                      color: s.status === 'INACTIVE' ? 'var(--color-error)' : 'var(--color-success)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {s.status === 'INACTIVE' ? 'Bảo trì' : 'Hoạt động'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <Button variant={s.status === 'INACTIVE' ? 'primary' : 'danger'} size="sm" onClick={() => toggleStatus(s.id, s.status)}>
                      {s.status === 'INACTIVE' ? 'Khôi phục' : 'Dừng'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>Thêm trạm xe mới</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Mã trạm (ID)" required value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} />
              <Input label="Tên trạm" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="Địa chỉ" required value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
              <Input label="Khu vực (Thành phố)" required value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input label="Vĩ độ (Lat)" type="number" required value={formData.lat as unknown as string || ''} onChange={e => setFormData({...formData, lat: Number(e.target.value)})} />
                <Input label="Kinh độ (Lng)" type="number" required value={formData.lng as unknown as string || ''} onChange={e => setFormData({...formData, lng: Number(e.target.value)})} />
              </div>
              <Input label="Sức chứa tối đa (xe)" type="number" required value={formData.vehicleCapacity as unknown as string || ''} onChange={e => setFormData({...formData, vehicleCapacity: Number(e.target.value)})} />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="outline" fullWidth onClick={closeModal}>Hủy</Button>
                <Button type="submit" fullWidth>Thêm</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStations;
