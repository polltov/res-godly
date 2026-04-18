export type Testimonial = {
  client: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    client: 'Цирк на Фонтанке',
    quote:
      'Res.prod показали себя настоящими профессионалами. Работа в жёстких дедлайнах реализована на высоком уровне и точно в срок.',
  },
  {
    client: 'Dprofile',
    quote:
      'Комфортный бюджет, высокий уровень экспертности. Ребята погружаются в задачу полностью.',
  },
];
