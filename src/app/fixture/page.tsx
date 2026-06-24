/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import data from '../../data.json';
import { supabase } from '../lib/supabase';
import RulesModal from './RulesModal';

type Prediction = {
  teamA?: string;
  teamB?: string;
  scoreA: string;
  scoreB: string;
};

const parseMatchDate = (dateStr: string): Date | null => {
  try {
    let day = 1;
    let month = 5;
    let hours = 0;
    let minutes = 0;

    dateStr = dateStr.replace(' hs', '').trim();
    const parts = dateStr.split(' - ');
    if (parts.length !== 2) return null;

    const datePart = parts[0].trim();
    const timePart = parts[1].trim();

    if (timePart.includes('.')) {
      const [h, m] = timePart.split('.');
      hours = parseInt(h);
      minutes = parseInt(m);
    } else if (timePart.includes(':')) {
      const [h, m] = timePart.split(':');
      hours = parseInt(h);
      minutes = parseInt(m);
    } else {
      hours = parseInt(timePart);
    }

    if (datePart.includes('/')) {
      const [d, m] = datePart.split('/');
      day = parseInt(d);
      month = parseInt(m) - 1;
    } else {
      const matchRegex = datePart.match(/(\d+)\s+de\s+(junio|julio)/i);
      if (matchRegex) {
        day = parseInt(matchRegex[1]);
        month = matchRegex[2].toLowerCase() === 'junio' ? 5 : 6;
      } else {
        const dParts = datePart.split(' ');
        day = parseInt(dParts[1]);
        const mStr = dParts[3]?.toLowerCase();
        if (mStr === 'junio') month = 5;
        else if (mStr === 'julio') month = 6;
      }
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const isoString = `2026-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00-03:00`;
    return new Date(isoString);
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
    return null;
  }
};

const checkMatchLocked = (match: any, realResults: any) => {
  if (realResults[match.id] && realResults[match.id].scoreA !== '' && realResults[match.id].scoreB !== '') {
    return true;
  }
  const matchDate = parseMatchDate(match.date_placeholder);
  if (!matchDate) return false;
  
  const limitTime = new Date(matchDate.getTime() - 30 * 60000);
  return new Date() >= limitTime;
};

export default function Fixture() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realResults, setRealResults] = useState<Record<number, { scoreA: string, scoreB: string }>>({});
  const [isViewer, setIsViewer] = useState(false);
  const [userType, setUserType] = useState<'guest' | 'employee' | 'viewer'>('guest');
  const [points, setPoints] = useState<Record<number, number>>({});
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const guestStr = localStorage.getItem('kusi_guest');
    if (!guestStr) {
      router.push('/');
    } else {
      const guest = JSON.parse(guestStr);
      if (guest.role === 'viewer') {
        setIsViewer(true);
        setUserType('viewer');
      } else if (guest.userType) {
        setUserType(guest.userType);
      }
    }

    const existingPredsStr = localStorage.getItem('kusi_existing_predictions');
    if (existingPredsStr) {
      try {
        setPredictions(JSON.parse(existingPredsStr));
      } catch (e) {}
    }

    const fetchResults = async () => {
      const { data } = await supabase.from('kusi_real_results').select('*');
      if (data) {
        const results: Record<number, { scoreA: string, scoreB: string }> = {};
        data.forEach(matchData => {
          results[parseInt(matchData.match_id)] = {
            scoreA: matchData.score_a,
            scoreB: matchData.score_b
          };
        });
        setRealResults(results);
      }
    };
    fetchResults();

    const channel = supabase
      .channel('public:kusi_real_results')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kusi_real_results' }, fetchResults)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  useEffect(() => {
    if (isViewer) return;
    
    let newPoints: Record<number, number> = {};
    Object.keys(predictions).forEach((key) => {
      const matchId = parseInt(key);
      const pred = predictions[matchId];
      const real = realResults[matchId];
      
      if (real && pred.scoreA !== '' && pred.scoreB !== '') {
        const pA = parseInt(pred.scoreA);
        const pB = parseInt(pred.scoreB);
        const rA = parseInt(real.scoreA);
        const rB = parseInt(real.scoreB);
        
        let pts = 0;
        if (pA === rA && pB === rB) {
          pts = 3;
        } else {
          const predDiff = pA - pB;
          const realDiff = rA - rB;
          if ((predDiff > 0 && realDiff > 0) || (predDiff < 0 && realDiff < 0) || (predDiff === 0 && realDiff === 0)) {
            pts = 1;
          }
        }
        newPoints[matchId] = pts;
      }
    });
    setPoints(newPoints);
  }, [predictions, realResults, isViewer]);

  const handleScoreChange = (matchId: number, field: keyof Prediction, value: string) => {
    if (isViewer) return;
    
    const match = data.matches.find(m => m.id === matchId);
    if (!match) return;
    const isMatchLocked = checkMatchLocked(match, realResults);
    if (isMatchLocked) return;

    if ((field === 'scoreA' || field === 'scoreB') && value !== '' && !/^[0-9]+$/.test(value)) return;
    
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { scoreA: '', scoreB: '' },
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    const existingId = localStorage.getItem('kusi_existing_id');
    setIsSubmitting(true);
    const guest = JSON.parse(localStorage.getItem('kusi_guest') || '{}');

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_info: guest,
          predictions,
          existingId
        })
      });

      const resultData = await response.json();
      
      if (!response.ok) {
        throw new Error(resultData.error || 'Error al guardar pronósticos');
      }
      
      // Guardamos en local para poder descargar el PDF
      localStorage.setItem('kusi_my_predictions', JSON.stringify({ guest, predictions: resultData.predictions }));
      
      alert(`¡Pronósticos guardados exitosamente! Tienes ${resultData.totalPoints} puntos acumulados.`);
      localStorage.removeItem('kusi_guest');
      localStorage.removeItem('kusi_existing_predictions');
      localStorage.removeItem('kusi_existing_id');
      router.push('/success');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Tuvimos un error al guardar. Asegúrate de estar conectado a internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchesByStage: Record<string, typeof data.matches> = {};
  data.matches.forEach(match => {
    if (!matchesByStage[match.stage]) {
      matchesByStage[match.stage] = [];
    }
    matchesByStage[match.stage].push(match);
  });

  const getFlagUrl = (team: string) => {
    const isoMap: Record<string, string> = {
      "MEXICO": "mx", "SUDAFRICA": "za", "REP. DE COREA": "kr", "REP CHECA": "cz",
      "CANADA": "ca", "BOSNIA HERZEGOVINA": "ba", "CATAR": "qa", "SUIZA": "ch",
      "BRASIL": "br", "MARRUECOS": "ma", "HAITI": "ht", "ESCOCIA": "gb-sct",
      "ESTADOS UNIDOS": "us", "PARAGUAY": "py", "AUSTRALIA": "au", "TURQUIA": "tr",
      "ALEMANIA": "de", "CURAZAO": "cw", "COSTA DE MARFIL": "ie", "ECUADOR": "ec",
      "PAISES BAJOS": "nl", "JAPON": "jp", "SUECIA": "se", "TUNEZ": "tn",
      "BELGICA": "be", "EGIPTO": "eg", "IRAN": "ir", "NUEVA ZELANDA": "nz",
      "ESPAÑA": "es", "CABO VERDE": "cv", "ARABIA SAUDI": "sa", "URUGUAY": "uy",
      "FRANCIA": "fr", "SENEGAL": "sn", "IRAK": "iq", "NORUEGA": "no",
      "ARGENTINA": "ar", "ARGELIA": "dz", "AUSTRIA": "at", "JORDANIA": "jo",
      "PORTUGAL": "pt", "CONGO": "cd", "UZBEKISTAN": "uz", "COLOMBIA": "co",
      "INGLATERRA": "gb-eng", "CROACIA": "hr", "GHANA": "gh", "PANAMA": "pa"
    };
    if (isoMap[team]) return `https://flagcdn.com/w40/${isoMap[team]}.png`;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-32 font-sans">
      <RulesModal 
        isOpen={isRulesModalOpen} 
        onClose={() => setIsRulesModalOpen(false)} 
        userType={userType} 
      />

      <div className="w-full max-w-[1000px] mx-auto relative">
        <img src="/kusi-header.png" alt="Kusi Mundial Header" className="w-full h-auto" />
        <button 
          onClick={() => setIsRulesModalOpen(true)}
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/90 hover:bg-white text-[#0e74b5] font-bold py-2 px-4 rounded-full shadow-lg text-sm md:text-base border-2 border-[#0e74b5] transition-transform transform hover:scale-105 backdrop-blur-sm z-10"
        >
          📖 Cómo Jugar
        </button>
      </div>

      <div className="max-w-[1000px] mx-auto px-2 md:px-4 space-y-6 mt-4">
        {Object.entries(matchesByStage).map(([stage, matches]) => {
          const isGroup = stage.startsWith('Grupo');
          const uniqueTeams = Array.from(new Set(matches.flatMap(m => [m.team_a, m.team_b])));
          
          let headerColor = "bg-[#f5f5f5] text-black";
          let textColor = "text-slate-800";
          if (isGroup) {
            headerColor = "bg-transparent";
          } else if (stage === 'Dieciseisavos de Final') {
            headerColor = "bg-[#ffe58f]";
          } else if (stage === 'Octavos de Final') {
            headerColor = "bg-[#bfe1e6]";
          } else if (stage === 'Cuartos de Final') {
            headerColor = "bg-[#dced7b]";
          } else if (stage === 'Semifinal') {
            headerColor = "bg-[#e89b53]";
          } else if (stage === 'Tercer Puesto') {
            headerColor = "bg-[#cce5ee]";
          } else if (stage === 'Final' || stage === 'FINAL DEL CAMPEONATO') {
            headerColor = "bg-[#e8a353]";
          }

          if (isGroup) {
            return (
              <div key={stage} className="w-full mb-8">
                <div className="flex items-center justify-center gap-4 md:gap-8 mb-2">
                  <div className="flex gap-2">
                    {getFlagUrl(uniqueTeams[0]) && <img src={getFlagUrl(uniqueTeams[0])!} alt="" className="w-8 border border-slate-200" />}
                    {getFlagUrl(uniqueTeams[2]) && <img src={getFlagUrl(uniqueTeams[2])!} alt="" className="w-8 border border-slate-200" />}
                  </div>
                  <span className="text-xl md:text-2xl font-black tracking-wider uppercase text-slate-900">{stage}</span>
                  <div className="flex gap-2">
                    {getFlagUrl(uniqueTeams[1]) && <img src={getFlagUrl(uniqueTeams[1])!} alt="" className="w-8 border border-slate-200" />}
                    {getFlagUrl(uniqueTeams[3]) && <img src={getFlagUrl(uniqueTeams[3])!} alt="" className="w-8 border border-slate-200" />}
                  </div>
                </div>
                
                <div className="border-t-[2px] border-[#1ca3d3]">
                  {matches.map((match, idx) => {
                    const isMatchLocked = checkMatchLocked(match, realResults);
                    const isMatchFinished = realResults[match.id] && realResults[match.id].scoreA !== '' && realResults[match.id].scoreB !== '';
                    return (
                    <div key={match.id} className="flex flex-col border-b-[2px] border-[#1ca3d3] bg-white">
                      {isMatchFinished && <div className="bg-slate-200 text-slate-500 text-[10px] font-bold text-center py-0.5">FINALIZADO</div>}
                      <div className="flex flex-row items-center">
                        <div className="w-[30%] md:w-[25%] px-1 py-3 flex items-center justify-start">
                          <p className="text-[9px] md:text-xs leading-tight text-slate-800 font-medium">
                            {match.date_placeholder}<br/>
                            {match.stadium_placeholder}
                          </p>
                        </div>
                        
                        <div className={`w-[70%] md:w-[75%] px-2 py-3 flex flex-row items-center justify-center ${isMatchLocked ? 'opacity-60' : ''}`}>
                          <div className="flex-1 flex justify-end items-center pr-2 md:pr-4">
                            <span className="font-black text-slate-900 text-sm md:text-xl text-right uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif', transform: 'scaleY(1.1)' }}>
                              {match.team_a}
                            </span>
                          </div>

                          <div className="flex items-center mx-1 shrink-0">
                            <input
                              type="text" inputMode="numeric" maxLength={2}
                              disabled={isViewer || isMatchLocked}
                              value={isMatchFinished ? realResults[match.id].scoreA : (predictions[match.id]?.scoreA || '')}
                              onChange={(e) => handleScoreChange(match.id, 'scoreA', e.target.value)}
                              className={`w-8 h-8 md:w-10 md:h-10 text-center text-lg md:text-xl font-bold border-[2px] border-[#1ca3d3] rounded-md text-slate-900 focus:outline-none ${isViewer || isMatchLocked ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                              placeholder="-"
                            />
                            <span className="text-slate-900 font-bold text-[10px] md:text-sm mx-1 uppercase">VS.</span>
                            <input
                              type="text" inputMode="numeric" maxLength={2}
                              disabled={isViewer || isMatchLocked}
                              value={isMatchFinished ? realResults[match.id].scoreB : (predictions[match.id]?.scoreB || '')}
                              onChange={(e) => handleScoreChange(match.id, 'scoreB', e.target.value)}
                              className={`w-8 h-8 md:w-10 md:h-10 text-center text-lg md:text-xl font-bold border-[2px] border-[#1ca3d3] rounded-md text-slate-900 focus:outline-none ${isViewer || isMatchLocked ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                              placeholder="-"
                            />
                          </div>

                          <div className="flex-1 flex justify-start items-center pl-2 md:pl-4">
                            <span className="font-black text-slate-900 text-sm md:text-xl text-left uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif', transform: 'scaleY(1.1)' }}>
                              {match.team_b}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {isMatchFinished && (
                        <div className="w-full text-center bg-blue-50 py-1 text-xs md:text-sm font-bold text-slate-700 border-t border-blue-100">
                          FINALIZADO
                          {!isViewer && <span className="ml-2 text-green-600 bg-green-100 border border-green-300 rounded px-2">+{points[match.id] || 0} pts</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
          } else {
            return (
              <div key={stage} className="w-full mb-8">
                <div className={`py-2 px-4 text-center ${headerColor} mb-2`}>
                  <span className={`text-lg md:text-xl font-black tracking-widest uppercase ${textColor}`}>{stage}</span>
                </div>
                
                <div className="space-y-1">
                  {matches.map(match => {
                    const isMatchLocked = checkMatchLocked(match, realResults);
                    const isMatchFinished = realResults[match.id] && realResults[match.id].scoreA !== '' && realResults[match.id].scoreB !== '';
                    return (
                    <div key={match.id} className="w-full flex flex-col bg-white border-b border-slate-200">
                      {isMatchFinished && <div className="bg-slate-200 text-slate-500 text-[10px] font-bold text-center py-0.5">FINALIZADO</div>}
                      <div className="flex justify-between items-end px-1 pb-1 pt-1">
                        <span className="text-[10px] md:text-xs font-bold text-slate-800 w-1/3 text-left uppercase">{match.team_a}</span>
                        <span className="text-[8px] md:text-[10px] text-slate-600 w-1/3 text-center leading-tight">Partido {match.id} - {match.date_placeholder} - {match.stadium_placeholder}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-800 w-1/3 text-right uppercase">{match.team_b}</span>
                      </div>
                      
                      <div className={`flex justify-between items-center bg-white mb-1 ${isMatchLocked ? 'opacity-60' : ''}`}>
                        <input
                          type="text"
                          disabled={isViewer || isMatchLocked}
                          value={predictions[match.id]?.teamA || ''}
                          onChange={(e) => handleScoreChange(match.id, 'teamA', e.target.value)}
                          className={`w-[38%] h-8 md:h-10 border border-[#1ca3d3] rounded-md px-2 font-bold text-slate-800 text-sm focus:outline-none uppercase ${isViewer || isMatchLocked ? 'bg-slate-100 text-slate-500' : 'bg-[#e3f2fd]'}`}
                          placeholder=""
                        />
                        <div className="flex items-center gap-1 mx-1">
                          <input
                            type="text" inputMode="numeric" maxLength={2}
                            disabled={isViewer || isMatchLocked}
                            value={isMatchFinished ? realResults[match.id].scoreA : (predictions[match.id]?.scoreA || '')}
                            onChange={(e) => handleScoreChange(match.id, 'scoreA', e.target.value)}
                            className={`w-7 h-8 md:w-9 md:h-10 border border-[#1ca3d3] rounded-md text-center font-bold text-lg focus:outline-none ${isViewer || isMatchLocked ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-800'}`}
                            placeholder="-"
                          />
                          <span className="font-bold text-slate-400">-</span>
                          <input
                            type="text" inputMode="numeric" maxLength={2}
                            disabled={isViewer || isMatchLocked}
                            value={isMatchFinished ? realResults[match.id].scoreB : (predictions[match.id]?.scoreB || '')}
                            onChange={(e) => handleScoreChange(match.id, 'scoreB', e.target.value)}
                            className={`w-7 h-8 md:w-9 md:h-10 border border-[#1ca3d3] rounded-md text-center font-bold text-lg focus:outline-none ${isViewer || isMatchLocked ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-800'}`}
                            placeholder="-"
                          />
                        </div>
                        <input
                          type="text"
                          disabled={isViewer || isMatchLocked}
                          value={predictions[match.id]?.teamB || ''}
                          onChange={(e) => handleScoreChange(match.id, 'teamB', e.target.value)}
                          className={`w-[38%] h-8 md:h-10 border border-[#1ca3d3] rounded-md px-2 font-bold text-slate-800 text-sm focus:outline-none text-right uppercase ${isViewer || isMatchLocked ? 'bg-slate-100 text-slate-500' : 'bg-[#e3f2fd]'}`}
                          placeholder=""
                        />
                      </div>

                      {isMatchFinished && (
                        <div className="w-full text-center bg-blue-50 py-1 text-xs md:text-sm font-bold text-slate-700 border-t border-blue-100">
                          FINALIZADO
                          {!isViewer && <span className="ml-2 text-green-600 bg-green-100 border border-green-300 rounded px-2">+{points[match.id] || 0} pts</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
          }
        })}
      </div>

      <div className="w-full mt-12 mb-32 flex justify-center max-w-[1000px] mx-auto">
        <img src="/kusi-footer.png" alt="Kusi Mundial Footer" className="w-full h-auto" />
      </div>

      {!isViewer && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent z-50">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-2xl mx-auto block bg-gradient-to-r from-[#1f3b60] to-[#0e74b5] hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white font-black text-lg py-4 px-6 rounded-xl shadow-2xl transition-transform transform active:scale-95 border-b-4 border-blue-900"
          >
            {isSubmitting ? 'Guardando...' : 'GUARDAR MIS PRONÓSTICOS'}
          </button>
        </div>
      )}
    </div>
  );
}
