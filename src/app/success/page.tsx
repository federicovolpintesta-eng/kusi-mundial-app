/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import data from '../../data.json';

export default function Success() {
  const [predictionsData, setPredictionsData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kusi_my_predictions');
    if (saved) {
      setPredictionsData(JSON.parse(saved));
    }
  }, []);

  const handlePrint = () => {
    if (!predictionsData) {
      alert('No se encontraron predicciones guardadas.');
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0e74b5] flex flex-col items-center justify-center p-4">
      
      {/* Elemento oculto para imprimir */}
      {predictionsData && (
        <div 
          id="printable-area"
          style={{ width: '100%', maxWidth: '800px', backgroundColor: '#ffffff', padding: '40px', color: '#000', margin: '0 auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#0e74b5', fontSize: '32px', fontWeight: 'bold', margin: '0' }}>Kusi Mundial 2026</h1>
            <h2 style={{ fontSize: '24px', margin: '10px 0' }}>Mis Pronósticos</h2>
          </div>
          
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
            <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>Participante:</strong> {predictionsData.guest.nombre} {predictionsData.guest.apellido}</p>
            <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>DNI:</strong> {predictionsData.guest.dni}</p>
            <p style={{ margin: '5px 0', fontSize: '18px' }}><strong>Habitación:</strong> {predictionsData.guest.habitacion}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#0e74b5', color: '#fff' }}>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>Fase</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'right' }}>Equipo A</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'center' }}>Res.</th>
                <th style={{ padding: '12px', border: '1px solid #ccc', textAlign: 'left' }}>Equipo B</th>
              </tr>
            </thead>
            <tbody>
              {data.matches.map(match => {
                const pred = predictionsData.predictions[match.id];
                if (!pred || pred.scoreA === '' || pred.scoreB === '') return null;
                
                const teamA = pred.teamA || match.team_a;
                const teamB = pred.teamB || match.team_b;
                
                return (
                  <tr key={match.id}>
                    <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>{match.stage.replace('Grupo ', 'G. ')}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'right', fontWeight: 'bold' }}>{teamA}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold', color: '#0e74b5' }}>
                      {pred.scoreA} - {pred.scoreB}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>{teamB}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '40px', textAlign: 'center', color: '#64748b' }}>
            <p>Generado automáticamente por la App Kusi Mundial.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-10 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
        
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-3">¡Pronósticos Guardados!</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Tus predicciones han sido registradas en nuestra base de datos. ¡Mucha suerte y que ganes muchos puntos!
        </p>

        <div className="flex flex-col gap-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="w-full bg-[#1f3b60] text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-900 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Descargar mi Fixture en PDF
          </button>
          
          <Link href="/" className="w-full bg-slate-100 text-slate-600 font-bold px-8 py-4 rounded-xl hover:bg-slate-200 transition-colors">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
