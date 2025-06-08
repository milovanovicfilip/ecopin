import { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  FeatureGroup,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import axios from 'axios';
import 'maplibre-gl/dist/maplibre-gl.css';
import Prompt from './ReportModal';
import 'leaflet-draw/dist/leaflet.draw.css';

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


const ZoomToReport = ({ report }) => {
  const map = useMap();
  const markerRef = useRef();

  useEffect(() => {
    if (report && map) {
      const [lat, lng] = report.location.coordinates;
      map.setView([lat, lng], 16, { animate: true });

      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 300);
    }
  }, [report, map]);

  return null;
};

const MapViewAdmin = ({ citySearch, onLocationSelect, selectedLocation, focusedReport }) => {
  const [reports, setReports] = useState([]);
  //const [mapCoords, setMapCoords] = useState([46.0569, 14.5058]); // Ljubljana default
  const [mapCoords, setMapCoords] = useState([46.555336036939245, 15.642395371691908]); // Maribor default

  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsErorr] = useState(null);

  const featureGroupRef = useRef(null);

  const handlePolygonDeleted = () => {
  fetchReports(); // ← ovo će resetovati i prikazati sve
  };

  const handlePolygonCreated = async (e) => {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0];

    
    const coordinates = latlngs.map((point) => [point.lat, point.lng]);

    if (coordinates.length && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
      coordinates.push(coordinates[0]);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://20.73.3.104:5000/api/report/polygon', {
        coordinates: coordinates,
        type: ''
      },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

      if (res.data.success) {
        console.log('Reports in polygon:', res.data.data);
        setReports(res.data.data);
      } else {
        console.warn('Polygon fetch failed:', res.data.message);
      }
    } catch (error) {
      console.error('Polygon fetch error:', error);
    }
  };
const fetchReports = async () => {
      setLoadingReports(true);
      setReportsErorr(null)

      try {
        const res = await axios.get('http://20.73.3.104:5000/api/report');
        setReports(res.data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
        setReportsErorr('Failed to load reports');
      } finally {
        setLoadingReports(false);
      }
    }
  useEffect(() => {
     

    
    
    fetchReports();
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
      {focusedReport && <ZoomToReport report={focusedReport} />}


      <TileLayer
        url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
      />
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handlePolygonCreated}
          onDeleted={handlePolygonDeleted}
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false,
            polygon: true,
          }}
        />
      </FeatureGroup>
      <MarkerClusterGroup>
        {reports.map((report) => {
          const icon = severityIcons[report.severity] || severityIcons.medium;
          return (
          <Marker
            key={report._id}
            position={[report.location.coordinates[0], report.location.coordinates[1]]}
            icon={icon}
            eventHandlers={{
              click: () => setSelectedReport(report),
            }}
          >
          </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapViewAdmin;
