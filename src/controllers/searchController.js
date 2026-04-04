import { supabase } from '../config/supabase.js';

export const searchStudents = async (req, res) => {
  const { branch, skills, placement_status } = req.query;

  let query = supabase.from('students').select(`
    *,
    placements(status)
  `);

  if (branch) query = query.eq('branch', branch);
  if (skills) query = query.contains('skills', [skills]);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const result = placement_status
    ? data.filter((s) =>
        s.placements?.some((p) => p.status === placement_status)
      )
    : data;

  res.json(result);
};
