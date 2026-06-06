import { z } from 'zod'

export const hcpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  crm: z.string().min(1, 'CRM é obrigatório'),
  cpf: z
    .string()
    .refine((v) => v === '' || v.replace(/\D/g, '').length === 11, 'CPF deve ter 11 dígitos')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  mobile_phone: z.string().optional().or(z.literal('')),
  landline_phone: z.string().optional().or(z.literal('')),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  category: z.string().optional().or(z.literal('')),
  potential: z.string().optional().or(z.literal('')),
  adoption_curve: z.string().optional().or(z.literal('')),
  clinic_name: z.string().optional().or(z.literal('')),
  clinic_address: z.string().optional().or(z.literal('')),
  clinic_address_number: z.string().optional().or(z.literal('')),
  clinic_city: z.string().optional().or(z.literal('')),
  clinic_state: z.string().optional().or(z.literal('')),
  clinic_zip: z.string().optional().or(z.literal('')),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  notes: z.string().optional().or(z.literal('')),
  weekdays: z.array(z.string()).optional(),
  schedule: z.record(z.string(), z.object({
    start: z.string().optional().or(z.literal('')),
    end: z.string().optional().or(z.literal('')),
  })).optional(),
})

export type HcpFormData = z.infer<typeof hcpSchema>
