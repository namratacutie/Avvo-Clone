import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin } from 'react-icons/fi';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Center of Nepal roughly
const NEPAL_CENTER = [28.3949, 84.1240];

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const LawyerMap = ({ lawyers, center }) => {
    // Helper to get coordinates (mocking if missing)
    const getCoords = (lawyer) => {
        if (lawyer.lat && lawyer.lng) return [lawyer.lat, lawyer.lng];
        
        // Mock coordinates for major Nepalese cities if missing
        const cityCoords = {
            'Kathmandu': [27.7172, 85.3240],
            'Lalitpur': [27.6644, 85.3188],
            'Bhaktapur': [27.6710, 85.4298],
            'Pokhara': [28.2096, 83.9856],
            'Biratnagar': [26.4525, 87.2718],
            'Bharatpur': [27.6833, 84.4333]
        };
        
        const base = cityCoords[lawyer.city] || cityCoords['Kathmandu'];
        // Add tiny random offset so markers don't overlap perfectly
        return [
            base[0] + (Math.random() - 0.5) * 0.05,
            base[1] + (Math.random() - 0.5) * 0.05
        ];
    };

    return (
        <div className="lawyer-map-container glass-card" style={{ height: '600px', width: '100%', overflow: 'hidden', borderRadius: '20px', position: 'relative', zIndex: 1 }}>
            <MapContainer 
                center={center || NEPAL_CENTER} 
                zoom={center ? 12 : 7} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizer />
                {lawyers.map(lawyer => {
                    const position = getCoords(lawyer);
                    return (
                        <Marker key={lawyer.id} position={position}>
                            <Popup>
                                <div className="map-popup">
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--color-primary)' }}>{lawyer.name}</h4>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>{lawyer.specialty}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                        <FiStar style={{ color: '#fab005' }} /> {lawyer.rating?.toFixed(1)} ({lawyer.reviewCount} reviews)
                                    </div>
                                    <Link to={`/lawyer/${lawyer.id}`} className="btn btn-primary btn-sm" style={{ display: 'block', textAlign: 'center' }}>
                                        View Profile
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default LawyerMap;
