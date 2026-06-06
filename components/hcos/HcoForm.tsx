'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hcoSchema, type HcoFormData } from '@/lib/validations/hco'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { formatPhone, formatCNPJ } from '@/lib/utils/formatters'
import { HCO_CATEGORIES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils/cn'
import type { GeocodingResult } from '@/lib/utils/geocoding'

interface HcoFormProps {
  defaultValues?: Partial<HcoFormData>
  onSubmit: (data: HcoFormData) => Promise<void>
  loading?: boolean
}

export function HcoForm({ defaultValues, onSubmit, loading }: HcoFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<HcoFormData>({
    resolver: zodResolver(hcoSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      whatsapp: '',
      whatsapp2: '',
      address: '',
      address_number: '',
      city: '',
      state: '',
      zip: '',
      neighborhood: '',
      latitude: null,
      longitude: null,
      pharmacists: [],
      category: '',
      potential: '',
      notes: '',
      ...defaultValues,
    },
  })

  const potential = watch('potential')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pharmacists',
  })
  const cnpjValue = watch('cnpj') || ''
  const phoneValue = watch('phone') || ''
  const whatsappValue = watch('whatsapp') || ''
  const whatsapp2Value = watch('whatsapp2') || ''

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cnpj', e.target.value.replace(/\D/g, '').slice(0, 14), { shouldValidate: true })
  }
  const handlePhoneChange = (field: 'phone' | 'whatsapp' | 'whatsapp2') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, e.target.value.replace(/\D/g, '').slice(0, 11), { shouldValidate: true })
    }

  const handleAddressSelect = (result: GeocodingResult) => {
    setValue('address', result.address.street || result.displayName.split(',')[0])
    setValue('neighborhood', result.address.neighborhood)
    setValue('city', result.address.city)
    setValue('state', result.address.state)
    setValue('zip', result.address.zip)
    setValue('latitude', result.latitude)
    setValue('longitude', result.longitude)
  }

  const categoryOptions = HCO_CATEGORIES.map((c) => ({ value: c, label: c }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Identification ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Identificação</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Input label="Nome da Farmácia *" id="name" error={errors.name?.message} disabled={loading} {...register('name')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Input label="CNPJ" id="cnpj" value={cnpjValue ? formatCNPJ(cnpjValue) : ''} onChange={handleCNPJChange} error={errors.cnpj?.message} disabled={loading} placeholder="00.000.000/0000-00" />
          </div>
        </div>
      </div>

      {/* ── Farmacêuticos ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Farmacêuticos</p>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              <Input
                label={index === 0 ? 'Nome' : ''}
                id={`pharmacists.${index}.name`}
                error={errors.pharmacists?.[index]?.name?.message}
                disabled={loading}
                placeholder="Nome do farmacêutico"
                {...register(`pharmacists.${index}.name`)}
              />
              <Input
                label={index === 0 ? 'CRF' : ''}
                id={`pharmacists.${index}.crf`}
                error={errors.pharmacists?.[index]?.crf?.message}
                disabled={loading}
                placeholder="CRF"
                {...register(`pharmacists.${index}.crf`)}
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => remove(index)}
                className={cn(
                  'text-danger hover:text-danger/80 text-sm font-medium px-2 py-1.5 rounded transition-colors',
                  index === 0 ? 'mt-6' : 'mt-0'
                )}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={loading}
            onClick={() => append({ name: '', crf: '' })}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            + Adicionar farmacêutico
          </button>
        </div>
      </div>

      {/* ── Contact ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Contato</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" id="email" type="email" error={errors.email?.message} disabled={loading} {...register('email')} />
          <Input label="Telefone" id="phone" value={phoneValue ? formatPhone(phoneValue) : ''} onChange={handlePhoneChange('phone')} error={errors.phone?.message} disabled={loading} placeholder="(00) 0000-0000" />
          <Input label="WhatsApp" id="whatsapp" value={whatsappValue ? formatPhone(whatsappValue) : ''} onChange={handlePhoneChange('whatsapp')} error={errors.whatsapp?.message} disabled={loading} placeholder="(00) 00000-0000" />
          <Input label="WhatsApp 2" id="whatsapp2" value={whatsapp2Value ? formatPhone(whatsapp2Value) : ''} onChange={handlePhoneChange('whatsapp2')} disabled={loading} placeholder="(00) 00000-0000" />
        </div>
      </div>

      {/* ── Classification ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Classificação</p>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Categoria" id="category" options={categoryOptions} placeholder="Selecione" error={errors.category?.message} disabled={loading} {...register('category')} />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Potencial</label>
            <div className="flex gap-2">
              {(['1', '2', '3'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={loading}
                  onClick={() => setValue('potential', potential === v ? '' : v, { shouldValidate: true })}
                  className={cn(
                    'flex-1 rounded-lg border-2 py-1.5 text-sm font-bold transition-all duration-150',
                    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                    potential === v
                      ? v === '1' ? 'border-accent bg-accent text-white' : v === '2' ? 'border-warning bg-warning-light text-warning' : 'border-danger bg-danger-light text-danger'
                      : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
                  )}
                >{v}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Address ── */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Endereço</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <AddressAutocomplete
              label="Endereço"
              value={watch('address') || ''}
              onChange={(val) => {
                setValue('address', val)
                // Clear coords when user types manually — forces re-geocode on map load
                setValue('latitude', null)
                setValue('longitude', null)
              }}
              onSelect={handleAddressSelect}
              disabled={loading}
            />
          </div>
          <Input label="Número" id="address_number" disabled={loading} placeholder="Nº" {...register('address_number')} />
          <Input label="Bairro" id="neighborhood" disabled={loading} {...register('neighborhood')} />
          <Input label="Cidade" id="city" disabled={loading} {...register('city')} />
          <Input label="Estado" id="state" disabled={loading} {...register('state')} />
          <Input label="CEP" id="zip" disabled={loading} {...register('zip')} />
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
        Salvar HCO
      </Button>
    </form>
  )
}
