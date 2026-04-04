-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  branch TEXT,
  year INT,
  skills TEXT[],
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  industry TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internships
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('ongoing', 'completed')) DEFAULT 'ongoing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Placements
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  package NUMERIC,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'rejected')) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
