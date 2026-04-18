export type Work = {
  slug: string;
  title: string;
  client: string;
  format: 'Рекламный' | 'Имиджевый' | 'Короткий' | 'Трансляция' | 'Промо';
  year: number;
  duration: string;
  vimeoId: string;
  tags: string[];
  featured?: boolean;
};

export const works: Work[] = [
  {
    slug: 'raketa-60',
    title: 'Ракета · 60 секунд о возвращении бренда',
    client: 'Raketa Watches',
    format: 'Имиджевый',
    year: 2025,
    duration: '00:60',
    vimeoId: '76979871',
    tags: ['watches', 'one-shot'],
    featured: true,
  },
  {
    slug: 'gazprom-event',
    title: 'Газпром · Прямая трансляция корпоративного события',
    client: 'Газпром',
    format: 'Трансляция',
    year: 2025,
    duration: '03:00:00',
    vimeoId: '76979871',
    tags: ['live', 'event'],
    featured: true,
  },
  {
    slug: 'circus-fontanka',
    title: 'Цирк на Фонтанке · Премьера сезона',
    client: 'Цирк на Фонтанке',
    format: 'Промо',
    year: 2024,
    duration: '01:30',
    vimeoId: '76979871',
    tags: ['arts'],
    featured: true,
  },
  {
    slug: 'dprofile-lectorium',
    title: 'Dprofile · Трансляции дизайн-лекториев',
    client: 'Dprofile',
    format: 'Трансляция',
    year: 2025,
    duration: '02:00:00',
    vimeoId: '76979871',
    tags: ['live', 'education', 'design'],
    featured: false,
  },
];
