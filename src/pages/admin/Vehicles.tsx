import React, { useState } from 'react';
import { mockVehicles } from '../../services/mockData';
import type { Vehicle, Station } from '../../types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Edit, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('vehicles_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Auto upgrade old items
      return parsed.map((v: any) => ({
        ...v,
        priceSingle: v.priceSingle || (v.type === 'Xe đạp điện' ? 20000 : 10000),
        priceDay: v.priceDay || (v.type === 'Xe đạp điện' ? 100000 : 50000),
        priceWeek: v.priceWeek || (v.type === 'Xe đạp điện' ? 300000 : 150000)
      }));
    }
    localStorage.setItem('vehicles_v4', JSON.stringify(mockVehicles));
    return mockVehicles;
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [filterStation, setFilterStation] = useState('');

  React.useEffect(() => {
    api.getStations().then(setStations);
  }, []);

  const [filterType, setFilterType] = useState('Tất cả loại xe');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [priceInput, setPriceInput] = useState<string>('');

  const openModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      const singlePrice = vehicle.priceSingle || (vehicle.type === 'Xe đạp điện' ? 20000 : 10000);
      setPriceInput(Math.round(singlePrice / 60).toString());
      setFormData({
        ...vehicle,
        priceSingle: singlePrice,
        priceDay: vehicle.priceDay || (vehicle.type === 'Xe đạp điện' ? 100000 : 50000),
        priceWeek: vehicle.priceWeek || (vehicle.type === 'Xe đạp điện' ? 300000 : 150000)
      });
    } else {
      setEditingId(null);
      setPriceInput(Math.round(10000 / 60).toString());
      setFormData({ name: '', code: '', type: 'Xe đạp', status: 'AVAILABLE', priceSingle: 10000, priceDay: 50000, priceWeek: 150000, brand: 'VNGo', images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData, priceSingle: Number(priceInput) * 60 };
    let updatedVehicles;
    if (editingId) {
      updatedVehicles = vehicles.map(v => v.id === editingId ? { ...v, ...finalData } as Vehicle : v);
    } else {
      const newVehicle: Vehicle = {
        ...(finalData as any),
        id: 'v' + Date.now(),
        rating: 5,
        ownerName: 'VNGo Admin',
        features: { 'Helmet': true }
      };
      updatedVehicles = [newVehicle, ...vehicles];
    }
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles_v4', JSON.stringify(updatedVehicles));
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn ẩn/ngừng hoạt động phương tiện này?')) {
      const updatedVehicles = vehicles.filter(v => v.id !== id);
      setVehicles(updatedVehicles);
      localStorage.setItem('vehicles_v4', JSON.stringify(updatedVehicles));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>Quản lý phương tiện</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'white', color: 'var(--color-text-primary)', outline: 'none' }}
          >
            <option value="">Chọn trạm xe</option>
            {stations.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'white', color: 'var(--color-text-primary)', outline: 'none' }}
          >
            <option>Tất cả loại xe</option>
            <option>Xe đạp</option>
            <option>Xe đạp điện</option>
          </select>
          <Button onClick={() => openModal()}>+ Thêm phương tiện mới</Button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Mã/Tên xe</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Loại</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Giá thuê</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Trạng thái</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredVehicles = vehicles.filter(v => {
                if (filterType !== 'Tất cả loại xe' && v.type !== filterType) return false;
                if (filterStation && v.stationId !== filterStation) return false;
                return true;
              });

              if (filteredVehicles.length === 0) {
                return (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                      Không tìm thấy phương tiện nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                );
              }

              return filteredVehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={v.images[0]} alt={v.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{v.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{v.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>
                    <div>{v.type}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{v.brand}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--color-primary)' }}>
                    {formatPrice(Math.round((v.priceSingle || (v.type === 'Xe đạp điện' ? 20000 : 10000)) / 60))}/phút
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: v.status === 'AVAILABLE' ? 'rgba(40,167,69,0.1)' : v.status === 'RENTED' ? 'rgba(255,193,7,0.1)' : 'rgba(220,53,69,0.1)', 
                      color: v.status === 'AVAILABLE' ? 'var(--color-success)' : v.status === 'RENTED' ? '#856404' : 'var(--color-error)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {v.status === 'AVAILABLE' ? 'Sẵn sàng' : v.status === 'RENTED' ? 'Đang cho thuê' : 'Bảo trì'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal(v)} style={{ padding: '0.5rem', backgroundColor: 'rgba(0,102,204,0.1)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }} title="Sửa">
                        <Edit size={16} />
                      </button>
                      <button style={{ padding: '0.5rem', backgroundColor: 'rgba(220,53,69,0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }} title="Xóa" onClick={() => handleDelete(v.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Sửa phương tiện' : 'Thêm phương tiện mới'}</h2>
              <button 
                onClick={closeModal} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '0.25rem', display: 'flex' }}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Tên xe" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="Mã xe (Biển số/Serial)" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Loại xe</label>
                <select style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.375rem', border: '1px solid #ced4da', backgroundColor: 'white' }} value={formData.type || 'Xe đạp'} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option value="Xe đạp">Xe đạp</option>
                  <option value="Xe đạp điện">Xe đạp điện</option>
                </select>
              </div>
              <div>
                <Input 
                  label="Giá / Phút (VNĐ)" 
                  type="number" 
                  required 
                  value={priceInput} 
                  onChange={e => setPriceInput(e.target.value)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Trạng thái</label>
                <select style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.375rem', border: '1px solid #ced4da', backgroundColor: 'white' }} value={formData.status || 'AVAILABLE'} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="AVAILABLE">Sẵn sàng</option>
                  <option value="RENTED">Đang cho thuê</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Trạm xe</label>
                <select style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.375rem', border: '1px solid #ced4da', backgroundColor: 'white' }} value={formData.stationId || ''} onChange={e => setFormData({...formData, stationId: e.target.value})}>
                  <option value="">Chưa có trạm</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
                </select>
              </div>
              <Input label="Thương hiệu" required value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} />
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Hình ảnh</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, images: [reader.result as string]});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '0.375rem', backgroundColor: 'white' }} 
                />
                {formData.images?.[0] && (
                  <img src={formData.images[0]} alt="Preview" style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '4px', objectFit: 'cover' }} />
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="button" variant="outline" fullWidth onClick={closeModal}>Hủy</Button>
                <Button type="submit" fullWidth>{editingId ? 'Cập nhật' : 'Thêm'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
