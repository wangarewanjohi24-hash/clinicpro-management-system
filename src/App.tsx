
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Stethoscope, Pill, History, UserCheck, 
  ClipboardList, CreditCard, ShieldCheck, LayoutDashboard, 
  Plus, Search, Settings, LogOut, TrendingUp 
} from 'lucide-react';
import { ApolloClient, InMemoryCache, gql, ApolloProvider, useQuery } from '@apollo/client';

// Define the GraphQL "Phone Number"
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/graphql'
  : 'https://clinicpro-management-system-3.onrender.com/graphql';
const client = new ApolloClient({
  uri: API_BASE, // Ensure API_BASE is the string URL defined above
  cache: new InMemoryCache(),
});

// Define the data we want to fetch
const GET_PATIENTS = gql`
  query GetPatients {
    patients {
      id
      name
      contact
      age
      gender
      status
    }
  }
`;
// --- END OF NEW SETUP BLOCK ---

// Your existing 'type View' and 'type Patient' definitions follow below...
type View = 'dashboard' | 'patients' | 'appointments' | 'services' | 'prescriptions' | 'billing' | 'doctors' | 'consultations' | 'admin';

type Patient = {
  id: string;
  name: string;
  contact: string;
  age: number;
  gender: string;
  status: string;

};

type GetPatientsResponse = {
  patients: Patient[];
};
function AppContent() {
   // 1. Define missing state
  const [view, setView] = useState<'dashboard' | 'patients'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);

  // 2. Fetch data using your new query
  const { loading, error, data } = useQuery(GET_PATIENTS);

  // 3. Handle loading and error states
  if (loading) return <div className="flex h-screen items-center justify-center"><p>Loading Clinic Data...</p></div>;
  if (error) return <div className="flex h-screen items-center justify-center"><p className="text-red-500">Error: {error.message}</p></div>;

  // 4. Extract and filter patients
  const patients = data?.patients || [];
  const filteredPatients = patients.filter((patient: any) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <header className="h-20 bg-white border-b flex items-center justify-between px-10 w-full">
        <h1 className="text-2xl font-bold capitalize">{view}</h1>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none w-64"
          />
        </div>
      </header>

      <main className="p-10 w-full">
        {view === 'patients' && (
          <>
            <button
              onClick={() => setShowAddPatient(true)}
              className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Patient
            </button>

            <div className="grid gap-4">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient: any) => (
                  <div key={patient.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="font-bold text-gray-800">{patient.name}</p>
                    <p className="text-sm text-slate-500">{patient.contact}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No patients found matching "{searchQuery}"</p>
              )}
            </div>
          </>
        )}
        
        {view === 'dashboard' && (
          <div className="text-gray-600">
            <p>Welcome to the Clinic Management System. Select "Patients" to manage records.</p>
          </div>
        )}
      </main>
    </div>
  );
}
export default function App() {
  const [view, setView] = useState<View>('dashboard');
  
  // This one line replaces all the code you just deleted!
  const { loading, error, data } = useQuery(GET_PATIENTS);

  if (loading) return <p>Loading Clinic Data...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const patients = data?.patients || [];

  return (
    <ApolloProvider client={client}>
      <AppContent />
    </ApolloProvider>
  );
}
