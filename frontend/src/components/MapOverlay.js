import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon paths for Leaflet when using bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

// Use a simple div icon for vehicles (no external image required)
const vehicleIcon = L.divIcon({
    className: 'vehicle-icon',
    html: '<div class="vehicle-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

export default function MapOverlay({ socket, center = [19.0760, 72.8777], zoom = 12 }) {
    const [vehicles, setVehicles] = useState({});

    useEffect(() => {
        if (!socket) return;

        socket.on('position_update', (data) => {
            // data: { segmentId, currentPosition, ... }
            // This example expects vehicles to be emitted with lat/lng
            // For now we silently handle GTFS-RT vehicle updates separately
            // Keep a map of vehicles
        });

        socket.on('gtfs_vehicle_position', ({ vehicle }) => {
            const id = vehicle.vehicle && vehicle.vehicle.id ? vehicle.vehicle.id : `v_${Date.now()}`;
            setVehicles(prev => ({ ...prev, [id]: vehicle }));
        });

        return () => {
            socket.off('position_update');
            socket.off('gtfs_vehicle_position');
        };
    }, [socket]);

    return (
        <div className="map-overlay" style={{ height: '100%' }}>
            <MapContainer center={center} zoom={zoom} style={{ height: '100%' }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {Object.values(vehicles).map((v, idx) => (
                    v && v.position_lat ? (
                        <Marker key={idx} position={[v.position_lat, v.position_lon]} icon={vehicleIcon}>
                            <Popup>
                                <div>
                                    <strong>{v.vehicle && v.vehicle.label}</strong>
                                    <div>Route: {v.trip && v.trip.trip_id}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
}
