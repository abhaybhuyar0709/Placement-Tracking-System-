import { supabase } from '../config/supabase.js';

export const getAllInternships = async (req, res) => {
  const { data, error } = await supabase
    .from('internships')
    .select('*, students(name, email), companies(name)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getInternshipById = async (req, res) => {
  const { data, error } = await supabase
    .from('internships')
    .select('*, students(name, email), companies(name)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Internship not found' });
  res.json(data);
};

export const createInternship = async (req, res) => {
  const { student_id, company_id, start_date, end_date, status = 'ongoing' } = req.body;
  const { data, error } = await supabase
    .from('internships')
    .insert([{ student_id, company_id, start_date, end_date, status }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateInternship = async (req, res) => {
  const { data, error } = await supabase
    .from('internships')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteInternship = async (req, res) => {
  const { error } = await supabase.from('internships').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Internship deleted successfully' });
};
