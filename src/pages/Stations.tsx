import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from './Stations.module.css';

import { api } from '../services/api';
import type { Station } from '../types';

const bikeIcon = L.divIcon({
  html: `<div style="background-color: #f39c12; border-radius: 50%; width: 32px; height: 32px; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"></path></svg>
           <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #f39c12;"></div>
         </div>`,
  className: 'custom-bike-icon',
  iconSize: [32, 38],
  iconAnchor: [16, 38],
  popupAnchor: [0, -38],
});

// Helper component to center map
const MapController: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const Stations: React.FC = () => {
  const [city, setCity] = useState('Hồ Chí Minh');
  const [keyword, setKeyword] = useState('');
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    api.getStations().then(setStations);
  }, []);

  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const filteredStations = stations.filter(station => {
    if (station.status === 'INACTIVE') return false;
    const term = removeAccents(keyword.toLowerCase());
    const nameMatch = removeAccents(station.name.toLowerCase()).includes(term);
    const addressMatch = removeAccents(station.address.toLowerCase()).includes(term);
    const idMatch = station.id.includes(term);
    
    return nameMatch || addressMatch || idMatch;
  });

  const handleStationClick = (station: any, index: number) => {
    const indexInt = parseInt(station.id) || index;
    const lat = 10.7715 + ((indexInt * 7) % 50) / 1000 * (indexInt % 2 === 0 ? 1 : -1);
    const lng = 106.6908 + ((indexInt * 13) % 40) / 1000 * (indexInt % 3 === 0 ? 1 : -1);
    
    setActiveStationId(station.id);
    setMapCenter([lat, lng]);

    // Open popup
    setTimeout(() => {
      const marker = markerRefs.current[station.id];
      if (marker) {
        marker.openPopup();
      }
    }, 500); // small delay to let flyTo start
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          DANH SÁCH TRẠM
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.formGroup}>
            <label>Thành phố</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={styles.select}>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Từ khóa</label>
            <input 
              type="text" 
              placeholder="Tên quận, đường, trạm xe..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={styles.input}
            />
          </div>
          
          <button className={styles.searchBtn}>
            Tìm kiếm
          </button>
          
          <div className={styles.resultsCount}>
            Tìm thấy <span>{filteredStations.length}</span> trạm xe
          </div>
        </div>

        <div className={styles.citySection}>
          <div className={styles.cityHeader}>
            <span>Hồ Chí Minh</span>
            <ChevronUp size={20} color="#0056b3" />
          </div>
          
          <div className={styles.stationList}>
            {filteredStations.map((station, index) => (
              <div 
                key={station.id} 
                className={styles.stationItem} 
                style={{ backgroundColor: activeStationId === station.id ? '#f1f8ff' : undefined }}
                onClick={() => handleStationClick(station, index)}
              >
                <div className={styles.stationInfo}>
                  <h4 className={styles.stationName} style={{ marginBottom: '0.35rem', fontSize: '0.95rem', fontWeight: 600 }}>{station.id} - {station.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{station.address}</p>
                </div>
                <div className={styles.stationIcon}>
                  <MapPin size={24} color="#dc3545" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className={styles.mapArea}>
        <MapContainer center={[10.7715, 106.6908]} zoom={14} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='Map data &copy; <a href="https://www.google.com/maps">Google</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          <MapController center={mapCenter} />
          {filteredStations.map((station, index) => {
            const indexInt = parseInt(station.id) || index;
            const lat = 10.7715 + ((indexInt * 7) % 50) / 1000 * (indexInt % 2 === 0 ? 1 : -1);
            const lng = 106.6908 + ((indexInt * 13) % 40) / 1000 * (indexInt % 3 === 0 ? 1 : -1);
            return (
              <Marker 
                key={station.id} 
                position={[lat, lng]} 
                icon={bikeIcon}
                ref={(r) => { if (r) markerRefs.current[station.id] = r; }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#d32f2f' }}>
                      {station.id} - {station.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.4 }}>{station.address}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default Stations;
