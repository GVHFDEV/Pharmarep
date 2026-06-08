import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional().or(z.literal('')),
  scheduled_at: z.string().min(1, 'Data é obrigatória'),
  location: z.string().optional().or(z.literal('')),
  budget: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  participants: z.array(z.object({
    hcp_id: z.string().optional(),
    hco_id: z.string().optional(),
  })).optional(),
})

export type EventFormData = z.infer<typeof eventSchema>

export const eventResultSchema = z.object({
  status: z.enum(['completed', 'cancelled']),
  actual_cost: z.string().optional().or(z.literal('')),
  result_notes: z.string().optional().or(z.literal('')),
  attendees: z.array(z.string()).optional(), // participant IDs who attended
})

export type EventResultData = z.infer<typeof eventResultSchema>
