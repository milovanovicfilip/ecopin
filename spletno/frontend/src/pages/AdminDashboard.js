import React, { useState, useEffect } from 'react';
import '../styles/UserDashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import  UserProfile  from '../components/UserProfile'

import MapView from '../components/MapView';
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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);


      try {
        const res = await axios.get('http://20.73.3.104:5000/api/user');
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

    fetchReports();
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('city').value;
    setSearchQuery(input);
  };
  
  return (
    <div className="dashboard-center-wrapper">
      <div className="dashboard-wrapper">

        <div className="topbar d-flex">
          <div className="logo-area">
            <img src="/logo1.png" alt="My Icon" />
            <h1 className="m-0">EcoPin</h1>
          </div>
          <div className="topbar-main d-flex gap-5 align-items-center justify-content-end">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="city"
                className="form-control w-100 curvy"
                placeholder="Search reports by title..."
              />
            </form>
            <p className='city-name'>Maribor</p>
          </div>
        </div>

        <div className="dashboard">
          <div className="sidebar">
            <div className='reports-background'>
              <h4 className='reports-title black-text'>Reports</h4>
              {loadingReports && <p>Loading...</p>}
              {reportsError && <p style={{ color: 'red' }}>{reportsError}</p>}
            </div>
          </div>

          <div className="main-content">
            <div className='map-container'>
              <MapView citySearch={searchQuery} onLocationSelect={setSelectedLocation} selectedLocation={selectedLocation} />
            </div>
            <div className="users">
                <div className='users-background'>
                  <div className='top'>
                    <h3 className='mb-4'>Users</h3>
                    <hr/>
                    <div className='mb-3'>

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
