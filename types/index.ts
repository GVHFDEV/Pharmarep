export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  company: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface HCP {
  id: string;
  user_id: string;
  name: string;
  crm: string;
  cpf: string | null;
  email: string | null;
  mobile_phone: string | null;
  landline_phone: string | null;
  birth_date: string | null;
  specialty: string;
  category: string | null;
  potential: 1 | 2 | 3 | 4 | 5 | 6 | null;
  adoption_curve: 'Ciente' | 'Interessado' | 'Avaliando' | 'Prescrevendo' | 'Preferindo' | 'Influenciador' | null;
  clinic_name: string | null;
  clinic_address: string | null;
  clinic_address_number: string | null;
  clinic_city: string | null;
  clinic_state: string | null;
  clinic_zip: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  weekdays: string[] | null;
  schedule: Record<string, { start: string; end: string }> | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  purpose: string | null;
  product_type: 'amostra' | 'material' | null;
  active: boolean;
  created_at: string;
}

export interface InventoryTransaction {
  id: string;
  user_id: string;
  product_id: string;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string | null;
  visit_id: string | null;
  created_at: string;
  product?: Pick<Product, 'name'>;
}

export interface Visit {
  id: string;
  user_id: string;
  hcp_id: string;
  scheduled_at: string;
  completed_at: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  channel: 'presencial' | 'virtual' | 'telefone' | 'whatsapp' | 'email' | 'outros' | null;
  rating: 'great' | 'good' | 'neutral' | 'bad' | null;
  notes: string | null;
  duration_minutes: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitProduct {
  id: string;
  visit_id: string;
  product_id: string;
  samples_delivered: number;
  notes: string | null;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  updated_at: string;
  product?: Product;
}

export interface HCO {
  id: string;
  user_id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  whatsapp2: string | null;
  address: string | null;
  address_number: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  pharmacists: Array<{ name: string; crf: string }> | null;
  category: string | null;
  potential: 1 | 2 | 3 | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineDeal {
  id: string;
  user_id: string;
  hcp_id: string;
  title: string;
  stage: 'prospeccao' | 'primeiro_contato' | 'visita_agendada' | 'em_relacionamento' | 'convertido' | 'perdido';
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  expected_close: string | null;
  created_at: string;
  updated_at: string;
  hcp?: Pick<HCP, 'name' | 'specialty'>;
}
