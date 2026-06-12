/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function LiveLeaderboard() {
  const [realResults, setRealResults] = useState<Record<number, { scoreA: string, scoreB: string }>>({});
  const [guests, setGuests] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch Real Results
      const { data: resultsData } = await supabase.from('kusi_real_results').select('*');
      if (resultsData) {
        const results: Record<number, { scoreA: string, scoreB: string }> = {};
        resultsData.forEach(matchData => {
          results[parseInt(matchData.match_id)] = {
            scoreA: matchData.score_a,
            scoreB: matchData.score_b
          };
        });
        setRealResults(results);
      }

      // Fetch Guests Predictions
      const { data: guestsData } = await supabase.from('kusi_guests_predictions').select('*');
      if (guestsData) {
        setGuests(guestsData);
      }
    };
    
    fetchAllData();

    const channelResults = supabase
      .channel('public:kusi_real_results_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kusi_real_results' }, fetchAllData)
      .subscribe();

    const channelGuests = supabase
      .channel('public:kusi_guests_predictions_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kusi_guests_predictions' }, fetchAllData)
      .subscribe();

    return () => { 
      supabase.removeChannel(channelResults); 
      supabase.removeChannel(channelGuests);
    };
  }, []);

  const leaderboard = guests.filter(g => g.guest_info?.userType !== 'employee').map(g => {
    let pts = 0;
    const preds = g.predictions || {};
    
    Object.keys(realResults).forEach(matchIdStr => {
      const matchId = parseInt(matchIdStr);
      const real = realResults[matchId];
      const pred = preds[matchId];
      
      if (real && real.scoreA !== '' && real.scoreB !== '' && pred && pred.scoreA !== '' && pred.scoreB !== '') {
        const rA = parseInt(real.scoreA);
        const rB = parseInt(real.scoreB);
        const pA = parseInt(pred.scoreA);
        const pB = parseInt(pred.scoreB);
        
        if (rA === pA && rB === pB) {
          pts += 3;
        } else {
          const realDiff = rA - rB;
          const predDiff = pA - pB;
          if ((realDiff > 0 && predDiff > 0) || (realDiff < 0 && predDiff < 0) || (realDiff === 0 && predDiff === 0)) {
            pts += 1;
          }
        }
      }
    });
    return { ...g.guest_info, computedPoints: pts };
  }).sort((a, b) => b.computedPoints - a.computedPoints);

  return (
    <div 
      className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center p-4 md:p-8 font-sans"
      style={{ backgroundImage: 'url("/kusi-header.png")' }}
    >
      {/* Dark overlay to make the table pop and readable */}
      <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-0"></div>

      {/* Main Table Container */}
      <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/40 flex flex-col" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="bg-[#1f3b60] p-6 text-center shadow-md relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-wider relative z-10 uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
            Tabla de Posiciones
          </h1>
          <p className="text-blue-200 mt-2 font-bold text-lg relative z-10 uppercase tracking-[0.2em]">En Vivo</p>
        </div>
        
        {/* Table Content */}
        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          {leaderboard.length === 0 ? (
            <div className="text-center text-slate-500 py-16 text-2xl font-bold">
              Esperando participantes...
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {leaderboard.map((guest, idx) => (
                <div key={guest.dni} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden shrink-0">
                  {idx === 0 && <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>}
                  {idx === 1 && <div className="absolute top-0 left-0 w-2 h-full bg-slate-300"></div>}
                  {idx === 2 && <div className="absolute top-0 left-0 w-2 h-full bg-orange-400"></div>}
                  
                  <div className={`flex-shrink-0 w-12 md:w-16 text-center font-black text-2xl md:text-3xl ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-500' : 'text-slate-300'}`}>
                    {idx + 1}°
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg md:text-xl text-slate-800 uppercase truncate">
                      {guest.nombre} {guest.apellido}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Habitación: <span className="text-slate-700 font-bold">{guest.habitacion}</span>
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 bg-[#0e74b5] text-white font-black px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-inner text-xl md:text-2xl text-center border-b-4 border-blue-900">
                    {guest.computedPoints} <span className="text-sm opacity-80 font-bold">pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-[#1f3b60] p-4 flex justify-center shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
          <img src="/kusi-footer.png" alt="Kusi Mundial Footer" className="h-16 md:h-20 object-contain rounded-lg shadow-md" />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
