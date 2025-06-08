import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Login.module.css';
import {useState, } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';


export default function RegisterFormTab() {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  });

  const navigate = useNavigate();
    
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match, please try again.");
      return;
    }

    try {
      const response = await axios.post('http://20.73.3.104:5000/api/user/register', {
        name: formData.firstName,
        lastname: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch(err) {
      setError(err.response?.data?.error ||"Registration failed. Please try again.");
    }
  }

  return (
    <div className={styles['register-center-wrapper']}>
            <div className={`${styles['register-container']} d-flex`}>
              <div className={styles['register-form-tab']}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            className="form-control" 
            id="firstName" 
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input 
            type="text" 
            className="form-control" 
            id="lastName" 
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input 
            type="text" 
            className="form-control" 
            id="username" 
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input 
            type="email" 
            className="form-control" 
            id="email" 
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input 
            type="password" 
            className="form-control" 
            id="password" 
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input 
            type="password" 
            className="form-control" 
            id="repeatPassword" 
            placeholder="Repeat password"
            value={formData.repeatPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="text-center">
          <span>Already have an account? </span>
          <Link to="/login" className={styles['login-link']}>
            Login
          </Link>
        </div>
        
        <div className={styles['social-buttons']}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              fetch('http://20.73.3.104:5000/api/user/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential }),
              })
                .then(res => res.json())
                .then(data => {
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('user', JSON.stringify(data.user));
                  navigate('/');
                })
                .catch(err => console.error('Google register error:', err));
            }}
            onError={() => console.error('Google Login Failed')}
            useOneTap={false}
          />
        </div>
        {error && (
          <div className={styles['error-message']}>
            <span>{error}</span>
          </div>
        )}
        <div className={styles['register-button-wrapper']}>
          <button type="submit" className={`btn ${styles['register-button']}`}>Register</button>
        </div>
      </form>
    </div>
    <div className={styles['register-image']}></div>
            </div>
        </div>
    
  );
}
