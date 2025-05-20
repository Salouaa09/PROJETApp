// src/components/notifications/mockData.js
export const alerts = [
  {
    id: 1,
    datetime: '2025-04-24 14:33',
    camera: 'Caméra 1',
    type: 'Violence physique',
    confidence: 92,
    summary: 'Une altercation détectée',
    status: 'non_lue', // 🆕
  },
  {
    id: 2,
    datetime: '2025-04-24 10:05',
    camera: 'Caméra 2',
    type: 'Bagarre',
    confidence: 87,
    summary: 'Deux personnes se battent',
    status: 'en_cours', // 🟡
  },
  {
    id: 3,
    datetime: '2025-04-23 18:00',
    camera: 'Caméra 3',
    type: 'Agression',
    confidence: 95,
    summary: 'Agression détectée',
    status: 'traite', // ✅
  },
 
];
