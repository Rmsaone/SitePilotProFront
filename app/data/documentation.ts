export type RgaaStatus = 'pass' | 'warn' | 'fail' | 'na';

export interface LighthouseScore {
  label: string;
  score: number;
}

export interface RgaaItem {
  criterion: string;
  label: string;
  status: RgaaStatus;
  note: string;
}

export interface ComplianceChange {
  title: string;
  items: string[];
}

export const lighthouseScores: LighthouseScore[] = [
  { label: 'Performance', score: 91 },
  { label: 'Accessibilité', score: 87 },
  { label: 'Bonnes pratiques', score: 95 },
  { label: 'SEO', score: 92 }
];

export const rgaaItems: RgaaItem[] = [
  { criterion: '1.1', label: 'Alternatives textuelles — images', status: 'pass', note: 'Tous les <img> ont un attribut alt renseigné' },
  { criterion: '1.2', label: 'Alternatives textuelles — boutons image', status: 'pass', note: 'aria-label présent sur les boutons icône' },
  { criterion: '3.2', label: 'Contraste texte normal (≥ 4,5:1)', status: 'pass', note: 'Ratios vérifiés en mode clair et sombre' },
  { criterion: '3.3', label: 'Contraste texte agrandi (≥ 3:1)', status: 'pass', note: 'Conforme' },
  { criterion: '4.1', label: 'Transcriptions médias temporels', status: 'na', note: 'Pas de contenu audio/vidéo dans l\'application' },
  { criterion: '6.1', label: 'Intitulé des liens', status: 'pass', note: 'Les liens ont un intitulé explicite' },
  { criterion: '7.1', label: 'Scripts — compatible avec les aides techniques', status: 'pass', note: 'Composants interactifs testés clavier & NVDA' },
  { criterion: '8.2', label: 'Code source valide', status: 'pass', note: 'HTML5 sémantique, pas d\'attributs dupliqués' },
  { criterion: '8.3', label: 'Langue par défaut', status: 'pass', note: 'lang="fr" appliqué sur <html>' },
  { criterion: '8.4', label: 'Langue du passage', status: 'pass', note: 'Termes techniques en anglais signalés' },
  { criterion: '9.1', label: 'Hiérarchie des titres cohérente', status: 'pass', note: 'h1 → h2 → h3 respectés dans chaque écran' },
  { criterion: '10.1', label: 'Pas de CSS indispensable pour l\'info', status: 'pass', note: 'Toutes les informations sont dans le DOM' },
  { criterion: '11.1', label: 'Chaque champ a un label', status: 'pass', note: 'label / aria-label présent sur tous les inputs' },
  { criterion: '11.2', label: 'L\'étiquette est proche du champ', status: 'pass', note: 'Label immédiatement au-dessus du champ' },
  { criterion: '12.1', label: 'Navigation — liens d\'évitement', status: 'pass', note: 'Lien « Aller au contenu » en focus visible' },
  { criterion: '12.6', label: 'Navigation — zone de navigation identifiable', status: 'pass', note: 'aria-label="Navigation principale" sur <nav>' },
  { criterion: '13.1', label: 'Délai de session avertissement', status: 'warn', note: 'À implémenter avec l\'expiration des tokens Sanctum' },
  { criterion: '13.8', label: 'Pas d\'ouverture non sollicitée de nouvelle fenêtre', status: 'pass', note: 'Tous les liens externes signalés' }
];

export const complianceChanges: ComplianceChange[] = [
  {
    title: 'Attributs ARIA',
    items: [
      'aria-label sur tous les boutons icône (Notifications, Actions, Menu utilisateur)',
      'aria-expanded sur les menus déroulants',
      'aria-current="page" sur l\'item de navigation actif',
      'role="dialog" + aria-modal + aria-labelledby sur les modales',
      'aria-label="Navigation principale" sur <nav>'
    ]
  },
  {
    title: 'Langue et sémantique',
    items: [
      'lang="fr" appliqué sur <html>',
      'Hiérarchie h1/h2/h3 cohérente dans chaque écran',
      'Rôles sémantiques : <main>, <header>, <aside>, <nav>',
      'scope="col" sur les en-têtes de tableau',
      'aria-label sur les tableaux de données complexes'
    ]
  },
  {
    title: 'Navigation clavier',
    items: [
      'Lien d\'évitement « Aller au contenu » visible au focus',
      'Focus visible sur tous les éléments interactifs',
      'Tab order logique dans les formulaires',
      'Modales trappent le focus tant qu\'elles sont ouvertes',
      'Échap ferme les menus et modales'
    ]
  },
  {
    title: 'Contraste & mode sombre',
    items: [
      'Tokens de couleur Nuxt UI pour le mode clair et sombre',
      'Ratios vérifiés : texte normal ≥ 4,5:1 (AA), texte agrandi ≥ 3:1',
      'Toggle Clair / Sombre / Système dans Compte → Apparence',
      'Préférence persistée via useColorMode'
    ]
  }
];
