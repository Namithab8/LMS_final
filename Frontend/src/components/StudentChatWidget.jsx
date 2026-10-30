// src/components/StudentChatWidget.jsx
import React from 'react';
import ChatWidget from './ChatWidget';

const StudentChatWidget = () => {
  return (
    <ChatWidget
      title="Student Assistant"
      subtitle="Ask about your borrowed books, due dates, membership, fines, and available books."
      launcherLabel="Chat with Student Assistant"
      accentColor="#34d399"
    />
  );
};

export default StudentChatWidget;
