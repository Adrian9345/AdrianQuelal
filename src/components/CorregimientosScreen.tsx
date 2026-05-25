import Header from './Header';
import { ScreenType } from '../types';
import { corregimientosList } from '../data/publications';

export default function CorregimientosScreen({ onNavigate, onSelectCorregimiento }: { onNavigate: (s: ScreenType) => void, onSelectCorregimiento?: (c: string) => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <Header onNavigate={onNavigate} title="Municipios / Corregimientos" />
      <main className="flex-1 p-5">
        <h2 className="text-2xl font-bold mb-4 text-[#1B1C19]">Municipios</h2>

        <div className="grid grid-cols-2 gap-4">
           {corregimientosList.map(c => (
              <div 
                key={c} 
                onClick={() => onSelectCorregimiento && onSelectCorregimiento(c)}
                className="w-full aspect-square bg-[#fbf9f4] rounded-[20px] flex flex-col items-center justify-center border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-orange-200 transition-colors"
              >
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                <div className="w-16 h-16 bg-[#f39233]/10 rounded-full flex items-center justify-center mb-3 text-[#f39233] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">landscape</span>
                </div>
                <span className="font-bold text-sm text-[#30132e] relative z-10">{c}</span>
              </div>
           ))}
        </div>
      </main>
    </div>
  )
}
