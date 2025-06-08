import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/UserDashboard.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserProfile from '../components/UserProfile';
import MapView from '../components/MapView';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

const UserDashboard = () => {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [image, setImage] = useState(null);

  const [formVisible, setFormVisible] = useState(false);

  const mapRef = useRef();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedReportCoords, setFocusedReportCoords] = useState(null);

  const handleReportClick = (report) => {
    if (report.location && Array.isArray(report.location.coordinates)) {
      const coords = [report.location.coordinates[0], report.location.coordinates[1]];
      setFocusedReportCoords(coords);
    }
  };

  useEffect(() => {
    const fetchUserAndReports = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!token || !user) throw new Error("No auth data found.");

        const res = await axios.get('http://20.73.3.104:5000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCurrentUser(res.data);
        setCurrentToken(token);

        if (user.role === "ADMIN") {
          navigate('/admin');
        }

        const reportRes = await axios.get('http://20.73.3.104:5000/api/user/myreports', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMyReports(reportRes.data);

      } catch (err) {
        console.error('Session verification failed:', err);
        navigate('/logout');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndReports();
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('city').value;
    setSearchQuery(input);
  };

  const handleSearchClick = () => {
    if (mapRef.current) {
      mapRef.current.searchRoute();
    }
  };

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
      },
      (err) => {
        console.error(err);
        alert("Failed to get your location.");
      }
    );
  };

  const handleAddReport = async () => {
    if (!selectedLocation) return alert('Please select a location on the map by right-clicking.');
    if (!title.trim()) return alert('Please enter a report title.');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('severity', severity);
      formData.append('type', 'mixed');
      const locationGeoJSON = {
        type: "Point",
        coordinates: [selectedLocation[0], selectedLocation[1]]
      };
      formData.append('location', JSON.stringify(locationGeoJSON));

      if (image && image instanceof File) {
        const compressedFile = await imageCompression(image, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        });
        formData.append('image', compressedFile);
      }

      await axios.post('http://20.73.3.104:5000/api/report', formData, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Report added successfully!');
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setImage(null);
      setSelectedLocation(null);
      setFormVisible(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add report.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await axios.delete(`http://20.73.3.104:5000/api/report/${reportId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      setMyReports((prev) => prev.filter((r) => r._id !== reportId));
      alert('Report deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete report.');
    }
  };

  if (loading) return <div className={styles.loadingScreen}></div>;
  if (!currentUser) return <div>Failed to load user data</div>;

  return (
    <div className={styles.dashboardCenterWrapper}>
      <div className={styles.dashboardWrapper}>
        <div className={`${styles.topbar} d-flex`}>
          <div className={styles.logoArea}>
            <img src="/logo1.png" alt="My Icon" />
            <h1 className="m-0">EcoPin</h1>
          </div>
          <div className={`${styles.topbarMain} d-flex align-items-center justify-content-end`}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="city"
                className="form-control w-100 curvy"
                placeholder="Search cities..."
              />
            </form>
          </div>
        </div>

        <div className={styles.dashboard}>
          <div className={styles.sidebar}>
            <div className={styles.userBackground}>

              <div className={styles.profileInfo}>
                <img src={currentUser?.profilePicture} alt="Profile" className={styles.profilePicture} />
                <div className={styles.profileText}>
                  <p className={styles.profileName}>{currentUser?.username}</p>
                  <p className={styles.profileEmail}>{currentUser?.email}</p>
                </div>
              </div>
              <div className={styles.profileButtons}>
                <button className={`${styles.customButton} ${styles.logoutButton}`} onClick={logout}>Logout</button>
                <button className={styles.gearButton} onClick={() => setShowProfileEdit(true)}>
                  <img src="/gear.png" alt="Edit Profile" />
                </button>
              </div>

            </div>
            
            <div className={styles.reportsBackground}>
              <h4 className={`${styles.reportsTitle}`}>My reports</h4>
              <ul className={styles.reportList}>
                {myReports.map((report) => {
                  console.log('Image path:', report.image);
                  return(
                  <li className={styles['report-single-card']} key={report._id} onClick ={() => handleReportClick(report)} style = {{cursor: 'pointer'}}>
                    <button className={styles.deleteReportButton} onClick={() => handleDeleteReport(report._id)} aria-label="Close form">
                      &times;
                    </button>
                    <div className={styles.reportCardRow}>
                      {report.image && (
                        <div className={styles.reportCardImageWrapper}>
                          <img
                            src={`http://20.73.3.104:5000/public${report.image}`}
                            alt="report"
                            className={styles.reportCardImage}
                          />
                        </div>
                      )}
                      <div className={styles.reportCardText}>
                        <h6 className={styles['report-single-card-title']}>{report.title}</h6>
                        <p className={styles['report-single-card-description']}>{report.description}</p>
                        <span style={{ fontSize: '12px', color: 'gray' }}>
                          Severity: {report.severity}
                        </span>
                      </div>
                    </div>
                  </li>
                  
                )})}
              </ul>
            </div>
          </div>

          <div className={`${styles.mainContent} ${styles.mapFull}`}>
            <div className={styles.mapContainer}>
              {showProfileEdit ? (
                <UserProfile currentUser={currentUser} myreports={myReports} onCancel={() => setShowProfileEdit(false)} />
              ) : (
                <MapView
                  ref={mapRef}
                  citySearch={searchQuery}
                  onLocationSelect={setSelectedLocation}
                  selectedLocation={selectedLocation}
                  userLocation={userLocation}
                  focusedReportCoords={focusedReportCoords}
                />
              )}

              <button className={`${styles.customButton} ${styles.floatingButton1}`} onClick={handleSearchClick}>
                <img src="/search.png" alt="Search" style={{ width: '24px', height: '24px' }} />
              </button>
              <button className={`${styles.customButton} ${styles.floatingButton}`} onClick={() => setFormVisible(true)}>
                <img src="/megaphone.png" alt="Add Report" style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            <div className={`${styles.addReportSlide} ${formVisible ? styles.visible : styles.hidden}`}>
              <button className={styles.closeFormButton} onClick={() => setFormVisible(false)} aria-label="Close form">
                &times;
              </button>

              <h3 className={styles.blackText}>Add Report</h3>
              <hr />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddReport();
                }}
                className="d-flex flex-column h-100"
              >
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control curvy-less mb-3"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control curvy mb-3"
                  rows={4}
                />
                <label className={`${styles.formLabel} mb-1 ${styles.blackText}`}>Severity level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="form-select mb-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="form-control curvy-less mb-3"
                />
                <div className="bottom mt-auto">
                  <button type="submit" disabled={!selectedLocation} className={`${styles.customButton} mt-3`}>
                    Add
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;