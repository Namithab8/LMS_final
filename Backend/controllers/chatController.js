// Backend/controllers/chatController.js
import asyncHandler from 'express-async-handler';
import { chatWithLMSAssistant } from '../services/openAIService.js';

export const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const user = req.user || {};

  // Prefer secure role from token; fallback to body for safety
  const role = user.role || req.body.role || 'STUDENT';
  const name = user.name || req.body.name || '';
  const email = user.email || req.body.email || '';
  const userId = user.id || user._id || null;

  try {
    const reply = await chatWithLMSAssistant({
      message,
      role,
      name,
      email,
      userId,
    });

    return res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res
      .status(500)
      .json({ error: 'Failed to get response from assistant' });
  }
});
