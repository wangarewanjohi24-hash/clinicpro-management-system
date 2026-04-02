import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  LayoutDashboard, 
  Plus, 
  Search, 
  Clock, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Phone,
  User,
  Activity,
  Stethoscope,
  Pill,
  TrendingUp,
  Settings,
  LogOut,
  MoreVertical,
  Filter,
  CreditCard,
  UserCheck,
  ClipboardList,
  ShieldCheck,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isToday, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import type { Patient, Doctor, Appointment, Service, Prescription, Billing, Consultation } from './types';
import DashboardChart from './components/DashboardChart';

type View = 'dashboard' | 'patients' | 'appointments' | 'services' | 'prescriptions' | 'billing' | 'doctors' | 'consultations' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [trends, setTrends] = useState<{ month: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddBilling, setShowAddBilling] = useState(false);
  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const API_BASE = typeof window !== 'undefined' ? window.location.origin : '';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoints = [
        `${API_BASE}/api/patients`,
        `${API_BASE}/api/doctors`,
        `${API_BASE}/api/appointments`,
        `${API_BASE}/api/services`,
        `${API_BASE}/api/prescriptions`,
        `${API_BASE}/api/billing`,
        `${API_BASE}/api/consultations`,
        `${API_BASE}/api/stats/trends`
      ];

      const responses = await Promise.all(endpoints.map(url => fetch(url)));
      
      for (const res of responses) {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`API Error (${res.url}): ${errorData.error || res.statusText}`);
        }
      }

      const [pData, dData, aData, sData, prData, bData, cData, tData] = await Promise.all(
        responses.map(res => res.json())
      );

      setPatients(pData);
      setDoctors(dData);
      setAppointments(aData);
      setServices(sData);
      setPrescriptions(prData);
      setBilling(bData);
      setConsultations(cData);
      setTrends(tData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      age: parseInt(formData.get('age') as string),
      gender: formData.get('gender'),
      contact: formData.get('contact'),
      blood_group: formData.get('blood_group'),
      weight: parseFloat(formData.get('weight') as string),
      height: parseFloat(formData.get('height') as string),
      medical_history: formData.get('medical_history')
    };

    try {
      const response = await fetch(`${API_BASE}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save patient');
      }

      setShowAddPatient(false);
      fetchData();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      patient_id: parseInt(formData.get('patient_id') as string),
      doctor_id: parseInt(formData.get('doctor_id') as string),
      service_id: parseInt(formData.get('service_id') as string),
      appointment_date: formData.get('date'),
      appointment_time: formData.get('time'),
      notes: formData.get('notes')
    };

    try {
      await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setShowAddAppointment(false);
      fetchData();
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string)
    };

    try {
      await fetch(`${API_BASE}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setShowAddService(false);
      fetchData();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      appointment_id: parseInt(formData.get('appointment_id') as string),
      medication: formData.get('medication'),
      dosage: formData.get('dosage'),
      frequency: formData.get('frequency'),
      duration: formData.get('duration'),
      notes: formData.get('notes')
    };

    try {
      await fetch(`${API_BASE}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setShowAddPrescription(false);
      fetchData();
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      specialization: formData.get('specialization')
    };

    try {
      await fetch(`${API_BASE}/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setShowAddDoctor(false);
      fetchData();
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  const handleAddBilling = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      appointment_id: parseInt(formData.get('appointment_id') as string),
      amount: parseFloat(formData.get('amount') as string),
      status: formData.get('status'),
      payment_method: formData.get('payment_method')
    };

    try {
      await fetch(`${API_BASE}/api/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setShowAddBilling(false);
      fetchData();
    } catch (error) {
      console.error('Error adding billing:', error);
    }
  };

  const handleAddConsultation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      appointment_id: parseInt(formData.get('appointment_id') as string),
      symptoms: formData.get('symptoms'),
      diagnosis: formData.get('diagnosis'),
      treatment_plan: formData.get('treatment_plan')
    };

    try {
      await fetch(`${API_BASE}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setShowAddConsultation(false);
      fetchData();
    } catch (error) {
      console.error('Error adding consultation:', error);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contact.includes(searchQuery)
  );

  const todayAppointments = appointments.filter(a => isToday(parseISO(a.appointment_date)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col sticky top-0 h-screen shadow-xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span>Clinic<span className="text-blue-500">Pro</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
          <button 
            onClick={() => setView('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'dashboard' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <LayoutDashboard className={cn("w-5 h-5 transition-colors", view === 'dashboard' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Dashboard</span>
          </button>

          <div className="px-4 mt-8 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clinical</div>
          <button 
            onClick={() => setView('patients')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'patients' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <Users className={cn("w-5 h-5 transition-colors", view === 'patients' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Patients</span>
          </button>
          <button 
            onClick={() => setView('appointments')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'appointments' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <Stethoscope className={cn("w-5 h-5 transition-colors", view === 'appointments' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Consultation Area</span>
          </button>
          <button 
            onClick={() => setView('consultations')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'consultations' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <History className={cn("w-5 h-5 transition-colors", view === 'consultations' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Medical Records</span>
          </button>
          <button 
            onClick={() => setView('prescriptions')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'prescriptions' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <Pill className={cn("w-5 h-5 transition-colors", view === 'prescriptions' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Prescriptions</span>
          </button>

          <div className="px-4 mt-8 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administration</div>
          <button 
            onClick={() => setView('doctors')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'doctors' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <UserCheck className={cn("w-5 h-5 transition-colors", view === 'doctors' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Doctors</span>
          </button>
          <button 
            onClick={() => setView('services')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'services' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <ClipboardList className={cn("w-5 h-5 transition-colors", view === 'services' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Services</span>
          </button>
          <button 
            onClick={() => setView('billing')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'billing' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <CreditCard className={cn("w-5 h-5 transition-colors", view === 'billing' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Billing</span>
          </button>
          <button 
            onClick={() => setView('admin')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              view === 'admin' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <ShieldCheck className={cn("w-5 h-5 transition-colors", view === 'admin' ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            <span className="font-medium">Admin Panel</span>
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">Clinic Manager</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">{view}</h1>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <p className="text-sm text-slate-500 font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search patients, records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-slate-100/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-80 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-slate-200 mx-1" />
              <button className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>12%</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Total Patients</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{patients.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>5%</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Today's Visits</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{todayAppointments.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                        <Clock className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-rose-400 bg-rose-50 px-2.5 py-1 rounded-full">High</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Pending Reviews</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      {appointments.filter(a => a.status === 'scheduled').length}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Services Offered</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{services.length}</h3>
                  </div>
                </div>

                {/* Chart and Schedule */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Patient Growth</h2>
                        <p className="text-sm text-slate-500 font-medium">Monthly registration trends</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <Filter className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    <DashboardChart data={trends} />
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h2 className="font-bold text-slate-900">Upcoming Visits</h2>
                      <button 
                        onClick={() => setView('appointments')}
                        className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:text-blue-700 transition-colors"
                      >
                        See All
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                      {todayAppointments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Calendar className="w-8 h-8" />
                          </div>
                          <p className="text-slate-400 text-sm font-medium">No appointments for today</p>
                        </div>
                      ) : (
                        todayAppointments.map(app => (
                          <div key={app.id} className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                              {app.patient_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{app.patient_name}</h4>
                              <p className="text-xs text-slate-500 font-medium truncate">{app.service_name || 'General'} • {app.appointment_time}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <button onClick={() => setView('patients')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Patients</p>
                    </button>
                    <button onClick={() => setView('appointments')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Consultation</p>
                    </button>
                    <button onClick={() => setView('prescriptions')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Pill className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Prescriptions</p>
                    </button>
                    <button onClick={() => setView('doctors')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Doctors</p>
                    </button>
                    <button onClick={() => setView('services')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Services</p>
                    </button>
                    <button onClick={() => setView('billing')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Billing</p>
                    </button>
                    <button onClick={() => setView('admin')} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Admin Panel</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'patients' && (
              <motion.div 
                key="patients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage and view all patient medical records</p>
                  </div>
                  <button 
                    onClick={() => setShowAddPatient(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add New Patient
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Filter patients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {filteredPatients.length === 0 ? (
                      <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No patients found matching your search</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your search terms or add a new patient if they are not in the directory.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vitals</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPatients.map(patient => (
                            <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg shadow-inner">
                                    {patient.name[0]}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{patient.name}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{patient.gender} • {patient.age} Years</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex flex-wrap gap-2">
                                  {patient.blood_group && (
                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black border border-rose-100">{patient.blood_group}</span>
                                  )}
                                  {patient.weight && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black border border-blue-100">{patient.weight}kg</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {patient.contact}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="text-sm font-semibold text-slate-500">
                                  {format(parseISO(patient.created_at), 'MMM d, yyyy')}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'appointments' && (
              <motion.div 
                key="appointments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h2>
                    <p className="text-slate-500 font-medium mt-1">Schedule and manage patient clinic visits</p>
                  </div>
                  <button 
                    onClick={() => setShowAddAppointment(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    New Appointment
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {appointments.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                      <div className="flex items-center gap-8">
                        <div className="text-center min-w-[90px] bg-slate-50 py-3 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors duration-300">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{format(parseISO(app.appointment_date), 'MMM')}</p>
                          <p className="text-3xl font-black text-slate-900">{format(parseISO(app.appointment_date), 'dd')}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xl tracking-tight">{app.patient_name}</h4>
                          <div className="flex items-center gap-6 mt-2">
                            <span className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                              <User className="w-4 h-4 text-blue-500" />
                              {app.doctor_name}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                              <Clock className="w-4 h-4 text-blue-500" />
                              {app.appointment_time}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                              <Stethoscope className="w-4 h-4 text-blue-500" />
                              {app.service_name || 'General Consultation'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {app.status === 'scheduled' && (
                          <div className="flex items-center gap-2 mr-4">
                            <button 
                              onClick={() => {
                                setSelectedAppointment(app.id);
                                setShowAddPrescription(true);
                              }}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              Prescribe
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedAppointment(app.id);
                                setShowAddConsultation(true);
                              }}
                              className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-white transition-all"
                            >
                              Consult
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedAppointment(app.id);
                                setShowAddBilling(true);
                              }}
                              className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                            >
                              Bill
                            </button>
                            <button 
                              onClick={() => updateAppointmentStatus(app.id, 'completed')}
                              className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                              className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-6 h-6" />
                            </button>
                          </div>
                        )}
                        <div className={cn(
                          "px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border",
                          app.status === 'scheduled' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          app.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {app.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'services' && (
              <motion.div 
                key="services"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Services</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage medical services and pricing</p>
                  </div>
                  <button 
                    onClick={() => setShowAddService(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Add Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(service => (
                    <div key={service.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">${service.price}</span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">{service.description}</p>
                      <button className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                        Edit Service
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'prescriptions' && (
              <motion.div 
                key="prescriptions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Prescriptions</h2>
                    <p className="text-slate-500 font-medium mt-1">Track patient medications and dosages</p>
                  </div>
                  <button 
                    onClick={() => setShowAddPrescription(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Issue Prescription
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {prescriptions.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Pill className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No prescriptions found</h3>
                      <p className="text-slate-500 font-medium max-w-xs mx-auto">Start by issuing a new prescription for a patient from the button above.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosage/Freq</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {prescriptions.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="px-8 py-5">
                                <span className="font-bold text-slate-900">{p.patient_name}</span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                  <Pill className="w-4 h-4 text-blue-500" />
                                  <span className="font-semibold text-slate-700">{p.medication}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="text-sm text-slate-600 font-medium">{p.dosage} • {p.frequency}</span>
                              </td>
                              <td className="px-8 py-5">
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{p.duration}</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span className="text-sm font-semibold text-slate-400">
                                  {p.created_at ? format(parseISO(p.created_at), 'MMM d, yyyy') : 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'consultations' && (
              <motion.div 
                key="consultations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Consultations</h2>
                    <p className="text-slate-500 font-medium mt-1">Detailed patient diagnosis and treatment plans</p>
                  </div>
                  <button 
                    onClick={() => setShowAddConsultation(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    New Consultation
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {consultations.map(c => (
                    <div key={c.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {c.patient_name?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xl tracking-tight">{c.patient_name}</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Dr. {c.doctor_name} • {format(parseISO(c.appointment_date || c.created_at), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black border border-emerald-100 uppercase tracking-widest">Completed</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Symptoms</p>
                          <p className="text-slate-700 text-sm font-medium leading-relaxed">{c.symptoms}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</p>
                          <p className="text-slate-900 text-sm font-bold leading-relaxed">{c.diagnosis}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment Plan</p>
                          <p className="text-slate-700 text-sm font-medium leading-relaxed">{c.treatment_plan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'doctors' && (
              <motion.div 
                key="doctors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medical Staff</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage clinic doctors and specialists</p>
                  </div>
                  <button 
                    onClick={() => setShowAddDoctor(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add New Doctor
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map(doctor => (
                    <div key={doctor.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group text-center">
                      <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto mb-6 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <UserCheck className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h4>
                      <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-6">{doctor.specialization}</p>
                      <div className="pt-6 border-t border-slate-100 flex items-center justify-around">
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">124</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patients</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">4.9</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'billing' && (
              <motion.div 
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Records</h2>
                    <p className="text-slate-500 font-medium mt-1">Track patient billing and payment status</p>
                  </div>
                  <button 
                    onClick={() => setShowAddBilling(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Create Invoice
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billing.map(b => (
                          <tr key={b.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-8 py-5">
                              <span className="font-bold text-slate-900">{b.patient_name}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-lg font-black text-slate-900">${b.amount.toFixed(2)}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                b.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                              )}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-sm text-slate-600 font-medium">{b.payment_method || 'N/A'}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-sm font-semibold text-slate-400">
                                {format(parseISO(b.created_at), 'MMM d, yyyy')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h2>
                    <p className="text-slate-500 font-medium mt-1">Configure clinic parameters and user roles</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                      Clinic Configuration
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinic Name</label>
                        <input type="text" defaultValue="ClinicPro Medical Center" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Email</label>
                        <input type="email" defaultValue="admin@clinicpro.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <Settings className="w-6 h-6 text-blue-600" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setShowAddService(true)} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left group">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-3" />
                        <p className="font-bold text-slate-900">Add Service</p>
                        <p className="text-xs text-slate-500 font-medium">Create new medical service</p>
                      </button>
                      <button onClick={() => setShowAddDoctor(true)} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left group">
                        <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-3" />
                        <p className="font-bold text-slate-900">Add Doctor</p>
                        <p className="text-xs text-slate-500 font-medium">Register new medical staff</p>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPatient(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register New Patient</h3>
                <p className="text-slate-500 font-medium mt-1">Enter patient personal and medical details</p>
              </div>
              <form onSubmit={handleSave} className="p-10 pb-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input name="name" required placeholder="e.g. John Doe" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Age</label>
                    <input name="age" type="number" required placeholder="25" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                    <select name="gender" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium appearance-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Blood Group</label>
                    <select name="blood_group" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium appearance-none">
                      <option value="">Unknown</option>
                      <option>A+</option><option>A-</option>
                      <option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option>
                      <option>O+</option><option>O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Weight (kg)</label>
                    <input name="weight" type="number" step="0.1" placeholder="70.5" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Height (cm)</label>
                    <input name="height" type="number" step="0.1" placeholder="175.0" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contact Number</label>
                    <input name="contact" required placeholder="+1 (555) 000-0000" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Medical History</label>
                    <textarea name="medical_history" rows={3} placeholder="Any allergies, chronic conditions..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddPatient(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Save Patient
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAppointment(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Schedule Appointment</h3>
                <p className="text-slate-500 font-medium mt-1">Book a new session for a patient</p>
              </div>
              <form onSubmit={handleAddAppointment} className="p-10 pb-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Patient</label>
                  <select name="patient_id" required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                    <option value="">Choose a patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Service</label>
                  <select name="service_id" required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                    <option value="">Choose a service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Doctor</label>
                  <select name="doctor_id" required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                    <input name="date" type="date" required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Time</label>
                    <input name="time" type="time" required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddAppointment(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddService(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Service</h3>
                <p className="text-slate-500 font-medium mt-1">Define a new medical service and its cost</p>
              </div>
              <form onSubmit={handleAddService} className="p-10 pb-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Name</label>
                  <input name="name" required placeholder="e.g. Dental Checkup" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price ($)</label>
                  <input name="price" type="number" required placeholder="50" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea name="description" rows={3} placeholder="Brief details about the service..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddService(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Save Service
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPrescription(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Issue Prescription</h3>
                <p className="text-slate-500 font-medium mt-1">Provide medication details for the patient</p>
              </div>
              <form onSubmit={handleAddPrescription} className="p-10 pb-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Medication Name</label>
                  <input name="medication" required placeholder="e.g. Amoxicillin" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dosage</label>
                    <input name="dosage" required placeholder="500mg" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Frequency</label>
                    <input name="frequency" required placeholder="Twice daily" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                  <input name="duration" required placeholder="7 days" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Special Instructions</label>
                  <textarea name="notes" rows={2} placeholder="Take after meals..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddPrescription(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Issue Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDoctor(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Doctor</h3>
                <p className="text-slate-500 font-medium mt-1">Register a new medical specialist</p>
              </div>
              <form onSubmit={handleAddDoctor} className="p-10 pb-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Doctor Name</label>
                  <input name="name" required placeholder="Dr. John Doe" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</label>
                  <input name="specialization" required placeholder="e.g. Cardiologist" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddDoctor(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Add Doctor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddBilling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddBilling(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Invoice</h3>
                <p className="text-slate-500 font-medium mt-1">Generate a new bill for a patient</p>
              </div>
              <form onSubmit={handleAddBilling} className="p-10 pb-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Appointment</label>
                  <select name="appointment_id" defaultValue={selectedAppointment || ""} required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                    <option value="" disabled>Choose an appointment</option>
                    {appointments.map(app => (
                      <option key={app.id} value={app.id}>{app.patient_name} - {app.appointment_date}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount ($)</label>
                  <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                    <select name="status" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="partially_paid">Partially Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</label>
                    <select name="payment_method" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddBilling(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Create Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddConsultation(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Consultation</h3>
                <p className="text-slate-500 font-medium mt-1">Record medical findings and diagnosis</p>
              </div>
              <form onSubmit={handleAddConsultation} className="p-10 pb-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Appointment</label>
                  <select name="appointment_id" defaultValue={selectedAppointment || ""} required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                    <option value="" disabled>Choose an appointment</option>
                    {appointments.map(app => (
                      <option key={app.id} value={app.id}>{app.patient_name} - {app.appointment_date}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Symptoms</label>
                  <textarea name="symptoms" rows={2} required placeholder="Describe patient symptoms..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Diagnosis</label>
                  <textarea name="diagnosis" rows={2} required placeholder="Medical diagnosis..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Treatment Plan</label>
                  <textarea name="treatment_plan" rows={2} required placeholder="Plan and next steps..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddConsultation(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Save Consultation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
