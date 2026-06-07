'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hcpSchema, type HcpFormData } from '@/lib/validations/hcp'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { formatCPF, formatPhone } from '@/lib/utils/formatters'
import { ADOPTION_CURVES, SPECIALTIES, WEEKDAYS } from '@/lib/utils/constants'
import { cn } from '@/lib/utils/cn'
import type { GeocodingResult } from '@/lib/utils/geocoding'

interface HcpFormProps {
  defaultValues?: Partial<HcpFormData>
  onSubmit: (data: HcpFormData) => Promise<void>
  loading?: boolean
}

export function HcpForm({ defaultValues, onSubmit, loading }: HcpFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HcpFormData>({
    resolver: zodResolver(hcpSchema),
    defaultValues: {
      name: '',
      crm: '',
      active: true,
      cpf: '',
      email: '',
      mobile_phone: '',
      landline_phone: '',
      specialty: '',
      category: '',
      potential: '',
      adoption_curve: '',
      clinic_name: '',
      clinic_address: '',
      clinic_address_number: '',
      clinic_city: '',
      clinic_state: '',
      clinic_zip: '',
      latitude: null,
      longitude: null,
      notes: '',
      weekdays: [],
      schedule: {},
      ...defaultValues,
    },
  })

  const potential = watch('potential')
  const category = watch('category')
  const activeValue = watch('active')
  const weekdays = watch('weekdays') || []
  const schedule = watch('schedule') || {}
  const cpfValue = watch('cpf') || ''
  const mobileValue = watch('mobile_phone') || ''
  const landlineValue = watch('landline_phone') || ''

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', e.target.value.replace(/\D/g, '').slice(0, 11), { shouldValidate: true })
  }
  const handlePhoneChange = (field: 'mobile_phone' | 'landline_phone') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, e.target.value.replace(/\D/g, '').slice(0, 11), { shouldValidate: true })
    }

  const handleAddressSelect = (result: GeocodingResult) => {
    setValue('clinic_address', result.address.street || result.displayName.split(',')[0])
    setValue('clinic_city', result.address.city)
    setValue('clinic_state', result.address.state)
    setValue('clinic_zip', result.address.zip)
    setValue('latitude', result.latitude)
    setValue('longitude', result.longitude)
  }

  const toggleWeekday = (day: string) => {
    const current = weekdays || []
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day]
    setValue('weekdays', updated)
  }

  const specialtyOptions = SPECIALTIES.map((s) => ({ value: s, label: s }))
  const adoptionCurveOptions = ADOPTION_CURVES.map((c) => ({ value: c, label: c }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Personal ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Dados pessoais</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Input label="Nome *" id="name" error={errors.name?.message} disabled={loading} {...register('name')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Input label="CRM *" id="crm" error={errors.crm?.message} disabled={loading} {...register('crm')} />
          </div>
          <Input label="CPF" id="cpf" value={cpfValue ? formatCPF(cpfValue) : ''} onChange={handleCPFChange} error={errors.cpf?.message} disabled={loading} placeholder="000.000.000-00" />
          <Input label="Email" id="email" type="email" error={errors.email?.message} disabled={loading} {...register('email')} />
          <Input label="Celular" id="mobile_phone" value={mobileValue ? formatPhone(mobileValue) : ''} onChange={handlePhoneChange('mobile_phone')} error={errors.mobile_phone?.message} disabled={loading} placeholder="(00) 00000-0000" />
          <Input label="Tel. Fixo" id="landline_phone" value={landlineValue ? formatPhone(landlineValue) : ''} onChange={handlePhoneChange('landline_phone')} error={errors.landline_phone?.message} disabled={loading} placeholder="(00) 0000-0000" />
        </div>
      </div>

      {/* ── Status toggle ── */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Status</p>
          <p className="text-xs text-text-muted">{activeValue !== false ? 'Ativo' : 'Inativo'}</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => setValue('active', !activeValue)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50',
            activeValue !== false ? 'bg-accent' : 'bg-gray-300'
          )}
        >
          <span className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            activeValue !== false ? 'translate-x-5' : 'translate-x-0'
          )} />
        </button>
      </div>

      {/* ── Professional ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Informações profissionais</p>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Especialidade *" id="specialty" options={specialtyOptions} placeholder="Selecione" error={errors.specialty?.message} disabled={loading} {...register('specialty')} />
          <Select label="Curva de Adoção" id="adoption_curve" options={adoptionCurveOptions} placeholder="Selecione" error={errors.adoption_curve?.message} disabled={loading} {...register('adoption_curve')} />

          {/* Category: buttons 1-3 */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Categoria</label>
            <div className="flex gap-2">
              {(['1', '2', '3'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={loading}
                  onClick={() => setValue('category', category === v ? '' : v, { shouldValidate: true })}
                  className={cn(
                    'flex-1 rounded-lg border-2 py-1.5 text-sm font-bold transition-all duration-150',
                    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                    category === v
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
                  )}
                >{v}</button>
              ))}
            </div>
          </div>

          {/* Potential: buttons 1-6 */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Potencial</label>
            <div className="flex gap-1.5">
              {(['1', '2', '3', '4', '5', '6'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={loading}
                  onClick={() => setValue('potential', potential === v ? '' : v, { shouldValidate: true })}
                  className={cn(
                    'flex-1 rounded-lg border-2 py-1.5 text-xs font-bold transition-all duration-150',
                    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                    potential === v
                      ? parseInt(v) <= 2 ? 'border-accent bg-accent text-white'
                        : parseInt(v) <= 4 ? 'border-warning bg-warning-light text-warning'
                        : 'border-danger bg-danger-light text-danger'
                      : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
                  )}
                >{v}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Schedule ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Horários de Atendimento</p>
        <div className="space-y-3">
          {/* Weekday checkboxes */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Dias de atendimento</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  disabled={loading}
                  onClick={() => toggleWeekday(day.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all duration-150',
                    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                    weekdays.includes(day.value)
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
                  )}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          {/* Per-day time ranges */}
          {weekdays.length > 0 && (
            <div className="space-y-2">
              {WEEKDAYS.filter(day => weekdays.includes(day.value)).map((day) => (
                <div key={day.value} className="grid grid-cols-[80px_1fr_1fr] gap-2 items-center">
                  <span className="text-xs font-medium text-text-secondary">{day.label}</span>
                  <Input
                    label=""
                    id={`schedule_${day.value}_start`}
                    type="time"
                    disabled={loading}
                    value={schedule[day.value]?.start || ''}
                    onChange={(e) => {
                      const current = schedule[day.value] || { start: '', end: '' }
                      setValue('schedule', { ...schedule, [day.value]: { ...current, start: e.target.value } })
                    }}
                    placeholder="Início"
                  />
                  <Input
                    label=""
                    id={`schedule_${day.value}_end`}
                    type="time"
                    disabled={loading}
                    value={schedule[day.value]?.end || ''}
                    onChange={(e) => {
                      const current = schedule[day.value] || { start: '', end: '' }
                      setValue('schedule', { ...schedule, [day.value]: { ...current, end: e.target.value } })
                    }}
                    placeholder="Fim"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Clinic ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Consultório</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nome da Clínica" id="clinic_name" disabled={loading} {...register('clinic_name')} />
          <div className="col-span-2 sm:col-span-1">
            <AddressAutocomplete
              label="Endereço"
              value={watch('clinic_address') || ''}
              onChange={(val) => {
                setValue('clinic_address', val)
                // Clear coords when user types manually — forces re-geocode on map load
                setValue('latitude', null)
                setValue('longitude', null)
              }}
              onSelect={handleAddressSelect}
              disabled={loading}
            />
          </div>
          <Input label="Número" id="clinic_address_number" disabled={loading} placeholder="Nº" {...register('clinic_address_number')} />
          <Input label="Cidade" id="clinic_city" disabled={loading} {...register('clinic_city')} />
          <Input label="Estado" id="clinic_state" disabled={loading} {...register('clinic_state')} />
          <Input label="CEP" id="clinic_zip" disabled={loading} {...register('clinic_zip')} />
        </div>
      </div>

      {/* ── Notes ── */}
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-text-secondary mb-1.5">Observações</label>
        <textarea
          id="notes"
          rows={3}
          disabled={loading}
          className={cn(
            'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors resize-none',
            'focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus',
            errors.notes ? 'border-danger' : 'border-border'
          )}
          placeholder="Notas adicionais..."
          {...register('notes')}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Salvar HCP
      </Button>
    </form>
  )
}
