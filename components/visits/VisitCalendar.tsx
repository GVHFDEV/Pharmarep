"use client"

import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface VisitCalendarProps {
  visits: Array<{ scheduled_at: string; status: string }>
  onDayClick: (date: Date) => void
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const statusDotColor: Record<string, string> = {
  scheduled: 'bg-info',
  completed: 'bg-success',
  cancelled: 'bg-neutral',
  rescheduled: 'bg-warning',
}

export function VisitCalendar({ visits, onDayClick }: VisitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate prefix empty cells (days before month start)
  const startDayOfWeek = getDay(monthStart) // 0 = Sunday

  const getVisitsForDay = (day: Date) => {
    return visits.filter((visit) => {
      const visitDate = parseISO(visit.scheduled_at)
      return isSameDay(visitDate, day)
    })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-semibold text-text-primary capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Prefix empty cells */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {daysInMonth.map((day) => {
          const dayVisits = getVisitsForDay(day)
          const today = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative',
                today && 'ring-2 ring-accent',
                !today && 'hover:bg-surface-2',
                dayVisits.length > 0 && 'font-medium'
              )}
            >
              <span
                className={cn(
                  'text-text-primary',
                  today && 'text-accent font-semibold'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Status dots */}
              {dayVisits.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayVisits.slice(0, 3).map((visit, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        statusDotColor[visit.status] || 'bg-neutral'
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
