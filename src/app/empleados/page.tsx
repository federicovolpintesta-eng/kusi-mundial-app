'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('kusi_guests_predictions')
        .select('*')
        .eq('guest_info->>dni', formData.dni);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        localStorage.setItem('kusi_existing_predictions', JSON.stringify(data[0].predictions || {}));
        if (data[0].id) {
          localStorage.setItem('kusi_existing_id', data[0].id);
        }
      } else {
        localStorage.removeItem('kusi_existing_predictions');
        localStorage.removeItem('kusi_existing_id');
      }
      
      localStorage.setItem('kusi_guest', JSON.stringify({ ...formData, userType: 'employee' }));
      router.push('/fixture');
    } catch (error) {
      console.error(error);
      alert('Tuvimos un problema verificando tu DNI. Asegúrate de estar conectado a internet.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e74b5] flex flex-col items-center justify-center p-4">
      {/* Background decoration representing the Kusi theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="w-[150%] h-[150%] bg-gradient-to-tr from-[#0e74b5] via-[#218bd0] to-[#51a7e2] absolute -top-1/4 -left-1/4 transform rotate-12 opacity-80"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#0e74b5] mb-2 tracking-tighter">Kusi Mundial</h1>
          <p className="text-slate-500 font-medium">Acceso Empleados - Fixture 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
            <input 
              required
              type="text" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-slate-800"
              placeholder="Ej. Juan"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Apellido</label>
            <input 
              required
              type="text" 
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-slate-800"
              placeholder="Ej. Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">DNI / Pasaporte</label>
            <input 
              required
              type="text" 
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-slate-800"
              placeholder="Número de documento"
            />
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0e74b5] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1"
            >
              {isSubmitting ? 'Verificando...' : 'Comenzar a Jugar (Prode)'}
            </button>
            <button 
              type="button"
              onClick={() => {
                localStorage.setItem('kusi_guest', JSON.stringify({ role: 'viewer' }));
                router.push('/fixture');
              }}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 px-4 rounded-xl shadow-md transition-all transform hover:-translate-y-1"
            >
              Solo Ver Fixture y Resultados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
