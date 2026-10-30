// src/pages/admin/AdminChatbot.jsx
import Chatbot from '../../components/chat/Chatbot';
import { useAuth } from '../../context/AuthContext';

export default function AdminChatbot() {
  const { user } = useAuth(); // user.role === 'ADMIN'
  if (!user) return null;

  return <Chatbot user={{ ...user, role: 'ADMIN' }} title="Admin Assistant" />;
}
