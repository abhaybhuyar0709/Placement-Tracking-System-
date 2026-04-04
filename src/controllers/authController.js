import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? 'student' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const register = async (req, res) => {
  const { email, password, role = 'student' } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });

  if (error) return res.status(400).json({ error: error.message });

  const token = signToken({ ...data.user, role });
  res.status(201).json({ token, user: { id: data.user.id, email, role } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  const role = data.user.user_metadata?.role ?? 'student';
  const token = signToken({ ...data.user, role });
  res.json({ token, user: { id: data.user.id, email, role } });
};

export const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
    password: newPassword,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Password updated successfully' });
};
