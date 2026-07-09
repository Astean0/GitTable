import { z } from 'zod'

export const universitySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  region: z.string().optional(),
})

export const careerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  university_id: z.string().uuid(),
})

export const professorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  max_hours: z.preprocess((value) => (value === '' ? 20 : value), z.coerce.number().min(1).max(45).default(20)),
  university_id: z.string().uuid(),
})

export const classroomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be greater than 0'),
  equipment: z.string().optional(),
  university_id: z.string().uuid(),
})

export const courseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  hours_per_week: z.coerce.number().min(1).max(40),
  students_count: z.preprocess((value) => (value === '' ? undefined : value), z.coerce.number().min(1).optional()),
  career_id: z.string().uuid(),
  professor_id: z.string().uuid(),
})

export type UniversityFormData = z.infer<typeof universitySchema>
export type CareerFormData = z.infer<typeof careerSchema>
export type ProfessorFormData = z.infer<typeof professorSchema>
export type ClassroomFormData = z.infer<typeof classroomSchema>
export type CourseFormData = z.infer<typeof courseSchema>
