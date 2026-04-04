import { supabase } from '../config/supabase.js';

export const getAllPlacements = async (req, res) => {
  const { data, error } = await supabase
    .from('placements')
    .select('*, students(name, email, branch), companies(name, industry)');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getPlacementById = async (req, res) => {
  const { data, error } = await supabase
    .from('placements')
    .select('*, students(name, email, branch), companies(name, industry)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Placement not found' });
  res.json(data);
};

export const createPlacement = async (req, res) => {
  const { student_id, company_id, role, package: pkg, status = 'confirmed' } = req.body;
  const { data, error } = await supabase
    .from('placements')
    .insert([{ student_id, company_id, role, package: pkg, status }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updatePlacement = async (req, res) => {
  const { data, error } = await supabase
    .from('placements')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deletePlacement = async (req, res) => {
  const { error } = await supabase.from('placements').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Placement deleted successfully' });
};
