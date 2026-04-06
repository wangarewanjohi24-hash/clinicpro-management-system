import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import {
  Users, Activity, Stethoscope, Pill, History, UserCheck,
  ClipboardList, CreditCard, ShieldCheck, LayoutDashboard,
  Plus, Search, Settings, LogOut, TrendingUp
} from 'lucide-react'; // Fixed: Combined into one clean import block

type View = 'dashboard' | 'patients' | 'appointments' | 'services' | 'prescriptions' | 'billing' | 'doctors' | 'consultations' | 'admin';

type Patient = {
  id: string;
  name: string;
  contact: string;
};

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE =  window.location.hostname ==='localhost'
  ?'http://localhost:3000'
   : 'https://clinipro-management-system-3.onrender.com/graphql';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/patients`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setShowAddPatient(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

    const filteredPatients = patients.filter((p: Patient) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact.includes(searchQuery)
    );
  
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <main className="flex-1 flex flex-col">
          <header className="h-20 bg-white border-b flex items-center justify-between px-10">
            <h1 className="text-2xl font-bold capitalize">{view}</h1>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none"
              />
            </div>
          </header>
  
          <div className="p-10">
            {view === 'patients' && (
              <>
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Patient
                </button>
  
                <div className="grid gap-4">
                  {filteredPatients.map((patient: Patient) => (
                    <div key={patient.id} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                      <p className="font-bold">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.contact}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
  
            {showAddPatient && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <form onSubmit={handleSavePatient} className="bg-white p-8 rounded-2xl w-96">
                  <h2 className="text-xl font-bold mb-4">New Patient</h2>
                  <input name="name" placeholder="Full Name" required className="w-full mb-3 p-2 border rounded" />
                  <input name="contact" placeholder="Phone Number" required className="w-full mb-4 p-2 border rounded" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
                    <button type="button" onClick={() => setShowAddPatient(false)} className="flex-1 bg-slate-100 py-2 rounded">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
