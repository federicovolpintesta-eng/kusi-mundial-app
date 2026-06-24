import React from 'react';

type RulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userType: 'guest' | 'employee' | 'viewer';
};

export default function RulesModal({ isOpen, onClose, userType }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-colors z-10"
        >
          ✕
        </button>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-[#0e74b5] tracking-tight">Kusi Mundial 2026</h2>
            <p className="text-slate-500 font-medium mt-1">Cómo jugar al Prode</p>
          </div>

          <div className="space-y-6 text-slate-700">
            {userType === 'guest' || userType === 'viewer' ? (
              <p>Participa de nuestro gran Prode Kusi Mundial durante tu estadía. Pronostica los resultados de los partidos y suma puntos para escalar en la tabla de posiciones oficial. ¡Demuestra que eres el que más sabe de fútbol y gana increíbles premios!</p>
            ) : (
              <p>Hemos preparado un fixture exclusivo y separado para que todo el equipo del hotel también pueda competir durante el Kusi Mundial 2026. ¡Suma puntos y mira la tabla de posiciones del Staff!</p>
            )}

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 border-b pb-2">Sistema de Puntuación</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded mr-3 shrink-0">3 Pts</span>
                  <p><strong>Resultado Exacto:</strong> Si pronosticaste que Argentina gana 2-0 y el partido termina exactamente 2-0.</p>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded mr-3 shrink-0">1 Pto</span>
                  <p><strong>Acertar Ganador o Empate:</strong> Si pronosticaste que Argentina ganaba 2-0, pero el partido termina 3-1. (Acertaste quién ganó, pero no los goles exactos).</p>
                </li>
                <li className="flex items-start">
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded mr-3 shrink-0">0 Pts</span>
                  <p><strong>Fallo:</strong> Si el resultado es totalmente distinto a tu pronóstico.</p>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 border-b pb-2">Reglas Importantes</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Puedes cambiar tus pronósticos en cualquier momento, pero <strong>los partidos se bloquean automáticamente 30 minutos antes de su inicio</strong>. ¡Asegúrate de cargarlos a tiempo!</li>
                <li>Si no estás seguro del resultado de algún partido, puedes dejarlo en blanco.</li>
                {userType === 'employee' ? (
                  <li>La tabla de posiciones de los empleados es privada e independiente de la de los huéspedes.</li>
                ) : (
                  <li>Podrás ver el ranking actualizado en vivo en las pantallas gigantes del hotel o ingresando nuevamente a la plataforma y eligiendo la opción "Solo Ver Fixture y Resultados".</li>
                )}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-center gap-8">
              <img src="/tremun-logo.png" alt="Tremun Hoteles" className="h-16 object-contain" />
              <img src="/lospinos-logo.png" alt="Los Pinos Resort" className="h-16 object-contain" />
            </div>

          </div>
          
          <div className="mt-8">
            <button 
              onClick={onClose}
              className="w-full bg-[#0e74b5] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all"
            >
              ¡Entendido, a jugar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
