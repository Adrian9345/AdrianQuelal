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
  'Jogovito': [],
  'Catambuco': [],
  'Gualmatán': [],
  'Obonuco': []
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

  return {
    corregimientos: matchedCorregimientos,
    publications: matchedPublications
  };
}
