import { z } from 'zod'

export const visitSchema = z.object({
  hcp_id: z.string().min(1, 'Selecione um médico'),
  scheduled_at: z.string().min(1, 'Data é obrigatória'),
  channel: z.string().min(1, 'Selecione o tipo de contato'),
  location: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type VisitFormData = z.infer<typeof visitSchema>

export const visitResultSchema = z.object({
  status: z.enum(['completed', 'cancelled', 'rescheduled']),
  rating: z.enum(['great', 'good', 'neutral', 'bad']).optional(),
  notes: z.string().optional().or(z.literal('')),
  products: z.array(z.object({
    product_id: z.string(),
    samples_delivered: z.number().min(0),
  })).optional(),
})

export type VisitResultData = z.infer<typeof visitResultSchema>
