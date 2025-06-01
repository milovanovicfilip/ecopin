import React, { useState } from 'react';
import '../styles/UserDashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MapView from '../components/MapView';
import axios from 'axios';

const UserDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [photo, setPhoto] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('city').value;
    setSearchQuery(input);
  };

  const handleAddReport = async () => {
    if (!selectedLocation) {
      alert('Please select a location on the map by right-clicking.');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a report title.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('severity', severity);
      formData.append('latitude', selectedLocation[0].toString());
      formData.append('longitude', selectedLocation[1].toString());
      if (photo) {
        formData.append('photo', photo);
      }

      await axios.post('http://localhost:5000/api/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Report added successfully!');
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setPhoto(null);
      setSelectedLocation(null);
    } catch (error) {
      console.error(error);
      alert('Failed to add report.');
    }
  };

  return (
    <div className="dashboard-center-wrapper">
      <div className="dashboard-wrapper">

        <div className="topbar d-flex">
          <div className="logo-area">
            <img src="../../public/logo1.svg" alt="My Icon" />
            <h1 className="m-0">EcoPin</h1>
          </div>
          <div className="topbar-main d-flex align-items-center justify-content-end">
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

        <div className="dashboard">
          <div className="sidebar">
            <div className="user-background">
              <div className="profile-info">
                <img src="https://via.placeholder.com/80" alt="Profile Picture" className="profile-picture" />
                <div className="profile-text">
                  <p className="profile-name">John Doe</p>
                  <p className="profile-email">john.doe@example.com</p>
                </div>
              </div>
              <button className="custom-button">Edit Profile</button>
            </div>
            <div className='reports-background'>
              <h4 className='reports-title black-text'>My reports</h4>
            </div>
          </div>

          <div className="main-content">
            <div className='map-container'>
             <MapView citySearch={searchQuery} onLocationSelect={setSelectedLocation} selectedLocation={selectedLocation} />
            </div>
            <div className="add-report">
              <div className='add-report-background'>
                <form 
                  id="reportForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddReport();
                  }}
                >
                  <div className="top">
                    <h3 className="mb-4">Add report</h3>
                    <hr/>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control curvy-less"
                        id="reportTitle"
                        placeholder="Enter title of report"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <textarea
                        className="form-control curvy"
                        id="reportDescription"
                        rows={4}
                        placeholder="Enter description of report"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <input
                        className="form-control curvy-less"
                        type="file"
                        id="reportPhoto"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="severitySelect" className="form-label">
                        Severity level
                      </label>
                      <select
                        id="severitySelect"
                        className="form-select"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        style={{
                          backgroundColor:
                            severity === 'low'
                              ? 'yellow'
                              : severity === 'medium'
                              ? 'orange'
                              : 'red',
                          color: severity === 'low' ? 'black' : 'white',
                        }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </form>
                <div className="bottom mt-auto">
                  <button type="button" className="custom-button mt-3" onClick={handleAddReport}>
                    Add
                  </button>
                </div>        
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
