import React, { useState } from 'react';
import '../styles/UserProfile.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import axios from 'axios';

const UserProfile = () => {
  const [photo, setPhoto] = useState(null);
  
  return (
    <div className='profile-container'>
      <div className='profile-header'>
        <img alt="slika" className='profile-photo'></img>
        <div className='profile-user-info'>
          <h3 className='profile-username'>
            filipmilovanovic
          </h3>
          <p className='profile-reportscount'>9 Published Reports</p>
        </div>
      </div>
      <hr className='profile-separator'></hr>
      <div className='profile-body'>
        <div className="mb-3">
            <input className="form-control curvy-less" type="file" id="reportPhoto" accept="image/*" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}/>
        </div>
        <div className='profile-graphwrapper'>
        </div>
      </div>
      
  
    </div>
  );
};

export default UserProfile;
