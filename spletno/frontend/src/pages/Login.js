import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Login.module.css';
import {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';


export default function Login() {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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

    try {
      const response = await axios.post('http://20.73.3.104:5000/api/user/login', {
        username: formData.username,
        email: formData.username,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const user = JSON.parse(localStorage.getItem('user'));

      if (user.role === "ADMIN") {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.error ||"Login failed. Please try again.");
    }
  };

  return (
     <div className={styles['register-center-wrapper']}>
            <div className={`${styles['register-container']} d-flex`}>
              <div className={styles['register-form-tab']}>
      <h2>Login</h2>
      
      <form onSubmit={handleSubmit}>
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
            type="password" 
            className="form-control" 
            id="password" 
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <Link to="/forgot" className={styles['login-link']}>
          Forgot password?
        </Link>
        
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
                  if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    navigate(data.user.role === "ADMIN" ? '/admin' : '/');
                  } else {
                    setError(data.error || 'Google login failed');
                  }
                })
                .catch(err => {
                  setError('Failed to connect to server');
                  console.error('Google login error:', err);
                });
            }}
            onError={() => setError('Google login failed')}
            useOneTap={false}
          />
        </div>

        <div className="text-center">
          <span>Don't have an account? </span>
          <Link to="/register" className={styles['login-link']}>
            Register
          </Link>
        </div>
        
        {error && (
          <div className={styles['error-message']}>
            <span>{error}</span>
          </div>
        )}
        
        <div className={styles['register-button-wrapper']}>
          <button type="submit" className={`btn ${styles['register-button']}`}>Login</button>
        </div>
      </form>
    </div>
    <div className={styles['login-image']}></div>
            </div>
        </div>
    
  );
}
