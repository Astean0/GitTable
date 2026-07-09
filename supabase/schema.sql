-- GitTableHub Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  region TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE careers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  max_hours INTEGER DEFAULT 20 CHECK (max_hours >= 1 AND max_hours <= 45),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  equipment TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT,
  hours_per_week INTEGER NOT NULL CHECK (hours_per_week >= 1 AND hours_per_week <= 40),
  students_count INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE course_semesters (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, semester_id)
);

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
  day TEXT NOT NULL CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_careers_university ON careers(university_id);
CREATE INDEX idx_professors_university ON professors(university_id);
CREATE INDEX idx_classrooms_university ON classrooms(university_id);
CREATE INDEX idx_courses_career ON courses(career_id);
CREATE INDEX idx_courses_professor ON courses(professor_id);
CREATE INDEX idx_course_semesters_semester ON course_semesters(semester_id);
CREATE INDEX idx_schedules_course ON schedules(course_id);
CREATE INDEX idx_schedules_classroom ON schedules(classroom_id);
CREATE INDEX idx_schedules_day_time ON schedules(day, start_time, end_time);
CREATE INDEX idx_schedules_semester ON schedules(semester_id);

-- Enable Realtime for schedules when available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.semesters;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.course_semesters;
  END IF;
END $$;

-- Seed data
INSERT INTO universities (name, region) VALUES
  ('Universidad de Tarapacá', 'Tarapacá');

INSERT INTO careers (university_id, name)
SELECT id, 'Ingeniería en Informática' FROM universities WHERE name = 'Universidad de Tarapacá'
UNION ALL
SELECT id, 'Administración de Empresas' FROM universities WHERE name = 'Universidad de Tarapacá';

-- Create example semesters for each career (names can be arbitrary)
INSERT INTO semesters (career_id, name)
SELECT c.id, 'Semestre 1' FROM careers c WHERE c.name = 'Ingeniería en Informática'
UNION ALL
SELECT c.id, 'Semestre 2' FROM careers c WHERE c.name = 'Ingeniería en Informática'
UNION ALL
SELECT c.id, 'Semestre 1 Especial' FROM careers c WHERE c.name = 'Ingeniería en Informática'
UNION ALL
SELECT c.id, 'Semestre 1' FROM careers c WHERE c.name = 'Administración de Empresas'
UNION ALL
SELECT c.id, 'Semestre 2' FROM careers c WHERE c.name = 'Administración de Empresas';

INSERT INTO professors (university_id, name, email, max_hours)
SELECT u.id, 'Dr. Pablo Morales', 'pablo.morales@uta.cl', 20 FROM universities u WHERE u.name = 'Universidad de Tarapacá'
UNION ALL
SELECT u.id, 'Dra. Ana Silva', 'ana.silva@uta.cl', 18 FROM universities u WHERE u.name = 'Universidad de Tarapacá'
UNION ALL
SELECT u.id, 'Prof. Carlos Vega', 'carlos.vega@uta.cl', 22 FROM universities u WHERE u.name = 'Universidad de Tarapacá';

INSERT INTO classrooms (university_id, name, capacity, equipment)
SELECT u.id, 'Sala A-101', 40, ARRAY['proyector', 'pizarra digital'] FROM universities u WHERE u.name = 'Universidad de Tarapacá'
UNION ALL
SELECT u.id, 'Lab B-202', 30, ARRAY['computadores', 'proyector'] FROM universities u WHERE u.name = 'Universidad de Tarapacá'
UNION ALL
SELECT u.id, 'Sala C-303', 50, ARRAY['proyector', 'aire acondicionado'] FROM universities u WHERE u.name = 'Universidad de Tarapacá'
UNION ALL
SELECT u.id, 'Auditorio D', 120, ARRAY['proyector', 'micrófono', 'streaming'] FROM universities u WHERE u.name = 'Universidad de Tarapacá';

INSERT INTO courses (career_id, professor_id, name, code, hours_per_week, students_count)
SELECT c.id, p.id, 'Base de Datos', 'INF-301', 4, 35
FROM careers c, professors p
WHERE c.name = 'Ingeniería en Informática' AND p.name = 'Dr. Pablo Morales'
UNION ALL
SELECT c.id, p.id, 'Programación Web', 'INF-302', 4, 32
FROM careers c, professors p
WHERE c.name = 'Ingeniería en Informática' AND p.name = 'Dra. Ana Silva'
UNION ALL
SELECT c.id, p.id, 'Algoritmos', 'INF-303', 3, 28
FROM careers c, professors p
WHERE c.name = 'Ingeniería en Informática' AND p.name = 'Prof. Carlos Vega'
UNION ALL
SELECT c.id, p.id, 'Contabilidad I', 'ADM-201', 3, 45
FROM careers c, professors p
WHERE c.name = 'Administración de Empresas' AND p.name = 'Dra. Ana Silva'
UNION ALL
SELECT c.id, p.id, 'Marketing Digital', 'ADM-202', 3, 38
FROM careers c, professors p
WHERE c.name = 'Administración de Empresas' AND p.name = 'Prof. Carlos Vega';

INSERT INTO schedules (course_id, semester_id, classroom_id, day, start_time, end_time)
SELECT co.id, s.id, cl.id, 'monday', '08:00'::TIME, '09:30'::TIME
FROM courses co
JOIN classrooms cl ON cl.name = 'Lab B-202'
JOIN semesters s ON s.career_id = co.career_id AND s.name = 'Semestre 1'
WHERE co.code = 'INF-301'
UNION ALL
SELECT co.id, s.id, cl.id, 'tuesday', '09:30'::TIME, '11:00'::TIME
FROM courses co
JOIN classrooms cl ON cl.name = 'Sala A-101'
JOIN semesters s ON s.career_id = co.career_id AND s.name = 'Semestre 1'
WHERE co.code = 'INF-302'
UNION ALL
SELECT co.id, s.id, cl.id, 'wednesday', '14:00'::TIME, '15:30'::TIME
FROM courses co
JOIN classrooms cl ON cl.name = 'Lab B-202'
JOIN semesters s ON s.career_id = co.career_id AND s.name = 'Semestre 1'
WHERE co.code = 'INF-303'
UNION ALL
SELECT co.id, s.id, cl.id, 'thursday', '11:00'::TIME, '12:30'::TIME
FROM courses co
JOIN classrooms cl ON cl.name = 'Sala C-303'
JOIN semesters s ON s.career_id = co.career_id AND s.name = 'Semestre 1'
WHERE co.code = 'ADM-201'
UNION ALL
SELECT co.id, s.id, cl.id, 'friday', '15:30'::TIME, '17:00'::TIME
FROM courses co
JOIN classrooms cl ON cl.name = 'Sala A-101'
JOIN semesters s ON s.career_id = co.career_id AND s.name = 'Semestre 1'
WHERE co.code = 'ADM-202';

-- Map courses to the example "Semestre 1" for their career
INSERT INTO course_semesters (course_id, semester_id)
SELECT co.id, s.id
FROM courses co
JOIN semesters s ON s.career_id = co.career_id AND s.name = 'Semestre 1'
WHERE co.code IN ('INF-301','INF-302','INF-303','ADM-201','ADM-202');
