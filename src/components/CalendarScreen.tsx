import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import RecommendedCard from './RecommendedCard';
import { usePublications } from '../contexts/PublicationsContext';
import { Publication } from '../data/publications';

interface EventItem {
  id: string;
  title: string;
  location: string;
  time: string;
  category: string;
  image: string;
  description: string;
  day: number;
  month: number;
  year: number;
}

export default function CalendarScreen({ 
  onNavigate,
  onEdit
}: { 
  onNavigate: (s: ScreenType) => void,
  onEdit?: (pub: any) => void
}) {
  const { publications } = usePublications();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthsShorthand = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  const years = [2024, 2025, 2026, 2027, 2028];

  // Starting on May 2026 based on real-time metadata 
  const [selectedMonth, setSelectedMonth] = useState(4); // Mayo (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(1);
  
  // Floating Card Pickers
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempMonth, setTempMonth] = useState(4);
  const [tempYear, setTempYear] = useState(2026);

  // Scroll tracking for dynamic indicator bullets interaction
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const el = carouselRef.current;
    if (el) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(el.scrollLeft / maxScroll);
      } else {
        setScrollProgress(0);
      }
    }
  };

  // Reset scroll progress when month/year changes
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
      setScrollProgress(0);
    }
  }, [selectedMonth, selectedYear]);

  // Dynamic Event Data based on selected date
  const eventsDatabase: EventItem[] = useMemo(() => {
    const dynamicEvents: EventItem[] = [];
    Object.values(publications).forEach((list: Publication[]) => {
      list.forEach((pub: Publication) => {
        if (pub.day && pub.month !== undefined && pub.year) {
          dynamicEvents.push({
            id: pub.id || `dyn-${pub.title}`,
            title: pub.title,
            location: pub.location,
            time: pub.dateRange,
            category: pub.category,
            image: pub.image,
            description: pub.descriptionTitle,
            day: pub.day,
            month: pub.month,
            year: pub.year
          });
        }
      });
    });

    return dynamicEvents;
  }, [publications]);

  // Generate day items for the chosen Month & Year
  const getDaysInMonthList = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const list = [];
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    while (date.getMonth() === month) {
      list.push({
        name: weekdayNames[date.getDay()],
        number: date.getDate(),
      });
      date.setDate(date.getDate() + 1);
    }
    return list;
  };

  const daysList = getDaysInMonthList(selectedYear, selectedMonth);

  // Prevent selectedDay out of bounds when month changes
  useEffect(() => {
    const daysInNewMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(1);
    }
  }, [selectedMonth, selectedYear, selectedDay]);

  const openPicker = () => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    setIsPickerOpen(true);
  };

  const handleApplyPicker = () => {
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setSelectedDay(1); // Reset to first day of selected month
    setIsPickerOpen(false);
  };

  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      // Go to previous month
      if (selectedMonth > 0) {
        const prevMonth = selectedMonth - 1;
        setSelectedMonth(prevMonth);
        const prevDays = new Date(selectedYear, prevMonth + 1, 0).getDate();
        setSelectedDay(prevDays);
      } else {
        // Go to dec of prev year
        const prevYear = selectedYear - 1;
        if (years.includes(prevYear)) {
          setSelectedYear(prevYear);
          setSelectedMonth(11);
          setSelectedDay(31);
        }
      }
    }
  };

  const handleNextDay = () => {
    const daysCount = daysList.length;
    if (selectedDay < daysCount) {
      setSelectedDay(selectedDay + 1);
    } else {
      // Go to next month
      if (selectedMonth < 11) {
        setSelectedMonth(selectedMonth + 1);
        setSelectedDay(1);
      } else {
        // Go to jan of next year
        const nextYear = selectedYear + 1;
        if (years.includes(nextYear)) {
          setSelectedYear(nextYear);
          setSelectedMonth(0);
          setSelectedDay(1);
        }
      }
    }
  };

  // Filter current active day events
  const activeEvents = eventsDatabase.filter(
    (e) => e.day === selectedDay && e.month === selectedMonth && e.year === selectedYear
  );

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32 relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      <Header onNavigate={onNavigate} />
      <main className="flex-1">
        
        {/* Intro Info banner */}
        <section className="px-6 flex flex-col items-center justify-center py-5 mt-2">
          <p className="text-[12px] leading-relaxed text-center text-stone-600 font-medium max-w-sm">
            Bienvenido al <img src="/Recurso 9.png" alt="Raigal" className="inline-block h-4 mb-1" /> calendario donde podrás visualizar y explorar las fechas de los próximos eventos tradicionales.
          </p>
        </section>

        {/* Calendar Control Area */}
        <section className="px-4 mb-6">
          <div className="bg-[#fcfbf9] border border-stone-200/60 rounded-[24px] p-5.5 shadow-md relative">
             <div className="flex items-center justify-between mb-5">
                {/* Clickable selectors opening Month/Year floating card */}
                <div className="flex gap-2.5">
                  <button 
                    type="button"
                    onClick={openPicker}
                    className="bg-[#f39233] text-white hover:brightness-105 active:scale-95 text-[12px] font-extrabold px-4.5 py-2 rounded-full flex items-center gap-1 border-b-[3px] border-orange-600 transition-all cursor-pointer shadow-sm focus:outline-none"
                  >
                    <span>{monthNames[selectedMonth]}</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                  <button 
                    type="button"
                    onClick={openPicker}
                    className="bg-[#f39233] text-white hover:brightness-105 active:scale-95 text-[12px] font-extrabold px-4.5 py-2 rounded-full flex items-center gap-1 border-b-[3px] border-orange-600 transition-all cursor-pointer shadow-sm focus:outline-none"
                  >
                    <span>{selectedYear}</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                </div>

                {/* Day navigation arrows */}
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handlePrevDay} 
                    className="w-8.5 h-8.5 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold hover:bg-stone-200 hover:text-stone-900 active:scale-90 transition-all focus:outline-none"
                    aria-label="Día anterior"
                  >
                     <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextDay} 
                    className="w-8.5 h-8.5 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold hover:bg-stone-200 hover:text-stone-900 active:scale-90 transition-all focus:outline-none"
                    aria-label="Siguiente día"
                  >
                     <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
             </div>

             {/* Days of Month Carousel Slider with dynamic scroll tracking */}
             <div 
               ref={carouselRef}
               onScroll={handleScroll}
               className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide -mx-2 px-2 select-none" 
               style={{ WebkitOverflowScrolling: 'touch' }}
             >
               {daysList.map((d) => {
                 const isDayActive = d.number === selectedDay;
                 return (
                   <button 
                    key={d.number} 
                    type="button"
                    onClick={() => setSelectedDay(d.number)}
                    className={`flex-shrink-0 w-15 h-22 rounded-2xl border-b-4 flex flex-col items-center justify-center transition-all duration-200 ${
                      isDayActive 
                        ? 'bg-[#f39233] border-orange-600 text-white font-extrabold shadow-md scale-105' 
                        : 'bg-white border border-stone-200/70 border-b-zinc-300 text-stone-500 hover:bg-[#fffbf6] hover:border-[#f39233]/40'
                    }`}
                   >
                     <span className="text-[10px] font-extrabold uppercase tracking-wide">{d.name}</span>
                     <span className="text-lg font-black mt-0.5">{d.number}</span>
                   </button>
                 );
               })}
             </div>
             
             {/* Dynamic Indicator Bullets decoration */}
             <div className="flex justify-center items-center mt-3">
               <div className="relative w-16 h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
                 {/* Moving dark gray bar segment */}
                 <div 
                   className="absolute h-full bg-stone-700 rounded-full transition-all duration-75 ease-out"
                   style={{
                     width: '20px',
                     transform: `translateX(${scrollProgress * (64 - 20)}px)`
                   }}
                 />
               </div>
             </div>
          </div>
        </section>

        {/* Events listing */}
        <section className="px-5 relative mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-extrabold text-[#1B1C19]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Eventos para hoy
            </h2>
            <span className="text-[11px] font-extrabold text-[#f39233] bg-orange-50 px-2.5 py-1 rounded-sm">
              {daysList[selectedDay - 1]?.name}, {selectedDay} de {monthNames[selectedMonth]}
            </span>
          </div>

          <div className="min-h-[340px] bg-[#fbf9f4]/80 border border-stone-200/50 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col p-5">
            {/* Dots background patterns */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            {activeEvents.length > 0 ? (
              <div className="relative z-10 flex flex-col gap-4">
                {activeEvents.map((event) => (
                  <RecommendedCard
                    key={event.id}
                    id={event.id}
                    category={event.category}
                    title={event.title}
                    subTitle={event.description}
                    descriptionTitle={event.title}
                    dateRange={event.time}
                    image={event.image}
                    location={event.location}
                    onNavigate={onNavigate}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="relative z-10 opacity-80 text-center flex flex-col items-center justify-center my-auto py-8">
                 <div className="w-18 h-18 bg-stone-100 rounded-full flex items-center justify-center mb-3 text-stone-400 border border-stone-200">
                   <span className="material-symbols-outlined text-3xl">event_busy</span>
                 </div>
                 <p className="text-sm font-bold text-stone-600">No hay eventos tradiciones</p>
                 <p className="text-stone-400 text-xs mt-1 max-w-xs mx-auto">No hay ceremonias planeadas para esta fecha. Intenta cambiar de día o mes.</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Floating Month & Year Picker Modal Overlay */}
      {isPickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-5 select-none animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl border border-stone-100 w-full max-w-sm overflow-hidden flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
              <div>
                <h3 className="font-extrabold text-[#1B1C19] text-[15px]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  Filtrar Fecha
                </h3>
                <p className="text-stone-500 text-[11px] font-medium mt-0.5">Filtra eventos tradicionales de Pasto</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8.5 h-8.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Selector Grid Body */}
            <div className="p-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
              {/* Year list selector */}
              <div>
                <span className="text-stone-400 text-[10px] font-black uppercase tracking-wider block mb-2">Año</span>
                <div className="flex gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setTempYear(y)}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-xl border transition-all ${
                        tempYear === y
                          ? 'bg-[#f39233] text-white border-b border-orange-600 shadow-sm'
                          : 'bg-stone-50 text-stone-600 border-stone-200/70 hover:bg-[#fff9f2] hover:border-orange-200'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month grid selector */}
              <div>
                <span className="text-stone-400 text-[10px] font-black uppercase tracking-wider block mb-2">Mes</span>
                <div className="grid grid-cols-4 gap-2">
                  {monthsShorthand.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempMonth(idx)}
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                        tempMonth === idx
                          ? 'bg-[#f39233] text-white border-b-2 border-orange-600 shadow-sm'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-[#fff9f2] hover:border-orange-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="px-6 py-4.5 border-t border-stone-100 flex items-center justify-end gap-3 bg-stone-50/80">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 text-stone-500 hover:text-stone-700 text-xs font-black transition-colors focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyPicker}
                className="px-6 py-2.5 bg-[#f39233] hover:bg-orange-500 text-white border-b-2 border-orange-600 text-xs font-black rounded-full shadow-md active:scale-95 transition-all focus:outline-none"
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
