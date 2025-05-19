import React from 'react';
import { FaBell } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notification</h2>
      </div>
      
      <div className="notifications-content">
        <div className="notifications-empty">
          <div className="bell-icon-container">
            <FaBell className="bell-icon" />
          </div>
          <div className="no-notifications-text">
            No Notifications Found!
          </div>
          <div className="check-section-text">
            Check this section for updated, news and general notification
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 