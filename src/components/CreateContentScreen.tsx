import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import { Publication, corregimientosList } from '../data/publications';
import { usePublications } from '../contexts/PublicationsContext';

export default function CreateContentScreen({ onNavigate, editingPublication }: { onNavigate: (s: ScreenType) => void, editingPublication?: Publication | null }) {
  const { addPublication, updatePublication, deletePublication } = usePublications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(!!editingPublication);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: editingPublication?.title || '',
    corregimiento: editingPublication?.corregimiento || corregimientosList[0] || 'Pasto',
    category: editingPublication?.category || 'CULTURAL',
    subTitle: editingPublication?.subTitle || '',
    descriptionTitle: editingPublication?.descriptionTitle || '',
    dateRange: editingPublication?.dateRange || '',
    image: editingPublication?.image || '',
    location: editingPublication?.location || '',
    day: editingPublication?.day || '',
    month: editingPublication?.month || '',
    year: editingPublication?.year || '2026',
    syncCalendar: editingPublication?.day ? true : false
  });

  useEffect(() => {
    if (editingPublication) {
      setIsEditing(true);
      setFormData({
        title: editingPublication.title,
        corregimiento: editingPublication.corregimiento,
        category: editingPublication.category,
        subTitle: editingPublication.subTitle,
        descriptionTitle: editingPublication.descriptionTitle,
        dateRange: editingPublication.dateRange,
        image: editingPublication.image,
        location: editingPublication.location,
        day: editingPublication.day || '',
        month: editingPublication.month || '',
        year: editingPublication.year || '2026',
        syncCalendar: editingPublication.day ? true : false
      });
    } else {
      setIsEditing(false);
    }
  }, [editingPublication]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const categories: { id: string, label: string, icon: string, description: string, type: 'Eventos' | 'Posts Culturales' | 'Experiencias' }[] = [
    { id: 'CULTURAL', label: 'Evento', icon: 'event', description: 'Publica un nuevo evento cultural, deportivo o festivo.', type: 'Eventos' },
    { id: 'TRADICIÓN', label: 'Ruta', icon: 'route', description: 'Comparte una ruta turística o sendero en un corregimiento.', type: 'Posts Culturales' },
    { id: 'GASTRONOMÍA SANA', label: 'Recomendación', icon: 'thumb_up', description: 'Recomienda un lugar, restaurante o experiencia local.', type: 'Experiencias' }
  ];

  const handleSave = async () => {
    if (!formData.title || !formData.corregimiento) {
      alert('Título y Corregimiento son obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCat = categories.find(c => c.id === formData.category);
      const type = selectedCat ? selectedCat.type : 'Eventos';
      
      const pubData = {
        ...formData,
        type,
        day: formData.syncCalendar && formData.day ? parseInt(formData.day.toString()) : undefined,
        month: formData.syncCalendar && formData.month !== '' ? parseInt(formData.month.toString()) : undefined,
        year: formData.syncCalendar && formData.year ? parseInt(formData.year.toString()) : undefined
      };
      
      if (isEditing && editingPublication) {
        await updatePublication(editingPublication.corregimiento, editingPublication.title, pubData as Publication, editingPublication.id);
        alert('Cambios guardados con éxito');
      } else {
        await addPublication(pubData as Publication);
        alert('Publicación creada con éxito');
      }
      sessionStorage.setItem('reloadTargetScreen', 'home');
      window.location.reload();
    } catch (err) {
      alert('Error al guardar la publicación');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-24 w-full text-left">
        <Header 
          onNavigate={onNavigate} 
          onProfileClick={() => onNavigate('profile')} 
          showGreeting={false} 
          customTitle="Editar Publicación" 
        />

        <main className="flex-1 px-5 pt-8 flex flex-col w-full">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-stone-100 mb-2">
              <img src={formData.image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop'} alt="Preview" className="w-full h-full object-cover" />
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-sm text-[#f39233] active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Festival del Maíz"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Corregimiento</label>
                <select 
                  value={formData.corregimiento}
                  onChange={(e) => setFormData({...formData, corregimiento: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20 appearance-none"
                >
                  {corregimientosList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subtítulo / Lema</label>
                <input 
                  type="text" 
                  value={formData.subTitle}
                  onChange={(e) => setFormData({...formData, subTitle: e.target.value})}
                  placeholder="Ej: Tradición que vive"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Descripción Corta</label>
                <textarea 
                  rows={3}
                  value={formData.descriptionTitle}
                  onChange={(e) => setFormData({...formData, descriptionTitle: e.target.value})}
                  placeholder="Describe brevemente de qué trata..."
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-[#f39233]/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fecha / Rango</label>
                  <input 
                    type="text" 
                    value={formData.dateRange}
                    onChange={(e) => setFormData({...formData, dateRange: e.target.value})}
                    placeholder="Ej: 15 - 20 Ago"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20 appearance-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* CALENDAR SYNC SECTION */}
              <div className={`p-4 rounded-[28px] transition-all duration-300 border-2 ${formData.syncCalendar ? 'bg-orange-50/40 border-[#f39233]/20' : 'bg-gray-50/50 border-transparent'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined transition-colors ${formData.syncCalendar ? 'text-[#f39233]' : 'text-gray-400'} text-[20px]`}>calendar_add_on</span>
                    <h3 className="font-extrabold text-[#30132e] tracking-tight text-[13px]">VINCULAR AL CALENDARIO</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, syncCalendar: !formData.syncCalendar})}
                    className={`w-10 h-6 rounded-full relative transition-colors ${formData.syncCalendar ? 'bg-[#f39233]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.syncCalendar ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>
                
                {formData.syncCalendar ? (
                  <div className="animate-fade-in space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Día</label>
                        <input 
                          type="number" 
                          min="1"
                          max="31"
                          value={formData.day}
                          onChange={(e) => setFormData({...formData, day: e.target.value})}
                          placeholder="1-31"
                          className="w-full bg-white border border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mes</label>
                        <div className="relative">
                          <select 
                            value={formData.month}
                            onChange={(e) => setFormData({...formData, month: e.target.value})}
                            className="w-full bg-white border border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20 appearance-none"
                          >
                            <option value="">--</option>
                            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m, idx) => (
                              <option key={m} value={idx}>{m}</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-3.5 text-gray-400 text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Año</label>
                        <input 
                          type="number" 
                          min="2024"
                          max="2030"
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          placeholder="2026"
                          className="w-full bg-white border border-transparent rounded-2xl px-4 py-3 text-sm font-bold text-[#30132e] focus:ring-2 focus:ring-[#f39233]/20"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#f39233] font-bold italic px-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      Tu evento aparecerá en la fecha seleccionada dentro del calendario global.
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic px-1">Activa para asignar una fecha específica en el calendario.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-[#f39233] text-[#30132e] rounded-full font-black text-xs shadow-lg shadow-orange-200 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={() => onNavigate('manage_publications')}
                className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-full font-bold text-[11px] active:scale-95 transition-transform"
              >
                CANCELAR
              </button>
              <button 
                onClick={async () => {
                  if (editingPublication && window.confirm('¿Estás seguro de que deseas eliminar esta publicación permanentemente?')) {
                    try {
                      await deletePublication(editingPublication.corregimiento, editingPublication.title, editingPublication.id);
                      alert('Publicación eliminada');
                      sessionStorage.setItem('reloadTargetScreen', 'home');
                      window.location.reload();
                    } catch (err) {
                      alert('Error al eliminar');
                    }
                  }
                }}
                className="flex-1 py-3.5 bg-red-50 text-red-500 border border-red-100 rounded-full font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                ELIMINAR
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-24 w-full text-left">
      <Header 
        onNavigate={onNavigate} 
        onProfileClick={() => onNavigate('profile')} 
        showGreeting={false} 
        customTitle="Crear Contenido" 
      />

      <main className="flex-1 px-5 pt-8 flex flex-col w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#30132e] mb-2">¿Qué quieres compartir hoy?</h2>
          <p className="text-sm text-gray-500 font-medium px-4">
            Como creador, tus aportes ayudan a que otros descubran la riqueza de nuestros corregimientos.
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => {
                setFormData({ ...formData, category: cat.id });
                setIsEditing(true); // Switch to form view
              }} 
              className="w-full bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#f39233]/30 transition-all flex items-start gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-[#f39233] transition-colors">
                <span className="material-symbols-outlined text-[#f39233] group-hover:text-white transition-colors">
                  {cat.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[#30132e] group-hover:text-[#f39233] transition-colors">{cat.label}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 p-6 bg-[#30132e] rounded-3xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-2 text-[#f39233]">Tips para creadores</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-[11px] opacity-80">
                <span className="material-symbols-outlined text-[14px] mt-0.5">check_circle</span>
                Usa fotos de alta calidad para tus portadas.
              </li>
              <li className="flex items-start gap-2 text-[11px] opacity-80">
                <span className="material-symbols-outlined text-[14px] mt-0.5">check_circle</span>
                Describe detalladamente la ubicación.
              </li>
              <li className="flex items-start gap-2 text-[11px] opacity-80">
                <span className="material-symbols-outlined text-[14px] mt-0.5">check_circle</span>
                Añade etiquetas para que más personas te encuentren.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
