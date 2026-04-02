export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  blood_group?: string;
  weight?: number;
  height?: number;
  medical_history: string;
  created_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  service_id?: number;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
  service_name?: string;
}

export interface Prescription {
  id: number;
  appointment_id: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
  appointment_date?: string;
}

export interface Billing {
  id: number;
  appointment_id: number;
  amount: number;
  status: 'paid' | 'unpaid' | 'partially_paid';
  payment_method?: string;
  created_at: string;
  patient_name?: string;
  appointment_date?: string;
}

export interface Consultation {
  id: number;
  appointment_id: number;
  symptoms: string;
  diagnosis: string;
  treatment_plan: string;
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
  appointment_date?: string;
}
