export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'

export interface University {
  id: string
  name: string
  region: string | null
  created_at: string
}

export interface Career {
  id: string
  university_id: string
  name: string
  semester: number | null
  created_at: string
}

export interface Professor {
  id: string
  university_id: string
  name: string
  email: string | null
  max_hours: number
  created_at: string
}

export interface Classroom {
  id: string
  university_id: string
  name: string
  capacity: number
  equipment: string[] | null
  created_at: string
}

export interface Course {
  id: string
  career_id: string
  professor_id: string
  name: string
  code: string | null
  hours_per_week: number
  students_count: number | null
  created_at: string
  professors?: Professor
}

export interface Semester {
  id: string
  career_id: string
  name: string
  created_at: string
}

export interface Schedule {
  id: string
  course_id: string
  classroom_id: string
  semester_id?: string
  day: DayOfWeek
  start_time: string
  end_time: string
  created_at: string
  courses?: Course & { professors?: Professor }
  classrooms?: Classroom
  semesters?: Semester
}

export interface Conflict {
  id: string
  schedule_id: string
  type: string | null
  message: string | null
  created_at: string
}

export interface ConflictResult {
  hasConflict: boolean
  message: string
  conflictingSchedule?: Schedule
}

export const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
]

export const TIME_SLOTS = [
  '08:00',
  '09:40',
  '11:20',
  '13:00',
  '14:40',
  '16:20',
  '18:00',
  '19:40',
] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]
