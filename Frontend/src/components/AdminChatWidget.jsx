// src/components/AdminChatWidget.jsx
import React from 'react';
import ChatWidget from './ChatWidget';

const AdminChatWidget = () => {
  return (
    <ChatWidget
      title="Admin Assistant"
      subtitle="Ask about dashboard stats, users, membership requests, fines, and notifications."
      launcherLabel="Chat with Admin Assistant"
      accentColor="#f97373"
    />
  );
};

export default AdminChatWidget;
