import { supabase } from '../config/supabase.js';

export const getAllStudents = async (req, res) => {
  const { data, error } = await supabase.from('students').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getStudentById = async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Student not found' });
  res.json(data);
};

export const createStudent = async (req, res) => {
  const { name, email, branch, year, skills, resume_url } = req.body;
  const { data, error } = await supabase
    .from('students')
    .insert([{ name, email, branch, year, skills, resume_url }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateStudent = async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteStudent = async (req, res) => {
  const { error } = await supabase.from('students').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Student deleted successfully' });
};
