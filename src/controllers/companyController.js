import { supabase } from '../config/supabase.js';

export const getAllCompanies = async (req, res) => {
  const { data, error } = await supabase.from('companies').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getCompanyById = async (req, res) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Company not found' });
  res.json(data);
};

export const createCompany = async (req, res) => {
  const { name, location, industry, contact_email } = req.body;
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name, location, industry, contact_email }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateCompany = async (req, res) => {
  const { data, error } = await supabase
    .from('companies')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteCompany = async (req, res) => {
  const { error } = await supabase.from('companies').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Company deleted successfully' });
};
