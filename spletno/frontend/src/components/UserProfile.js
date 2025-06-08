import React, { useState } from 'react';
import styles from '../styles/UserProfile.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiX } from "react-icons/fi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

const UserProfile = (props) => {
  const currentUser = props.currentUser
  const rewards = props.currentUser.rewards;
  const reports = props.myreports;
  const statusCounts = {
  reported: 0,
  in_progress: 0,
  cleaned: 0
};

reports.forEach((report) => {
  const status = report.status?.toLowerCase();
  if (statusCounts[status] !== undefined) {
    statusCounts[status]++;
  }
});

const data = [
  { name: 'Reported', value: statusCounts.reported },
  { name: 'In Progress', value: statusCounts.in_progress },
  { name: 'Cleaned', value: statusCounts.cleaned }
];

  return (
    <div className={styles['profile-container']}>
      <div className={styles['profile-close']} onClick={props.onCancel}>
        <FiX size={24} />
      </div>
      <div className={styles['profile-header']}>
        <img
          alt="profile"
          className={styles['profile-photo']}
          src={currentUser?.profilePicture}
        />
        <div className={styles['profile-user-info']}>
          <h3 className={styles['profile-username']}>{currentUser?.username}</h3>
          <p className={styles['profile-reportscount']}>
            🧹 {currentUser?.points} points
          </p>
          <p className={styles['profile-reportscount']}>📢 {reports.length} Published Reports</p>
        </div>
      </div>

      <hr className={styles['profile-separator']} />

      <div className={styles['profile-body']}>

        <div className={styles['profile-graphwrapper']}>
          <h5 className={styles['section-title']}>📊 Report Statistics</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#457744" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles['profile-rewards-section']}>
          <h4 className={styles['section-title']}>🏆 Your Rewards</h4>
          <div className={styles['rewards-grid']}>
            {rewards.map((reward) => (
              <div key={reward._id} className={styles['reward-card']}>
                <img src={reward.image} alt={reward.name} className={styles['reward-image']} />
                <h5 className={styles['reward-title']}>{reward.name}</h5>
                <p className={styles['reward-desc']}>{reward.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
