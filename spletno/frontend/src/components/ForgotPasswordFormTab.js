import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/LoginRegisterFormTab.module.css';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ForgotPasswordFormTab() {
  return (
    <div className={styles['register-form-tab']}>
      <div className={"d-flex justify-content-between align-items-start mb-4"}>
        <Link to={`/login`}>
          <button 
          className="btn btn-back"
        >
          <FaArrowLeft className="me-2" />
          Back
        </button>
        </Link>
      </div>
      <h2>Reset password</h2>
      
      <div className={styles['form-group']}>
        <input 
          type="text" 
          className="form-control" 
          id="email" 
          placeholder="Enter your email"
        />
      </div>
      <div className={styles['register-button-wrapper']}>
        <button className={`${styles['register-button']} btn`}>Submit</button>
      </div>
    </div>
  );
}