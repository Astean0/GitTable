'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { courseSchema, type CourseFormData } from '@/lib/validations'
import type { Course, Professor } from '@/lib/types'

interface CourseFormProps {
  careerId: string
  professors: Professor[]
  initial?: Course | null
  onSubmit: (data: CourseFormData) => Promise<void>
  onCancel: () => void
}

export default function CourseForm({
  careerId,
  professors,
  initial,
  onSubmit,
  onCancel,
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: initial?.name ?? '',
      hours_per_week: initial?.hours_per_week ?? 3,
      students_count: initial?.students_count ?? undefined,
      career_id: careerId,
      professor_id: initial?.professor_id ?? professors[0]?.id ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('career_id')} />
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input
        label="Hours per week"
        type="number"
        min={1}
        max={40}
        {...register('hours_per_week')}
        error={errors.hours_per_week?.message}
      />
      <Input
        label="Students count"
        type="number"
        min={1}
        {...register('students_count')}
        error={errors.students_count?.message}
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Professor</label>
        <select
          {...register('professor_id')}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          {professors.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.professor_id && (
          <p className="text-xs text-red-500">{errors.professor_id.message}</p>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initial ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
