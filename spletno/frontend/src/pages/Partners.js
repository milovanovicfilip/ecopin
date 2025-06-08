import React, { useState, useEffect } from 'react';
import styles from '../styles/AdminDashboard.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


import axios from 'axios';

const Partners = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partnersError, setPartnersError] = useState(null);

  const [showPartner, setShowPartner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
    const [currentToken, setCurrentToken] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState(null);

  
  const toggleUsersPanel = () => {
    setShowPartner(prev => !prev);
  };

  const [loading, setLoading] = useState(true);
  

  const navigate = useNavigate();
  
  useEffect(() => {
  const verifyAndLoadUser = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!token || !user) {
        throw new Error("No auth data found.");
      }

      await axios.get('http://20.73.3.104:5000/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCurrentUser(user);
      setCurrentToken(token);

      if (user.role !== "ADMIN") {
        navigate("/");
      }

      return token;

    } catch (err) {
      console.error('Session verification failed:', err);
      navigate('/logout');
    }
  };

  const fetchPartners = async (token) => {
    setLoadingPartners(true);
    setPartnersError(null);

    try {
      const res = await axios.get(`http://20.73.3.104:5000/api/partners`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPartners(res.data);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      setPartnersError('Failed to load partners');
    } finally {
      setLoadingPartners(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    const token = await verifyAndLoadUser();
    if (token) {
      await fetchPartners(token);
    }
    setLoading(false);
  };

  loadAll();
}, [navigate]);


  const handleSearch = async (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('partner').value;

    setLoadingPartners(true);
    setPartnersError(null);

    try {
      const res = await axios.get(`http://20.73.3.104:5000/api/partners?name=${input}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      setPartners(res.data);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      setPartnersError('Failed to load partners');
    } finally {
      setLoadingPartners(false);
    }
  };
  
  return (
    <div className={styles['dashboard-center-wrapper']}>
      <div className={styles['dashboard-wrapper']} style={{background: "#F6F5EE"}}>

        <div className={`${styles['topbar']} d-flex`}>
          <div className={styles['logo-area']}>
            <img src="/logo1.png" alt="My Icon" />
            <h1 className="m-0">EcoPin</h1>
          </div>
          <div className={`${styles['topbar-main']} d-flex gap-5 align-items-center justify-content-between`}>
            
            <Link to="/admin" className={styles['topbar-link']}>
                <p className={styles['topbar-link']}>Admin dashboard</p>
            </Link>
            <div className="d-flex align-items-center justify-content-between gap-5">
                <img className={styles['city-logo']} src={currentUser?.profilePicture}></img>
                <p className={styles['city-name']}>{currentUser?.name} {currentUser?.lastname}</p>
            </div>
          </div>
        </div>

        <div className={styles['main-partners-container']}>

              <h2 className={styles['partners-title']}>Partners</h2>

              <form onSubmit={handleSearch} className={styles['partners-search']}>
                <input type="text" name="partner" className="form-control curvy" placeholder="Search partners..." />
              </form>

              {loadingPartners && <p>Loading...</p>}
              {partnersError && <p style={{ color: 'red' }}>{partnersError}</p>}

              {!loadingPartners && !partnersError && (
                <div className={styles['partners-grid']}>
                  {partners.map((partner) => (
                    <div key={partner._id} className={styles['partner-card']} onClick={() => setSelectedPartner(partner)}>
                      <img src={partner.logo || '/placeholder.png'} alt="logo" className={styles['partner-logo']} />
                      <h5 className={styles['partner-name']}>{partner.name}</h5>
                      <p className={styles['partner-short-description']}>{partner.description}</p>
                    </div>
                  ))}
                </div>
              )}

            {selectedPartner && (
            <div className={styles['partner-modal-overlay']}>
              <div className={styles['partner-modal']}>
                <button className={styles['modal-close']} onClick={() => setSelectedPartner(null)}>✖</button>
                
                <img src={selectedPartner.logo || "/placeholder.png"} alt="Partner" className={styles['partner-detail-image']} />
                <h3>{selectedPartner.name}</h3>
                <p>{selectedPartner.description}</p>

                <h6>Reward Types:</h6>
                <ul className={styles['reward-types']}>
                  {selectedPartner.rewardTypes.map((type) => (
                    <li key={type._id || type} className={styles['reward-type']}>{type}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

      </div>

      </div>
    </div>
  );
};

export default Partners;
