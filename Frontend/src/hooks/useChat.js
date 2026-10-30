// src/hooks/useChat.js
export async function sendChatMessage({ message, user }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      role: user.role,        // 'ADMIN' | 'LIBRARIAN' | 'STUDENT'
      name: user.name,
      email: user.email,
      userId: user._id,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Chat request failed');
  }

  const data = await res.json();
  return data.reply;
}
