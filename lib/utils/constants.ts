export const ADOPTION_CURVES = [
  'Inovador',
  'Early Adopter',
  'Maioria Inicial',
  'Maioria Tardia',
  'Retardatário',
] as const

export const PIPELINE_STAGES = [
  { value: 'prospeccao', label: 'Prospecção' },
  { value: 'primeiro_contato', label: 'Primeiro Contato' },
  { value: 'visita_agendada', label: 'Visita Agendada' },
  { value: 'em_relacionamento', label: 'Em Relacionamento' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
] as const

export const VISIT_STATUSES = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'rescheduled', label: 'Reagendada' },
] as const

export const VISIT_RATINGS = [
  { value: 'great', label: 'Ótima', emoji: '😊' },
  { value: 'good', label: 'Boa', emoji: '👍' },
  { value: 'neutral', label: 'Neutra', emoji: '😐' },
  { value: 'bad', label: 'Ruim', emoji: '😞' },
] as const

export const SPECIALTIES = [
  'Cardiologista',
  'Clínico Geral',
  'Dermatologista',
  'Endocrinologista',
  'Gastroenterologista',
  'Ginecologista',
  'Neurologista',
  'Oftalmologista',
  'Ortopedista',
  'Otorrinolaringologista',
  'Pediatra',
  'Pneumologista',
  'Psiquiatra',
  'Reumatologista',
  'Urologista',
  'Outro',
] as const

export const PRIORITIES = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
] as const

export const HCO_CATEGORIES = [
  'Farmácia de Rede',
  'Farmácia Independente',
  'Farmácia de Manipulação',
  'Drogaria',
  'Farmácia Hospitalar',
  'Distribuidora',
  'Outro',
] as const

export const WEEKDAYS = [
  { value: 'seg', short: 'Seg', label: 'Segunda' },
  { value: 'ter', short: 'Ter', label: 'Terça' },
  { value: 'qua', short: 'Qua', label: 'Quarta' },
  { value: 'qui', short: 'Qui', label: 'Quinta' },
  { value: 'sex', short: 'Sex', label: 'Sexta' },
  { value: 'sab', short: 'Sáb', label: 'Sábado' },
] as const

export const VISIT_CHANNELS = [
  { value: 'presencial', label: 'Presencial', emoji: '🏥' },
  { value: 'virtual', label: 'Virtual', emoji: '💻' },
  { value: 'telefone', label: 'Telefone', emoji: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
  { value: 'email', label: 'Email', emoji: '📧' },
  { value: 'outros', label: 'Outros', emoji: '📋' },
] as const

export const PRODUCT_TYPES = [
  { value: 'amostra', label: 'Amostra' },
  { value: 'material', label: 'Material Promocional' },
] as const

export const ITEMS_PER_PAGE = 20
