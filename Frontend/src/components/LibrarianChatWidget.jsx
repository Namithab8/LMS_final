// src/components/LibrarianChatWidget.jsx
import React from 'react';
import ChatWidget from './ChatWidget';

const LibrarianChatWidget = () => {
  return (
    <ChatWidget
      title="Librarian Assistant"
      subtitle="Ask about books, borrowing, student requests, fines, and notifications."
      launcherLabel="Chat with Librarian Assistant"
      accentColor="#38bdf8"
    />
  );
};

export default LibrarianChatWidget;
