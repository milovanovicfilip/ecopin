import React, { useState } from 'react';
import styles from '../styles/AdminDashboard.module.css';

export default function ReportModal({ report, onClose, onAdvanceStatus, onDelete }) {
  const isFinalStatus = report.status === 'cleaned';
  const [showImageZoom, setShowImageZoom] = useState(false);

  return (
    <div className={styles['report-modal-overlay']}>
      <div className={styles['report-modal']}>
        <button className={styles['modal-close']} onClick={onClose}>✖</button>

        <img
          src={`http://20.73.3.104:5000${report.image}` || '/placeholder.png'}
          alt="Report"
          className={styles['modal-image']}
          onClick={() => setShowImageZoom(true)}
          style={{ cursor: 'zoom-in' }}
        />

        <div className={styles['modal-content']}>
          <div className={styles['modal-title-row']}>
            <h3 className={styles['modal-title']}>{report.title}</h3>
            <div className={styles['modal-dates']}>
              <small>Created: {new Date(report.createdAt).toLocaleDateString()}</small>
              <small>Updated: {new Date(report.updatedAt).toLocaleDateString()}</small>
            </div>
          </div>
          <p className={styles['modal-description']}>{report.description}</p>

          <div className={styles['modal-tags']}>
            <span className={`${styles['tag']} ${styles[report.status]}`}>{report.status}</span>
            <span className={styles['tag']}>{report.type}</span>
            <span className={`${styles['tag']} ${styles[report.severity]}`}>{report.severity}</span>
          </div>

          <div className={styles['modal-buttons']}>
            <button
              className={styles['custom-button']}
              onClick={() => onAdvanceStatus(report)}
          
              disabled={isFinalStatus}
              title={isFinalStatus ? 'Already at final status' : ''}
            >
              Advance status
            </button>
            <button
              className={`${styles['custom-button']} ${styles['delete-button']}`}
              onClick={() => onDelete(report._id)}
            >
              Delete report
            </button>
          </div>
        </div>
      </div>
      {showImageZoom && (
        <div className={styles['zoom-overlay']} onClick={() => setShowImageZoom(false)}>
          <img src={report.image || '/placeholder.png'} alt="Zoomed Report" className={styles['zoomed-image']} />
        </div>
      )}
    </div>
  );
}
