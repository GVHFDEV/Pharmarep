import { z } from 'zod'

export const surveySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().or(z.literal('')),
})

export type SurveyFormData = z.infer<typeof surveySchema>

export const questionSchema = z.object({
  question_text: z.string().min(1, 'Pergunta é obrigatória'),
  question_type: z.enum(['yes_no', 'paragraph']),
})

export type QuestionFormData = z.infer<typeof questionSchema>
