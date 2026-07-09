'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { professorSchema, type ProfessorFormData } from '@/lib/validations'
import type { Professor } from '@/lib/types'

interface ProfessorFormProps {
  universityId: string
  initial?: Professor | null
  onSubmit: (data: ProfessorFormData) => Promise<void>
  onCancel: () => void
}

export default function ProfessorForm({
  universityId,
  initial,
  onSubmit,
  onCancel,
}: ProfessorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema as z.ZodType<ProfessorFormData>) as unknown as Resolver<ProfessorFormData>,
    defaultValues: {
      name: initial?.name ?? '',
      email: initial?.email ?? '',
      max_hours: initial?.max_hours ?? 20,
      university_id: universityId,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('university_id')} />
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <Input
        label="Max hours per week"
        type="number"
        min={1}
        max={40}
        {...register('max_hours')}
        error={errors.max_hours?.message}
      />
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
