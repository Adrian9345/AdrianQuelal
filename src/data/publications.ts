export interface Publication {
  id?: string;
  corregimiento: string;
  category: string;
  subTitle: string;
  title: string;
  descriptionTitle: string;
  dateRange: string;
  image: string;
  location: string;
  creatorId?: string;
  type: 'Eventos' | 'Posts Culturales' | 'Experiencias';
  day?: number;
  month?: number;
  year?: number;
}

export interface CorregimientoInfo {
  name: string;
  phrase: string;
  image: string;
  welcomeTitle: string;
  bulletText: string;
}

export const corregimientosList = ['Jogovito', 'Catambuco', 'Gualmatán', 'Obonuco'];

export const corregimientoData: Record<string, CorregimientoInfo> = {
  'Jogovito': {
    name: 'Jogovito',
    phrase: "Tierra de paz, agricultura y hermosos paisajes rurales.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
    welcomeTitle: "Bienvenido a Jogovito",
    bulletText: "Disfruta del aire puro, la tranquilidad del campo y la calidez de nuestra gente trabajadora."
  },
  'Catambuco': {
    name: 'Catambuco',
    phrase: "Puerta de entrada al sur y tierra del mejor cuy tradicional.",
    image: "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop",
    welcomeTitle: "Bienvenido a Catambuco",
    bulletText: "Un lugar de fe y sabor, famoso por su santuario y su inconfundible cocina criolla."
  },
  'Gualmatán': {
    name: 'Gualmatán',
    phrase: "Cuna de cultura, arte y ricas tradiciones ancestrales.",
    image: "https://images.unsplash.com/photo-1518182170546-076616fd4803?q=80&w=800&auto=format&fit=crop",
    welcomeTitle: "Bienvenido a Gualmatán",
    bulletText: "Explora nuestras expresiones artísticas y la historia que vive en cada calle de nuestro corregimiento."
  },
  'Obonuco': {
    name: 'Obonuco',
    phrase: "Tradición lechera y despensa agrícola a las faldas del Galeras.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    welcomeTitle: "Bienvenido a Obonuco",
    bulletText: "Conoce los procesos del campo, degusta productos lácteos frescos y admira la vista del volcán."
  }
};

export const publicationsData: Record<string, Publication[]> = {
  'Jogovito': [
    {
      id: 'mock-jogovito-1',
      corregimiento: 'Jogovito',
      category: 'CULTURAL',
      subTitle: 'Conexión natural y aire libre',
      title: 'Festi-Aventura Jogovito',
      descriptionTitle: 'Disfruta de caminatas ecológicas por los cultivos de hortalizas locales, paseos guiados a caballo y deliciosa gastronomía campesina preparada por los habitantes.',
      dateRange: '15 - 18 Jun',
      image: 'https://images.unsplash.com/photo-1545244015-024809cc4b74?q=80&w=800&auto=format&fit=crop',
      location: 'Senderos ecológicos de Jogovito',
      type: 'Eventos',
      day: 15,
      month: 5,
      year: 2026
    }
  ],
  'Catambuco': [
    {
      id: 'mock-catambuco-1',
      corregimiento: 'Catambuco',
      category: 'GASTRONOMÍA SANA',
      subTitle: 'Sabor tradicional sureño',
      title: 'Festival del Cuy de Oro',
      descriptionTitle: 'Explora la sazón gastronómica legendaria de Catambuco. Disfruta del cuy asado tradicional, empanadas de harina y refrescantes bebidas artesanales.',
      dateRange: '28 - 30 Jun',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
      location: 'Parque de los Sabores, Catambuco',
      type: 'Experiencias',
      day: 28,
      month: 5,
      year: 2026
    }
  ],
  'Gualmatán': [
    {
      id: 'mock-gualmatan-1',
      corregimiento: 'Gualmatán',
      category: 'TRADICIÓN',
      subTitle: 'Cultura ancestral nariñense',
      title: 'Ruta del Barniz y Relatos Ancestrales',
      descriptionTitle: 'Acompaña a colectivos de artesanos locales en un recorrido por los talleres donde se trabaja la resina sagrada de Mopa-Mopa, un arte patrimonio inmaterial.',
      dateRange: '05 - 10 Jul',
      image: 'https://images.unsplash.com/photo-1621303837876-43d35133bee0?q=80&w=800&auto=format&fit=crop',
      location: 'Taller de Arte Ancestral Gualmatán',
      type: 'Posts Culturales',
      day: 5,
      month: 6,
      year: 2026
    }
  ],
  'Obonuco': [
    {
      id: 'mock-obonuco-1',
      corregimiento: 'Obonuco',
      category: 'GASTRONOMÍA SANA',
      subTitle: 'Faldas del volcán Galeras',
      title: 'Feria de la Fresa y Lácteos',
      descriptionTitle: 'Visita los cultivos andinos más dulces. Cata productos orgánicos, quesos madurados, helados de paila artesanales y disfruta de música en vivo.',
      dateRange: '12 - 14 Jul',
      image: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=800&auto=format&fit=crop',
      location: 'Plaza Central de Obonuco',
      type: 'Experiencias',
      day: 12,
      month: 6,
      year: 2026
    },
    {
      id: 'mock-obonuco-guaguas',
      corregimiento: 'Obonuco',
      category: 'TRADICIÓN',
      subTitle: 'Fieles y Ofrendas Ancestrales',
      title: 'Fiesta mis Guaguas de Pan',
      descriptionTitle: 'Celebración andina tradicional con impresionantes representaciones artísticas, música de viento andino y deliciosas guaguas de pan artesanales.',
      dateRange: '02 - 05 Nov',
      image: 'https://images.unsplash.com/photo-1545244015-024809cc4b74?q=80&w=800&auto=format&fit=crop',
      location: 'Plaza Principal de Obonuco',
      type: 'Eventos',
      day: 2,
      month: 11,
      year: 2026
    }
  ]
};

// Returns suggestions based on the user's typed search query
export function getSearchSuggestions(query: string) {
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

  // Match publications
  for (const list of Object.values(publicationsData)) {
    for (const pub of list) {
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
  }

  // Filter on Vercel to limit recommendations solely to Guaguas de Pan
  const isVercel = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel') || 
    window.location.hostname === 'adrian-quelal.vercel.app'
  );
  
  let finalPublications = matchedPublications;
  let finalCorregimientos = matchedCorregimientos;

  if (isVercel) {
    finalPublications = matchedPublications.filter(pub => {
      const t = pub.title.toLowerCase();
      return t.includes('guaguas de pan') || t.includes('guguas de pan') || t.includes('guagua');
    });
    // On Vercel, the only corregimiento with this publication is Obonuco
    finalCorregimientos = matchedCorregimientos.filter(c => c.name === 'Obonuco');
  }

  return {
    corregimientos: finalCorregimientos,
    publications: finalPublications
  };
}
