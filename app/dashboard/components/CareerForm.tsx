'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { careerSchema, type CareerFormData } from '@/lib/validations'
import type { Career } from '@/lib/types'

interface CareerFormProps {
  universityId: string
  initial?: Career | null
  onSubmit: (data: CareerFormData) => Promise<void>
  onCancel: () => void
}

export default function CareerForm({
  universityId,
  initial,
  onSubmit,
  onCancel,
}: CareerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema as z.ZodType<CareerFormData>) as unknown as Resolver<CareerFormData>,
    defaultValues: {
      name: initial?.name ?? '',
      university_id: universityId,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('university_id')} />
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      {/* Semesters are managed separately per career */}
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
