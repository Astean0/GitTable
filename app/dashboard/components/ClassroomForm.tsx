'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { classroomSchema, type ClassroomFormData } from '@/lib/validations'
import type { Classroom } from '@/lib/types'

interface ClassroomFormProps {
  universityId: string
  initial?: Classroom | null
  onSubmit: (data: ClassroomFormData) => Promise<void>
  onCancel: () => void
}

export default function ClassroomForm({
  universityId,
  initial,
  onSubmit,
  onCancel,
}: ClassroomFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema as z.ZodType<ClassroomFormData>) as unknown as Resolver<ClassroomFormData>,
    defaultValues: {
      name: initial?.name ?? '',
      capacity: initial?.capacity ?? 30,
      equipment: initial?.equipment?.join(', ') ?? '',
      university_id: universityId,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('university_id')} />
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input
        label="Capacity"
        type="number"
        min={1}
        {...register('capacity')}
        error={errors.capacity?.message}
      />
      <Input
        label="Equipment (comma separated)"
        {...register('equipment')}
        error={errors.equipment?.message}
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
