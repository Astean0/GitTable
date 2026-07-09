'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { universitySchema, type UniversityFormData } from '@/lib/validations'
import type { University } from '@/lib/types'

interface UniversityFormProps {
  initial?: University | null
  onSubmit: (data: UniversityFormData) => Promise<void>
  onCancel: () => void
}

export default function UniversityForm({ initial, onSubmit, onCancel }: UniversityFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UniversityFormData>({
    resolver: zodResolver(universitySchema as z.ZodType<UniversityFormData>) as unknown as Resolver<UniversityFormData>,
    defaultValues: {
      name: initial?.name ?? '',
      region: initial?.region ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input label="Region" {...register('region')} error={errors.region?.message} />
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
