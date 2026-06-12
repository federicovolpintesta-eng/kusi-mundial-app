/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useState, useEffect } from 'react';
import data from '../../data.json';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [realResults, setRealResults] = useState<Record<number, { scoreA: string, scoreB: string }>>({});
  const [guests, setGuests] = useState<any[]>([]);
  const [guestToPrint, setGuestToPrint] = useState<any>(null);
  const [printMode, setPrintMode] = useState<'guest' | 'leaderboard'>('guest');
  const [activeTab, setActiveTab] = useState<'guests' | 'employees'>('guests');
  
  const [savedMatches, setSavedMatches] = useState<Record<number, boolean>>({});
  const [unlockedMatches, setUnlockedMatches] = useState<Record<number, boolean>>({});

  const handlePrintGuest = (guest: any) => {
    setPrintMode('guest');
    setGuestToPrint(guest);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handlePrintLeaderboard = () => {
    setPrintMode('leaderboard');
    setTimeout(() => {
      window.print();
    }, 300);
  };
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchAllData = async () => {
      // Fetch Real Results
      const { data: resultsData } = await supabase.from('kusi_real_results').select('*');
      if (resultsData) {
        const results: Record<number, { scoreA: string, scoreB: string }> = {};
        const saved: Record<number, boolean> = {};
        resultsData.forEach(matchData => {
          results[parseInt(matchData.match_id)] = {
            scoreA: matchData.score_a,
            scoreB: matchData.score_b
          };
          if (matchData.score_a !== '' && matchData.score_b !== '') {
            saved[parseInt(matchData.match_id)] = true;
          }
        });
        setRealResults(results);
        setSavedMatches(saved);
      }

      // Fetch Guests Predictions
      const { data: guestsData } = await supabase.from('kusi_guests_predictions').select('*');
      if (guestsData) {
        setGuests(guestsData);
      }
    };
    
    fetchAllData();

    const channelResults = supabase
      .channel('public:kusi_real_results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kusi_real_results' }, fetchAllData)
      .subscribe();

    const channelGuests = supabase
      .channel('public:kusi_guests_predictions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kusi_guests_predictions' }, fetchAllData)
      .subscribe();

    return () => { 
      supabase.removeChannel(channelResults); 
      supabase.removeChannel(channelGuests);
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleScoreChange = (matchId: number, field: string, value: string) => {
    if (value !== '' && !/^[0-9]+$/.test(value)) return;
    setRealResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { scoreA: '', scoreB: '' },
        [field]: value
      }
    }));
  };

  const handleSaveResult = async (matchId: number) => {
    const res = realResults[matchId];
    if (!res || res.scoreA === '' || res.scoreB === '') {
      alert('Por favor completa ambos resultados antes de guardar.');
      return;
    }
    
    try {
      const { error } = await supabase.from('kusi_real_results').upsert([{
        match_id: matchId.toString(),
        score_a: res.scoreA,
        score_b: res.scoreB
      }]);
      if (error) throw error;
      setSavedMatches(prev => ({ ...prev, [matchId]: true }));
      setUnlockedMatches(prev => ({ ...prev, [matchId]: false }));
      alert(`Resultado del partido ${matchId} guardado exitosamente.`);
    } catch (error) {
      console.error(error);
      alert('Error al guardar el resultado.');
    }
  };

  // Calcular la tabla de posiciones dinámicamente
  const allLeaderboard = guests.map(g => {
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
    return { ...g.guest_info, computedPoints: pts, predictions: preds, userType: g.guest_info?.userType || 'guest' };
  }).sort((a, b) => b.computedPoints - a.computedPoints);

  const guestLeaderboard = allLeaderboard.filter(g => g.userType === 'guest');
  const employeeLeaderboard = allLeaderboard.filter(g => g.userType === 'employee');

  const currentLeaderboard = activeTab === 'guests' ? guestLeaderboard : employeeLeaderboard;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">Admin Kusi Mundial</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4 text-slate-800"
            placeholder="Contraseña"
          />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      {/* Elementos ocultos para imprimir */}
      <div 
        id="printable-area"
        className="hidden print:block"
        style={{ width: '100%', maxWidth: '800px', backgroundColor: '#ffffff', padding: '40px', color: '#000', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#0e74b5', fontSize: '32px', fontWeight: 'bold', margin: '0' }}>Kusi Mundial 2026</h1>
          <h2 style={{ fontSize: '24px', margin: '10px 0' }}>
            {printMode === 'guest' && guestToPrint ? `Pronósticos de ${guestToPrint.nombre}` : 'Tabla de Posiciones Oficial'}
          </h2>
        </div>

        {printMode === 'guest' && guestToPrint && (
          <>
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
              <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>Participante:</strong> {guestToPrint.nombre} {guestToPrint.apellido}</p>
              <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>DNI:</strong> {guestToPrint.dni}</p>
              <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>Habitación:</strong> {guestToPrint.habitacion}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0e74b5', color: '#fff' }}>
                  <th style={{ padding: '12px', border: '1px solid #ccc' }}>Fase</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'right' }}>Equipo A</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>Res.</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Equipo B</th>
                  <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {data.matches.map(match => {
                  const pred = guestToPrint.predictions?.[match.id];
                  if (!pred || pred.scoreA === '' || pred.scoreB === '') return null;
                  
                  const teamA = pred.teamA || match.team_a;
                  const teamB = pred.teamB || match.team_b;
                  
                  let ptsWon = '-';
                  const real = realResults[match.id];
                  if (real && real.scoreA !== '' && real.scoreB !== '') {
                    const rA = parseInt(real.scoreA);
                    const rB = parseInt(real.scoreB);
                    const pA = parseInt(pred.scoreA);
                    const pB = parseInt(pred.scoreB);
                    if (rA === pA && rB === pB) {
                      ptsWon = '3';
                    } else {
                      const realDiff = rA - rB;
                      const predDiff = pA - pB;
                      if ((realDiff > 0 && predDiff > 0) || (realDiff < 0 && predDiff < 0) || (realDiff === 0 && predDiff === 0)) {
                        ptsWon = '1';
                      } else {
                        ptsWon = '0';
                      }
                    }
                  }
                  
                  return (
                    <tr key={match.id}>
                      <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>{match.stage.replace('Grupo ', 'G. ')}</td>
                      <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'right', fontWeight: 'bold' }}>{teamA}</td>
                      <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold', color: '#0e74b5' }}>
                        {pred.scoreA} - {pred.scoreB}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>{teamB}</td>
                      <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold', color: ptsWon === '3' ? '#16a34a' : ptsWon === '1' ? '#ca8a04' : '#ef4444' }}>
                        {ptsWon}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {printMode === 'leaderboard' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0e74b5', color: '#fff' }}>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center', width: '50px' }}>Pos.</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Participante</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>DNI</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>Habitación</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {currentLeaderboard.map((guest, idx) => (
                <tr key={guest.dni}>
                  <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}°</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>{guest.nombre} {guest.apellido}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>{guest.dni}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>{guest.habitacion || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold', color: '#0e74b5' }}>{guest.computedPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center', color: '#64748b' }}>
          <p>Generado automáticamente por la App Kusi Mundial.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto print:hidden">
        <div className="flex justify-center mb-6">
          <img src="/kusi-header.png" alt="Kusi Mundial Header" className="w-full max-w-lg object-contain" />
        </div>
        <h1 className="text-3xl font-black mb-8 text-center text-blue-900">Panel de Administración de Resultados</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Lado Izquierdo: Carga de Resultados */}
          <div className="xl:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Partidos del Fixture</h2>
            <div className="space-y-4">
              {data.matches.map(match => {
                const isSaved = savedMatches[match.id];
                const isUnlocked = unlockedMatches[match.id];
                const isLocked = isSaved && !isUnlocked;

                return (
                <div key={match.id} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row items-center gap-4 transition-all ${isLocked ? 'border-slate-200 opacity-90 bg-slate-50' : 'border-blue-300 ring-2 ring-blue-50'}`}>
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-xs text-slate-500 font-bold mb-1 uppercase flex items-center justify-center md:justify-start gap-2">
                      {isLocked && (
                        <span className="text-slate-400" title="Partido Bloqueado">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        </span>
                      )}
                      {match.stage} - Partido {match.id}
                    </div>
                    <div className="text-lg font-black uppercase text-slate-800">{match.team_a} vs {match.team_b}</div>
                    <div className="text-xs text-slate-400 mt-1">{match.date_placeholder}</div>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${isLocked ? 'opacity-70 pointer-events-none' : ''}`}>
                    <input
                      type="text" inputMode="numeric" maxLength={2}
                      disabled={isLocked}
                      value={realResults[match.id]?.scoreA || ''}
                      onChange={e => handleScoreChange(match.id, 'scoreA', e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none disabled:bg-slate-200"
                      placeholder="-"
                    />
                    <span className="font-bold text-slate-400">-</span>
                    <input
                      type="text" inputMode="numeric" maxLength={2}
                      disabled={isLocked}
                      value={realResults[match.id]?.scoreB || ''}
                      onChange={e => handleScoreChange(match.id, 'scoreB', e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-blue-500 outline-none disabled:bg-slate-200"
                      placeholder="-"
                    />
                  </div>

                  {isLocked ? (
                    <button
                      onClick={() => setUnlockedMatches(prev => ({ ...prev, [match.id]: true }))}
                      className="w-full md:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                      Editar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveResult(match.id)}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2 shadow-md shadow-green-600/20"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              )})}
            </div>
          </div>

          {/* Lado Derecho: Leaderboard */}
          <div className="xl:col-span-1 order-first xl:order-last">
            <div className="sticky top-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl font-black mb-1 text-blue-900 leading-tight">Tabla de Posiciones</h2>
                </div>
                <button 
                  onClick={handlePrintLeaderboard}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
                  title="Imprimir Tabla Completa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Imprimir
                </button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  onClick={() => setActiveTab('guests')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'guests' ? 'bg-white text-blue-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Huéspedes
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'employees' ? 'bg-white text-blue-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Empleados
                </button>
              </div>
              
              {currentLeaderboard.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  Nadie ha participado aún.
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto pr-1 py-4 custom-scrollbar">
                  {currentLeaderboard.map((guest, idx) => (
                    <div key={guest.dni} className="flex items-center gap-2 bg-slate-50 py-3 px-2 md:py-4 md:px-3 rounded-xl border border-slate-100 relative overflow-hidden mr-3 shrink-0">
                      {idx === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>}
                      {idx === 1 && <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>}
                      {idx === 2 && <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>}
                      
                      <div className="flex-shrink-0 w-5 md:w-6 text-center font-black text-slate-400 text-xs md:text-base ml-1">
                        {idx + 1}°
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-xs md:text-sm uppercase truncate">
                          {guest.nombre} {guest.apellido}
                        </div>
                        <div className="text-[10px] md:text-xs text-slate-500 font-medium truncate">
                          DNI: {guest.dni} {guest.habitacion && `| Hab: ${guest.habitacion}`}
                        </div>
                      </div>
                      <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-black px-2 py-1 md:px-3 rounded-lg text-xs md:text-sm whitespace-nowrap">
                        {guest.computedPoints} pts
                      </div>
                      <button 
                        onClick={() => handlePrintGuest(guest)} 
                        className="flex-shrink-0 text-slate-500 hover:text-blue-600 transition-colors bg-white p-1.5 md:p-2 rounded-full shadow-sm border border-slate-200"
                        title="Imprimir Fixture"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
