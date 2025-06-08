import React, { useState, useEffect } from 'react';
import styles from '../styles/AdminDashboard.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ReportModal from '../components/ReportModal';

import MapViewAdmin from '../components/MapViewAdmin';
import axios from 'axios';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsErorr] = useState(null);

  const [showUsers, setShowUsers] = useState(false);
  const [focusedReport, setFocusedReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);


  const [currentUser, setCurrentUser] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  const toggleUsersPanel = () => {
    setShowUsers(prev => !prev);
  };


  useEffect(() => {
    const verifyAndLoadUser = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if(!token || !user) {
          throw new Error("No auth data found.");
        }

        await axios.get('http://20.73.3.104:5000/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCurrentToken(token);
        return { user, token }; 

      } catch(err) {
        console.error('Session verification failed:', err);

        navigate('/logout');
      } finally {
        setLoading(false);
      } 
    };

    const fetchUsers = async (token) => {
      setLoadingUsers(true);
      try {
        const res = await axios.get('http://20.73.3.104:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsersError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };



    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const res = await axios.get('http://20.73.3.104:5000/api/report');
        setReports(res.data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
        setReportsErorr('Failed to load reports');
      } finally {
        setLoadingReports(false);
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        const { user, token } = await verifyAndLoadUser();

        if (user.role !== "ADMIN") {
          navigate("/");
        }
        
        setCurrentUser(user);
        setCurrentToken(token);
        
        await Promise.all([
          fetchUsers(token),
          fetchReports()
        ]);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

  loadData();
  }, [navigate]);

  const handleAdvanceStatus = async (report) => {
    const statusOrder = ["reported", "in_progress", "cleaned"];
    const currentIndex = statusOrder.indexOf(report.status);
    const nextStatus = statusOrder[currentIndex + 1];

    if (!nextStatus) {
      alert("Already cleaned.");
      return;
    }

    try {
      await axios.patch(
        `http://20.73.3.104:5000/api/report/${report._id}/status`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );
      setFocusedReport(null);
      
      const res = await axios.get(`http://20.73.3.104:5000/api/report`);
      setReports(res.data);
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status.");
    }
  };
  const handleUserFilter = async (userId) => {
  if (!currentToken) return;

  try {
    setLoadingReports(true);
    const res = await axios.get(
      `http://20.73.3.104:5000/api/report/byuser/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      }
    );
    setReports(res.data);
  } catch (error) {
    console.error('Failed to fetch reports by user:', error);
    setReportsErorr('Failed to filter reports');
  } finally {
    setLoadingReports(false);
  }
};

const handleDeleteReport = async (id) => {
  if (!window.confirm("Are you sure you want to delete this report?")) return;

  try {
    await axios.delete(`http://20.73.3.104:5000/api/report/${id}`, {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    }
    );
    setFocusedReport(null);
    setReports(reports.filter((r) => r._id !== id));
  } catch (err) {
    console.error("Delete failed", err);
    alert("Failed to delete report.");
  }
};

  const handleSearch = async (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('searchReports').value;
    //setSearchQuery(input);

    if (!input) return;

    try {
      setLoadingReports(true);
      const res = await axios.get(`http://20.73.3.104:5000/api/report/search?title=${input}`);
      setReports(res.data);
    } catch (err) {
      console.error('Search error:', err);
      setReportsErorr('Failed to search reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUserSearch = async (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('searchUsers').value;

    if (!input) return;

    try {
      setLoadingUsers(true);
      const res = await axios.get(`http://20.73.3.104:5000/api/user/search?username=${input}`, {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    }
    );
      setUsers(res.data);
    } catch (err) {
      console.error('Search error:', err);
      setUsersError('Failed to search users');
    } finally {
      setLoadingUsers(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className={styles['dashboard-center-wrapper']}>
      <div className={styles['dashboard-wrapper']}>
        <div className={`${styles['topbar']} d-flex`}>
          <div className={styles['logo-area']}>
            <img src="/logo1.png" alt="My Icon" />
            <h1 className="m-0">EcoPin</h1>
          </div>
          <div className={`${styles['topbar-main']} d-flex gap-5 align-items-center justify-content-between`}>

            <Link to="/partners" className={styles['topbar-link']}>
              <p className={styles['topbar-link']}>Partners</p>
            </Link>

            <div className="d-flex align-items-center justify-content-between gap-5">
              <img className={styles['city-logo']} src={currentUser?.profilePicture}></img>
              <p className={styles['city-name']}>{currentUser?.name} {currentUser?.lastname}</p>
            </div>
          </div>
        </div>

        <div className={styles['dashboard']}>
          <div className={styles['sidebar']}>
            <div className={styles['reports-background']}>
              <h4 className={styles['reports-title']}>Reports</h4>
               <form onSubmit={handleSearch}>
                <input type="text" name="searchReports" className="form-control w-100 curvy" style={{borderRadius: '15px'}} placeholder="Search reports by title..."/>
                 </form>
              {loadingReports && <p style={{color: 'darkgray'}}>Loading...</p>}
              {reportsError && <p style={{ color: 'red' }}>{reportsError}</p>}
                {!loadingReports && !reportsError && (
                <ul className={styles['report-list']}>
                  {reports.map((report, index) => (
                  <li className={styles['report-single-card']} key={report._id} data-index={index}>
                    <h6 className={styles['report-single-card-title']} onClick={() => {setFocusedReport(report); setSelectedReport(null)}}>{report.title}</h6>
                    <p className={styles['report-single-card-description']}>{report.description}</p>
                    <span style={{ fontSize: '12px', color: 'gray' }}>Severity: {report.severity}</span>
                    <br/>
                    <span style={{ fontSize: '12px', color: 'gray' }}>Status: {report.status}</span>

                    <br/>
                    <button className={styles['manage-button']} onClick={() => {setSelectedReport(report) ;setFocusedReport(report)}}>Manage</button>
                  </li>
                ))}
              </ul>
              )}
            </div>
          </div>

          <div className={styles['main-content']}>
            <div className={`${styles['map-container']} ${styles[showUsers ? 'half-width' : 'full-width']}`}>
              <MapViewAdmin citySearch={searchQuery} onLocationSelect={setSelectedLocation} selectedLocation={selectedLocation} focusedReport={focusedReport}/>
              {selectedReport && (
              <ReportModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onAdvanceStatus={handleAdvanceStatus}
                onDelete={handleDeleteReport}
              
              />
                )}

              <button className={styles['paint-button']}>✏️</button>
              <button className={`${styles['custom-button']} ${styles['toggle-users-button']}`} onClick={toggleUsersPanel}>

                {showUsers ? 'Hide users' : 'Show users'}
              </button>
            </div>
            <div className={`${styles['users']} ${showUsers ? styles['users-visible'] : styles['users-hidden']}`}>
                <div className={styles['users-background']}>
                  <div className={styles['top']}>
                    <h4 className={styles['users-title']}>Users</h4>
                     <form onSubmit={handleUserSearch}>
                        <input type="text" name="searchUsers" className="form-control w-100 curvy" style={{borderRadius: '15px'}} placeholder="Search reports by title..."/>
                      </form>
                    <hr/>
                    <div className='mb-3'>
                        <button
                          className={styles['custom-button']}
                          style={{ marginBottom: '10px' }}
                          onClick={async () => {
                            try {
                              setLoadingReports(true);
                              const res = await axios.get('http://20.73.3.104:5000/api/report');
                              setReports(res.data);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setLoadingReports(false);
                            }
                          }}
                        >
                          Display all reports
                        </button>
                      {loadingUsers && <p>Loading...</p>}
                      {usersError && <p style={{ color: 'red' }}>{usersError}</p>}
                      {!loadingUsers && !usersError && (
                      <ul className={styles['user-list']}>
                        {users
                        .filter((user) => user.role !== 'ADMIN')
                        .map((user) => (
                          <li
                            className={styles['user-card']}
                            key={user._id}
                            onClick={() => handleUserFilter(user._id)}
                          >
                            <img
                              src={user.profilePicture || '/placeholder.png'}
                              alt="User"
                              className={styles['user-avatar']}
                            />
                            <div>
                              <h6 className={styles['user-name']}>{user.username}</h6>
                              <small className={styles['user-email']}>{user.email}</small>
                            </div>
                          </li>
                        ))}
                      </ul>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
