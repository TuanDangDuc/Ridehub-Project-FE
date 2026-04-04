import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Vehicle } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import { Spinner } from '../components/Spinner';
import type { Station } from '../types';

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Tất cả loại xe');
  const [selectedStation, setSelectedStation] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, stationsData] = await Promise.all([
          api.getVehicles(),
          api.getStations()
        ]);
        setVehicles(vehiclesData);
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    window.addEventListener('vehicle-updated', fetchData);
    return () => window.removeEventListener('vehicle-updated', fetchData);
  }, []);

  return (
    <div className="container mt-8 mb-8" style={{ minHeight: '60vh' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Danh sách xe</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <select 
             value={selectedStation}
             onChange={(e) => setSelectedStation(e.target.value)}
             style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', color: 'var(--color-text-primary)' }}
           >
             <option value="">Chọn trạm xe</option>
             {stations.filter(st => st.status !== 'INACTIVE').map(st => (
               <option key={st.id} value={st.id}>{st.id} - {st.name}</option>
             ))}
           </select>
           <select 
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', color: 'var(--color-text-primary)' }}
           >
             <option>Tất cả loại xe</option>
             <option>Xe đạp</option>
             <option>Xe đạp điện</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-8"><Spinner size="lg" /></div>
      ) : (
        <React.Fragment>
          {(() => {
            if (!selectedStation) {
              return (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
                  <h3>Vui lòng chọn trạm xe để xem danh sách phương tiện.</h3>
                </div>
              );
            }
            
            const filteredVehicles = vehicles.filter(v => {
              if (v.stationId !== selectedStation) return false;
              if (filterType === 'Tất cả loại xe') return true;
              return v.type === filterType;
            });
            
            return filteredVehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
              <h3>Không tìm thấy phương tiện nào tại trạm này.</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          );
          })()}
        </React.Fragment>
      )}
    </div>
  );
};

export default VehicleList;
