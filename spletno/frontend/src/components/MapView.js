import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import axios from 'axios';

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

const severityIcons = {
  low: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  medium: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  high: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationSelector = ({ onLocationSelect }) => {
  useMapEvents({
    contextmenu(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapView = ({ citySearch, onLocationSelect, selectedLocation }) => {
  const [pois, setPois] = useState([]);
  const [mapCoords, setMapCoords] = useState([46.0569, 14.5058]); // Ljubljana default

  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const res = await axios.get('http://20.73.3.104:5000/api/poi/');
        setPois(res.data);
      } catch (err) {
        console.error('Failed to fetch POIs:', err);
      }
    };

    fetchPOIs();
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

  return (
    <MapContainer
      center={mapCoords}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <ChangeMapView coords={mapCoords} />
      <LocationSelector onLocationSelect={onLocationSelect} />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup>
        {pois.map((poi) => (
          <Marker
            key={poi._id}
            position={[poi.location.coordinates[1], poi.location.coordinates[0]]}
            icon={greenIcon}
          >
            <Popup>
              <strong>{poi.type}</strong>
              <br />
              Last checked: {new Date(poi.lastChecked).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {selectedLocation && (
        <Marker position={selectedLocation} icon={severityIcons.medium}>
          <Popup>Selected location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapView;
