import { supabase } from '../config/supabase.js';

export const getReports = async (req, res) => {
  const [
    { count: totalStudents },
    { count: placedStudents },
    { count: internshipCount },
    { data: companyPlacements, error },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase
      .from('placements')
      .select('student_id', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
    supabase.from('internships').select('*', { count: 'exact', head: true }),
    supabase
      .from('placements')
      .select('company_id, companies(name)')
      .eq('status', 'confirmed'),
  ]);

  if (error) return res.status(500).json({ error: error.message });

  const companyWise = companyPlacements.reduce((acc, p) => {
    const name = p.companies?.name ?? 'Unknown';
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    total_students: totalStudents,
    placed_students: placedStudents,
    internship_count: internshipCount,
    company_wise_placements: companyWise,
  });
};
