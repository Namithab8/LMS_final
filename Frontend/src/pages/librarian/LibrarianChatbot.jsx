// src/pages/librarian/LibrarianChatbot.jsx
import Chatbot from '../../components/chat/Chatbot';
import { useAuth } from '../../context/AuthContext';

export default function LibrarianChatbot() {
  const { user } = useAuth(); // user.role === 'LIBRARIAN'
  if (!user) return null;

  return (
    <Chatbot
      user={{ ...user, role: 'LIBRARIAN' }}
      title="Librarian Assistant"
    />
  );
}
