export type Client = {
  name: string;
  mark: 'gazprom' | 'dprofile' | 'circus' | 'raketa';
  description: string;
  href?: string;
};

export const clients: Client[] = [
  {
    name: 'Газпром',
    mark: 'gazprom',
    description:
      'Организация прямой трансляции корпоративного мероприятия для филиалов компании по всей России.',
    href: 'https://www.gazprom.ru',
  },
  {
    name: 'Dprofile',
    mark: 'dprofile',
    description:
      'Прямые трансляции обучающих лекториев для дизайн-сообщества. Техническое сопровождение и видеоконтент для медиаресурсов.',
    href: 'https://dprofile.ru',
  },
  {
    name: 'Цирк на Фонтанке',
    mark: 'circus',
    description:
      'Системное сотрудничество и подготовка видеоконтента для проектов Росгосцирка на площадке Цирка на Фонтанке.',
    href: 'https://www.circus.spb.ru/about.html',
  },
  {
    name: 'Ракета',
    mark: 'raketa',
    description:
      'Подготовка имиджевого ролика для демонстрации возможностей компании в секторе B2B.',
    href: 'https://world.raketa.com',
  },
];
