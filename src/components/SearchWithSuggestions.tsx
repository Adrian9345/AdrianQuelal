import React, { useState, useEffect, useRef } from 'react';
import { CorregimientoInfo, Publication, corregimientosList, corregimientoData } from '../data/publications';
import { usePublications } from '../contexts/PublicationsContext';

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSelectCorregimiento: (name: string) => void;
  bgClass?: string;
  placeholderColorClass?: string;
  textColorClass?: string;
}

export default function SearchWithSuggestions({
  placeholder = "Buscar (ej. trucha, cuy, Jogovito, Catambuco)",
  onSelectCorregimiento,
  bgClass = "bg-[#f5f5f5]",
  placeholderColorClass = "placeholder-gray-400",
  textColorClass = "text-gray-800"
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { publications: publicationsMap } = usePublications();
  
  const searchResults = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { corregimientos: [], publications: [] };

    const matchedCorregimientos: CorregimientoInfo[] = [];
    const matchedPublications: Publication[] = [];

    // Match corregimientos
    for (const name of corregimientosList) {
      const data = corregimientoData[name];
      if (
        name.toLowerCase().includes(q) ||
        data.phrase.toLowerCase().includes(q) ||
        data.welcomeTitle.toLowerCase().includes(q) ||
        data.bulletText.toLowerCase().includes(q)
      ) {
        matchedCorregimientos.push(data);
      }
    }

    // Match dynamic publications
    const allPubs = Object.values(publicationsMap).flat() as Publication[];
    for (const pub of allPubs) {
      if (
        pub.title.toLowerCase().includes(q) ||
        pub.subTitle.toLowerCase().includes(q) ||
        pub.category.toLowerCase().includes(q) ||
        pub.descriptionTitle.toLowerCase().includes(q) ||
        pub.corregimiento.toLowerCase().includes(q)
      ) {
        matchedPublications.push(pub);
      }
    }

    return {
      corregimientos: matchedCorregimientos,
      publications: matchedPublications
    };
  }, [query, publicationsMap]);

  const { corregimientos, publications } = searchResults;
  const hasSuggestions = corregimientos.length > 0 || publications.length > 0;

  // Flatten suggestions to navigate with keyboards comfortably
  const flatSuggestions: Array<{ type: 'corregimiento' | 'pub'; name: string; target: string; details?: string; category?: string }> = [];
  
  corregimientos.forEach(c => {
    flatSuggestions.push({
      type: 'corregimiento',
      name: c.name,
      target: c.name,
      details: c.phrase
    });
  });

  publications.forEach(p => {
    flatSuggestions.push({
      type: 'pub',
      name: p.title,
      target: p.corregimiento,
      details: `${p.descriptionTitle} • ${p.dateRange}`,
      category: p.category
    });
  });

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync keyboard shortcuts (Ctrl+K, Cmd+K, or slash) to focus this search box
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );

      if (isInputFocused) return;

      if ((e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k') || e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  // Handle keys inside input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => 
        flatSuggestions.length > 0 ? (prev + 1) % flatSuggestions.length : -1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => 
        flatSuggestions.length > 0 ? (prev - 1 + flatSuggestions.length) % flatSuggestions.length : -1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
        // Selection via keys
        const selected = flatSuggestions[highlightedIndex];
        onSelectCorregimiento(selected.target);
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
      } else {
        // Natural submit of current text
        const q = query.trim().toLowerCase();
        if (q) {
          // If we have any match in flat suggestions list, take the first one
          if (flatSuggestions.length > 0) {
            onSelectCorregimiento(flatSuggestions[0].target);
          } else {
            // Find in corregimientos
            const allNames = corregimientosList;
            const approx = allNames.find(n => n.toLowerCase().includes(q));
            if (approx) {
              onSelectCorregimiento(approx);
            }
          }
          setQuery('');
          setIsOpen(false);
          inputRef.current?.blur();
        }
      }
    }
  };

  const handleSelect = (target: string) => {
    onSelectCorregimiento(target);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Reset highlight index when query changes
  useEffect(() => {
    setHighlightedIndex(-1);
    if (query) {
      setIsOpen(true);
    }
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full z-40">
      
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-gray-500 text-2xl">search</span>
        </div>
        
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder} 
          className={`block w-full pl-14 pr-20 py-4 ${bgClass} border-none rounded-full ${textColorClass} ${placeholderColorClass} focus:ring-2 focus:ring-[#f39233]/40 text-sm font-semibold focus:outline-none transition-all shadow-sm`}
          style={{ fontFamily: '"Montserrat", sans-serif' }}
        />

        {/* Dynamic shortcuts badge when empty */}
        {!query && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] text-gray-500 font-extrabold select-none tracking-wider font-mono">
            <span>⌘K</span>
          </div>
        )}

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {/* Real-time Dynamic Suggestions Dropdown Box */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-[#eee8df]/80 overflow-hidden max-h-[350px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {hasSuggestions ? (
            <div className="p-2 flex flex-col gap-1.5">
              
              {/* CORREGIMIENTOS SECTION */}
              {corregimientos.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-black tracking-widest text-[#f39233] uppercase font-sans border-b border-orange-50 mb-1.5" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                    Corregimientos
                  </div>
                  {corregimientos.map((c) => {
                    const idxInFlat = flatSuggestions.findIndex(item => item.type === 'corregimiento' && item.name === c.name);
                    const isHighlighted = idxInFlat === highlightedIndex;
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleSelect(c.name)}
                        className={`w-full text-left px-3 py-2 rounded-2xl flex items-center gap-3 transition-colors ${
                          isHighlighted 
                            ? 'bg-orange-50/70 border-l-4 border-[#f39233] pl-2' 
                            : 'hover:bg-gray-50'
                        }`}
                        style={{ fontFamily: '"Montserrat", sans-serif' }}
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f39233] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[17px] font-bold">location_on</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-bold text-gray-900">{c.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{c.phrase}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* PUBLICATIONS SECTION (Feed de corregimientos) */}
              {publications.length > 0 && (
                <div className={`${corregimientos.length > 0 ? 'mt-2' : ''}`}>
                  <div className="px-3 py-1 text-[10px] font-black tracking-widest text-[#f39233] uppercase font-sans border-b border-orange-50 mb-1.5" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                    Eventos y Publicaciones
                  </div>
                  {publications.map((p) => {
                    const idxInFlat = flatSuggestions.findIndex(item => item.type === 'pub' && item.name === p.title);
                    const isHighlighted = idxInFlat === highlightedIndex;
                    return (
                      <button
                        key={p.title}
                        onClick={() => handleSelect(p.corregimiento)}
                        className={`w-full text-left px-3 py-2 rounded-2xl flex items-center gap-3 transition-colors ${
                          isHighlighted 
                            ? 'bg-orange-50/70 border-l-4 border-[#f39233] pl-2' 
                            : 'hover:bg-gray-50'
                        }`}
                        style={{ fontFamily: '"Montserrat", sans-serif' }}
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[17px] font-bold">campaign</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900">{p.title}</span>
                            <span className="text-[8.5px] bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded-full font-bold uppercase shrink-0">
                              {p.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {p.descriptionTitle} • <span className="text-orange-400">{p.corregimiento}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Keyboard Navigation Indicator */}
              <div className="px-3 py-1 text-[8.5px] text-gray-400 border-t border-gray-50 text-center select-none font-medium mt-1 font-sans">
                Usa <span className="font-bold">↑ ↓ Enter</span> para navegar
              </div>

            </div>
          ) : (
            <div className="p-6 text-center select-none">
              <span className="material-symbols-outlined text-[28px] text-gray-300 mb-1">search_off</span>
              <div className="text-xs font-extrabold text-[#1B1C19]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                Sin resultados para "{query}"
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                Prueba buscando "trucha", "Jogovito", o "Catambuco"
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
