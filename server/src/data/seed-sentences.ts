import { Sentence } from '../../../shared/schema'

// Seed data for Spanish sentences with proper progression
export const seedSentences: Omit<Sentence, 'createdAt'>[] = [
  // BEGINNER LEVEL - Basic greetings and everyday phrases
  {
    id: '1',
    spanish: 'Hola, ¿cómo estás?',
    english: 'Hello, how are you?',
    difficulty: 'beginner',
    category: 'greetings',
    hints: JSON.stringify([
      'This is a common greeting',
      '"Hola" means "hello"',
      '"¿Cómo estás?" asks about how someone is feeling'
    ]),
    grammarPoints: JSON.stringify(['question formation', 'greetings', 'estar vs ser']),
    isActive: true
  },
  {
    id: '2', 
    spanish: 'Me llamo María.',
    english: 'My name is María.',
    difficulty: 'beginner',
    category: 'introductions',
    hints: JSON.stringify([
      'This is how you introduce yourself',
      '"Me llamo" literally means "I call myself"',
      'This is more common than "Mi nombre es"'
    ]),
    grammarPoints: JSON.stringify(['reflexive verbs', 'self-introduction']),
    isActive: true
  },
  {
    id: '3',
    spanish: 'Quiero un café, por favor.',
    english: 'I want a coffee, please.',
    difficulty: 'beginner',
    category: 'food_drink',
    hints: JSON.stringify([
      'Basic request for food/drink',
      '"Quiero" means "I want"',
      '"Por favor" means "please" - always polite!'
    ]),
    grammarPoints: JSON.stringify(['present tense', 'polite requests', 'articles']),
    isActive: true
  },
  {
    id: '4',
    spanish: 'La casa es grande.',
    english: 'The house is big.',
    difficulty: 'beginner',
    category: 'descriptions',
    hints: JSON.stringify([
      'Simple description using "ser"',
      '"La casa" - feminine article + noun',
      '"Grande" doesn\'t change for masculine/feminine here'
    ]),
    grammarPoints: JSON.stringify(['ser vs estar', 'adjectives', 'gender agreement']),
    isActive: true
  },
  {
    id: '5',
    spanish: 'Tengo dos hermanos.',
    english: 'I have two brothers.',
    difficulty: 'beginner',
    category: 'family',
    hints: JSON.stringify([
      'Expressing possession with "tener"',
      '"Dos" means "two"',
      '"Hermanos" can mean brothers or siblings in general'
    ]),
    grammarPoints: JSON.stringify(['tener', 'numbers', 'family vocabulary']),
    isActive: true
  },

  // INTERMEDIATE LEVEL - More complex grammar and vocabulary
  {
    id: '6',
    spanish: 'Estoy estudiando español desde hace dos años.',
    english: 'I have been studying Spanish for two years.',
    difficulty: 'intermediate',
    category: 'education',
    hints: JSON.stringify([
      'Present continuous with time expression',
      '"Desde hace" expresses duration',
      'English present perfect = Spanish present continuous here'
    ]),
    grammarPoints: JSON.stringify(['present continuous', 'time expressions', 'duration']),
    isActive: true
  },
  {
    id: '7',
    spanish: 'Si tuviera tiempo, viajaría por Europa.',
    english: 'If I had time, I would travel through Europe.',
    difficulty: 'intermediate', 
    category: 'travel',
    hints: JSON.stringify([
      'Conditional sentence (hypothetical)',
      '"Si tuviera" = past subjunctive',
      '"Viajaría" = conditional tense'
    ]),
    grammarPoints: JSON.stringify(['subjunctive', 'conditional', 'hypothetical situations']),
    isActive: true
  },
  {
    id: '8',
    spanish: 'Me gusta mucho la música que tocas.',
    english: 'I really like the music that you play.',
    difficulty: 'intermediate',
    category: 'entertainment',
    hints: JSON.stringify([
      'Expressing likes with "gustar"',
      '"Que" introduces relative clause',
      '"Tocas" means "you play" (music)'
    ]),
    grammarPoints: JSON.stringify(['gustar construction', 'relative pronouns', 'present tense']),
    isActive: true
  },
  {
    id: '9',
    spanish: 'Habría llegado antes si no hubiera habido tanto tráfico.',
    english: 'I would have arrived earlier if there hadn\'t been so much traffic.',
    difficulty: 'intermediate',
    category: 'transportation',
    hints: JSON.stringify([
      'Past conditional + past perfect subjunctive',
      '"Habría llegado" = would have arrived',
      '"Si no hubiera habido" = if there hadn\'t been'
    ]),
    grammarPoints: JSON.stringify(['past conditional', 'past perfect subjunctive', 'hypothetical past']),
    isActive: true
  },
  {
    id: '10',
    spanish: 'Aunque llueva mañana, iremos a la playa.',
    english: 'Even if it rains tomorrow, we will go to the beach.',
    difficulty: 'intermediate',
    category: 'weather',
    hints: JSON.stringify([
      '"Aunque" + subjunctive for uncertainty',
      '"Llueva" = subjunctive of "llover"',
      'Future plans despite uncertain conditions'
    ]),
    grammarPoints: JSON.stringify(['subjunctive with aunque', 'weather verbs', 'future plans']),
    isActive: true
  },

  // ADVANCED LEVEL - Complex constructions and nuanced expressions
  {
    id: '11',
    spanish: 'Es imprescindible que se tomen medidas drásticas para combatir el cambio climático.',
    english: 'It is essential that drastic measures be taken to combat climate change.',
    difficulty: 'advanced',
    category: 'environment',
    hints: JSON.stringify([
      'Impersonal expression + subjunctive',
      '"Es imprescindible que" requires subjunctive',
      '"Se tomen" = passive/impersonal "be taken"'
    ]),
    grammarPoints: JSON.stringify(['impersonal expressions', 'subjunctive', 'passive voice', 'environmental vocabulary']),
    isActive: true
  },
  {
    id: '12',
    spanish: 'La empresa había sido adquirida por un conglomerado multinacional antes de que nos diéramos cuenta.',
    english: 'The company had been acquired by a multinational conglomerate before we realized it.',
    difficulty: 'advanced',
    category: 'business',
    hints: JSON.stringify([
      'Past perfect passive voice',
      '"Había sido adquirida" = had been acquired',
      '"Antes de que" + past subjunctive'
    ]),
    grammarPoints: JSON.stringify(['past perfect passive', 'past subjunctive', 'business vocabulary', 'temporal clauses']),
    isActive: true
  },
  {
    id: '13',
    spanish: 'No obstante las dificultades económicas, la fundación logró cumplir con sus objetivos benéficos.',
    english: 'Despite the economic difficulties, the foundation managed to meet its charitable objectives.',
    difficulty: 'advanced',
    category: 'social_issues',
    hints: JSON.stringify([
      '"No obstante" = formal "despite"',
      '"Logró cumplir" = managed to achieve',
      'Formal register and complex vocabulary'
    ]),
    grammarPoints: JSON.stringify(['formal connectors', 'achievement expressions', 'non-profit vocabulary']),
    isActive: true
  },
  {
    id: '14',
    spanish: 'Cuanto más leo sobre neurociencia, más me fascina la complejidad del cerebro humano.',
    english: 'The more I read about neuroscience, the more the complexity of the human brain fascinates me.',
    difficulty: 'advanced',
    category: 'science',
    hints: JSON.stringify([
      '"Cuanto más... más" = "the more... the more"',
      'Correlative construction',
      'Scientific vocabulary and complex concepts'
    ]),
    grammarPoints: JSON.stringify(['correlative expressions', 'scientific vocabulary', 'complex sentence structure']),
    isActive: true
  },
  {
    id: '15',
    spanish: 'De no haber sido por tu intervención oportuna, las consecuencias habrían sido catastróficas.',
    english: 'Had it not been for your timely intervention, the consequences would have been catastrophic.',
    difficulty: 'advanced',
    category: 'formal_situations',
    hints: JSON.stringify([
      '"De no haber sido por" = formal "if it hadn\'t been for"',
      'Alternative conditional construction',
      '"Habrían sido" = would have been'
    ]),
    grammarPoints: JSON.stringify(['alternative conditionals', 'formal register', 'past conditional']),
    isActive: true
  }
]

// Categories for filtering and organization
export const sentenceCategories = [
  'greetings',
  'introductions', 
  'food_drink',
  'descriptions',
  'family',
  'education',
  'travel',
  'entertainment',
  'transportation',
  'weather',
  'environment',
  'business',
  'social_issues',
  'science',
  'formal_situations'
] as const

// Grammar points covered across all sentences
export const grammarPoints = [
  'question formation',
  'greetings', 
  'estar vs ser',
  'reflexive verbs',
  'present tense',
  'polite requests',
  'articles',
  'adjectives',
  'gender agreement',
  'tener',
  'numbers',
  'family vocabulary',
  'present continuous',
  'time expressions',
  'duration',
  'subjunctive',
  'conditional',
  'hypothetical situations',
  'gustar construction',
  'relative pronouns',
  'past conditional',
  'past perfect subjunctive',
  'weather verbs',
  'impersonal expressions',
  'passive voice',
  'environmental vocabulary',
  'business vocabulary',
  'temporal clauses',
  'formal connectors',
  'achievement expressions',
  'scientific vocabulary',
  'complex sentence structure',
  'correlative expressions',
  'alternative conditionals',
  'formal register'
] as const 