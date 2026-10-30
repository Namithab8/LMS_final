// src/pages/student/StudentChatbot.jsx
import Chatbot from '../../components/chat/Chatbot';
import { useAuth } from '../../context/AuthContext';

export default function StudentChatbot() {
  const { user } = useAuth(); // user.role === 'STUDENT'
  if (!user) return null;

  return (
    <Chatbot user={{ ...user, role: 'STUDENT' }} title="Student Assistant" />
  );
}
