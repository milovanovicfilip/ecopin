import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import axios from 'axios';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import styles from '../styles/UserDashboard.module.css';

if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
};

const poiIcons = {
  bin: new L.Icon({
    iconUrl: '/pin-bin.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  }),
  'eco-island': new L.Icon({
    iconUrl: '/pin-recycle.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  }),
  'disposal-site': new L.Icon({
    iconUrl: '/pin-disposal.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  }),
};

const severityIcons = {
  low: new L.Icon({
    iconUrl: '/low.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  }),
  medium: new L.Icon({
    iconUrl: '/medium.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  }),
  high: new L.Icon({
    iconUrl: '/high.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  }),
};

const otherIcons = {
  user: new L.Icon({
    iconUrl: '/my-location.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  })
};

const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    contextmenu(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapView = forwardRef(({ citySearch, onLocationSelect, selectedLocation, focusedReportCoords }, ref) => {
  const [pois, setPois] = useState([]);
  const [mapCoords, setMapCoords] = useState([46.0569, 14.5058]);
  const [reports, setReports] = useState([]);
  const [activeLayer, setActiveLayer] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    axios.get('http://20.73.3.104:5000/api/poi/').then((res) => setPois(res.data)).catch(console.error);
    axios.get('http://20.73.3.104:5000/api/report').then((res) => setReports(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const geocode = async () => {
      if (!citySearch) return;
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: citySearch,
            format: 'json',
            limit: 1,
          },
        });
        if (res.data.length > 0) {
          const lat = parseFloat(res.data[0].lat);
          const lon = parseFloat(res.data[0].lon);
          setMapCoords([lat, lon]);
        }
      } catch (err) {
        console.error('Geocoding failed:', err);
      }
    };
    geocode();
  }, [citySearch]);

  useEffect(() => {
    if (focusedReportCoords) {
      setMapCoords(focusedReportCoords);
    }
  }, [focusedReportCoords]);
  
  const handleSearchRoute = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLatLng = [position.coords.latitude, position.coords.longitude];
      setUserLocation(userLatLng);

      const allMarkers = [
        ...(pois || []).map((p) => ({
          lat: p.location.coordinates[1],
          lng: p.location.coordinates[0],
          type: p.type.toLowerCase(),
        })),
        ...(reports || []).map((r) => ({
          lat: r.location.coordinates[1],
          lng: r.location.coordinates[0],
          type: 'reports',
        })),
      ];

      const targetMarkers = allMarkers.filter(
        (marker) => activeLayer === 'all' || marker.type === activeLayer
      );

      if (!targetMarkers.length) {
        alert('No markers found for current filter');
        return;
      }

      const getDistance = (from, to) => {
        const R = 6371;
        const dLat = ((to[0] - from[0]) * Math.PI) / 180;
        const dLon = ((to[1] - from[1]) * Math.PI) / 180;
        const lat1 = (from[0] * Math.PI) / 180;
        const lat2 = (to[0] * Math.PI) / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const nearest = targetMarkers.reduce(
        (closest, current) => {
          const dist = getDistance(userLatLng, [current.lat, current.lng]);
          return dist < closest.distance ? { ...current, distance: dist } : closest;
        },
        { distance: Infinity }
      );

      if (nearest.lat == null || nearest.lng == null) return;

      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${userLatLng[1]},${userLatLng[0]};${nearest.lng},${nearest.lat}?overview=full&geometries=geojson`;
        const res = await axios.get(url);

        if (res.data.routes?.length) {
          const coords = res.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(coords);
          setMapCoords(userLatLng);
        } else {
          alert('No route found');
        }
      } catch (err) {
        console.error('Error fetching route:', err);
        alert('Failed to fetch route');
      }
    });
  };

  useImperativeHandle(ref, () => ({
    searchRoute: handleSearchRoute,
  }));

  return (
    <>
      <MapContainer center={mapCoords} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <ChangeMapView coords={mapCoords} />
        <LocationSelector onLocationSelect={onLocationSelect} />
        <TileLayer
        url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
       />
        <MarkerClusterGroup>
          {/* POIs */}
          {['bin', 'eco-island', 'disposal-site'].map((type) =>
            (activeLayer === 'all' || activeLayer === type) &&
            pois
              .filter((poi) => poi.type?.toLowerCase() === type)
              .map((poi) => (
                <Marker
                  key={poi._id}
                  position={[poi.location.coordinates[1], poi.location.coordinates[0]]}
                  icon={poiIcons[type]}
                >
                  <Popup>
                    <strong>{poi.type}</strong>
                    <br />
                    Last checked: {new Date(poi.lastChecked).toLocaleString()}
                  </Popup>
                </Marker>
              ))
          )}

          {/* Reports */}
          {(activeLayer === 'all' || activeLayer === 'reports') &&
            reports
              .filter((r) => Array.isArray(r.location?.coordinates) && r.location.coordinates.length === 2)
              .map((report) => {
                const [lat, lng] = report.location.coordinates;
                const icon = severityIcons[report.severity] || severityIcons.medium;
                return (
                  <Marker key={report._id} position={[lat, lng]} icon={icon}>
                    <Popup className={styles['report-popup']}>
                      <h3>{report.title}</h3>
                      {report.image && (
                        <img 
                          src={`http://20.73.3.104:5000/public${report.image}`} 
                          alt={report.title} 
                          className={styles['report-image']}
                        />
                      )}
                      <p>{report.description}</p>
                    </Popup>
                  </Marker>
                );
              })}
        </MarkerClusterGroup>

        {selectedLocation && (
          <Marker position={selectedLocation} icon={severityIcons.medium}>
            <Popup>Selected location</Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={userLocation} icon={otherIcons.user}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#2691b2" />}
      </MapContainer>

      {/* Controls */}
      <div className={styles.mapControls}>
        {['all', 'bin', 'eco-island', 'disposal-site', 'reports'].map((type) => {
          const icons = {
            all: activeLayer === 'all' ? '/list-white.png' : '/list-black.png',
            bin: activeLayer === 'bin' ? '/recycle-bin-black.png' : '/bin-black.png',
            'eco-island': activeLayer === 'eco-island' ? '/recycle-sign-white.png' : '/recycle-sign.png',
            'disposal-site': activeLayer === 'disposal-site' ? '/recycling-center-white.png' : '/recycling-center.png',
            reports: activeLayer === 'reports' ? '/warning-sign-white.png' : '/warning-sign-black.png',
          };
          return (
            <button
              key={type}
              className={`${styles.filterButton} ${activeLayer === type ? styles.active : ''}`}
              onClick={() => setActiveLayer(type)}
            >
              <img src={icons[type]} alt={type} width="20" height="20" />
            </button>
          );
        })}
      </div>
    </>
  );
});

export default MapView;