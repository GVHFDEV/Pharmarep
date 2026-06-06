import { z } from 'zod'

export const hcoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  crf: z.string().min(1, 'CRF é obrigatório'),
  cnpj: z
    .string()
    .refine((v) => v === '' || v.replace(/\D/g, '').length === 14, 'CNPJ deve ter 14 dígitos')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  address_number: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  contact_person: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  potential: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type HcoFormData = z.infer<typeof hcoSchema>
