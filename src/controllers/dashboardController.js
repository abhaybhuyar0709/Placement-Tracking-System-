import { supabase } from '../config/supabase.js';

export const getDashboard = async (req, res) => {
  const [
    { count: totalStudents },
    { count: totalCompanies },
    { count: totalInternships },
    { count: ongoingInternships },
    { count: totalPlacements },
    { data: recentPlacements, error },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('internships').select('*', { count: 'exact', head: true }),
    supabase
      .from('internships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ongoing'),
    supabase.from('placements').select('*', { count: 'exact', head: true }),
    supabase
      .from('placements')
      .select('id, role, package, created_at, students(name, email), companies(name, industry)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    stats: {
      total_students: totalStudents,
    },
    total_companies: totalCompanies,
    total_internships: totalInternships,
    ongoing_internships: ongoingInternships,
    total_placements: totalPlacements,
    recent_placements: recentPlacements,
  });
};
