import { TIME_SLOTS, type DayOfWeek, type TimeSlot } from './types'

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + (minutes || 0)
}

export function addMinutesToTime(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB)
}

const END_TIME_BY_SLOT: Record<TimeSlot, string> = {
  '08:00': '09:30',
  '09:40': '11:10',
  '11:20': '12:50',
  '13:00': '14:30',
  '14:40': '16:10',
  '16:20': '17:50',
  '18:00': '19:30',
  '19:40': '21:00',
}

export function getEndTimeForSlot(startTime: TimeSlot): string {
  return END_TIME_BY_SLOT[startTime] ?? addMinutesToTime(startTime, 90)
}

export function hashColor(input: string): string {
  const colors = [
    'bg-blue-100 border-blue-400 text-blue-900',
    'bg-green-100 border-green-400 text-green-900',
    'bg-purple-100 border-purple-400 text-purple-900',
    'bg-orange-100 border-orange-400 text-orange-900',
    'bg-teal-100 border-teal-400 text-teal-900',
    'bg-pink-100 border-pink-400 text-pink-900',
  ]
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function formatDay(day: DayOfWeek): string {
  const labels: Record<DayOfWeek, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
  }
  return labels[day]
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
