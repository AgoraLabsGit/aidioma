# Spanish Learning App - Language Data Organization Framework

## Overview
A comprehensive multi-dimensional framework for organizing Spanish language content that supports adaptive learning, AI content generation, and precise progress tracking.

## Core Framework Dimensions

### 1. **Proficiency Levels** (Primary Hierarchy)

#### Beginner (A1-A2)
- **Level 1**: Basic present tense, ser/estar, common nouns
- **Level 2**: Regular preterite, basic adjectives, simple connectors
- **Level 3**: Present progressive, irregular preterite, basic reflexives

#### Intermediate (B1-B2)
- **Level 4**: Imperfect tense, present perfect, complex sentence structures
- **Level 5**: Future tense, conditional, subjunctive introduction
- **Level 6**: Advanced subjunctive, imperative, complex reflexives

#### Advanced (C1-C2)
- **Level 7**: Nuanced subjunctive usage, regional variations
- **Level 8**: Literary tenses, formal register, cultural expressions
- **Level 9**: Native-level complexity, idiomatic expressions

---

## 2. **Grammatical Categories** (Secondary Classification)

### **A. Verb Tenses & Moods**

#### Simple Tenses
```json
{
  "presente": {
    "code": "PRES",
    "levels": [1, 2, 3],
    "complexity": "basic",
    "subcategories": ["regular", "irregular", "stem_changing"]
  },
  "preterito_indefinido": {
    "code": "PRET",
    "levels": [2, 3, 4],
    "complexity": "intermediate",
    "subcategories": ["regular", "irregular", "spelling_changes"]
  },
  "preterito_imperfecto": {
    "code": "IMP",
    "levels": [4, 5],
    "complexity": "intermediate",
    "subcategories": ["regular", "irregular", "descriptive", "habitual"]
  },
  "futuro_simple": {
    "code": "FUT",
    "levels": [5, 6],
    "complexity": "intermediate",
    "subcategories": ["regular", "irregular", "probability"]
  },
  "condicional_simple": {
    "code": "COND",
    "levels": [5, 6, 7],
    "complexity": "advanced",
    "subcategories": ["regular", "irregular", "politeness", "probability"]
  }
}
```

#### Compound Tenses
```json
{
  "preterito_perfecto": {
    "code": "PERF",
    "levels": [4, 5],
    "complexity": "intermediate",
    "subcategories": ["recent_past", "life_experience", "unfinished_time"]
  },
  "preterito_pluscuamperfecto": {
    "code": "PLUP",
    "levels": [6, 7],
    "complexity": "advanced",
    "subcategories": ["past_perfect", "reported_speech"]
  },
  "futuro_perfecto": {
    "code": "FUT_PERF",
    "levels": [7, 8],
    "complexity": "advanced",
    "subcategories": ["future_perfect", "probability_past"]
  }
}
```

#### Subjunctive Mood
```json
{
  "presente_subjuntivo": {
    "code": "SUBJ_PRES",
    "levels": [5, 6, 7],
    "complexity": "advanced",
    "subcategories": ["doubt", "emotion", "desire", "influence", "pending_actions"]
  },
  "preterito_imperfecto_subjuntivo": {
    "code": "SUBJ_IMP",
    "levels": [6, 7, 8],
    "complexity": "advanced",
    "subcategories": ["hypothetical", "politeness", "past_subjunctive"]
  }
}
```

#### Imperative & Infinitive Constructions
```json
{
  "imperativo": {
    "code": "IMP_CMD",
    "levels": [4, 5, 6],
    "complexity": "intermediate",
    "subcategories": ["affirmative", "negative", "formal", "informal"]
  },
  "gerundio": {
    "code": "GER",
    "levels": [3, 4, 5],
    "complexity": "intermediate",
    "subcategories": ["progressive", "manner", "simultaneous_action"]
  },
  "ir_a_infinitivo": {
    "code": "IR_A",
    "levels": [2, 3],
    "complexity": "basic",
    "subcategories": ["near_future", "intention"]
  },
  "infinitivo_compuesto": {
    "code": "INF_COMP",
    "levels": [7, 8],
    "complexity": "advanced",
    "subcategories": ["perfect_infinitive", "passive_infinitive"]
  }
}
```

### **B. Verb Types & Patterns**

```json
{
  "verb_patterns": {
    "regular_ar": {
      "complexity": "basic",
      "levels": [1, 2, 3],
      "examples": ["hablar", "caminar", "estudiar"]
    },
    "regular_er": {
      "complexity": "basic", 
      "levels": [1, 2, 3],
      "examples": ["comer", "beber", "aprender"]
    },
    "regular_ir": {
      "complexity": "basic",
      "levels": [1, 2, 3],
      "examples": ["vivir", "escribir", "recibir"]
    },
    "stem_changing_e_ie": {
      "complexity": "intermediate",
      "levels": [2, 3, 4],
      "examples": ["pensar", "querer", "preferir"]
    },
    "stem_changing_o_ue": {
      "complexity": "intermediate",
      "levels": [2, 3, 4],
      "examples": ["poder", "dormir", "volver"]
    },
    "stem_changing_e_i": {
      "complexity": "intermediate",
      "levels": [3, 4, 5],
      "examples": ["pedir", "servir", "repetir"]
    },
    "irregular_common": {
      "complexity": "basic",
      "levels": [1, 2, 3],
      "examples": ["ser", "estar", "tener", "hacer"]
    },
    "irregular_complex": {
      "complexity": "advanced",
      "levels": [4, 5, 6],
      "examples": ["caber", "asir", "yacer"]
    },
    "reflexive_true": {
      "complexity": "intermediate",
      "levels": [3, 4, 5],
      "examples": ["lavarse", "vestirse", "levantarse"]
    },
    "reflexive_reciprocal": {
      "complexity": "advanced",
      "levels": [5, 6, 7],
      "examples": ["quererse", "ayudarse", "conocerse"]
    },
    "pronominal_verbs": {
      "complexity": "advanced",
      "levels": [6, 7, 8],
      "examples": ["acordarse", "quejarse", "arrepentirse"]
    }
  }
}
```

### **C. Word Types & Grammatical Categories**

```json
{
  "word_types": {
    "sustantivos": {
      "gender": ["masculino", "feminino", "ambiguo"],
      "number": ["singular", "plural"],
      "complexity_factors": ["gender_agreement", "irregular_plural", "compound_nouns"],
      "subcategories": ["concreto", "abstracto", "colectivo", "propio"]
    },
    "adjetivos": {
      "agreement": ["gender", "number"],
      "position": ["pre_noun", "post_noun", "both"],
      "subcategories": ["descriptivo", "posesivo", "demostrativo", "numeral", "indefinido"],
      "comparison": ["comparativo", "superlativo"]
    },
    "pronombres": {
      "types": ["personal", "posesivo", "demostrativo", "relativo", "interrogativo", "indefinido"],
      "positions": ["subject", "direct_object", "indirect_object", "prepositional"],
      "complexity": ["simple", "complex_placement", "double_pronouns"]
    },
    "conectores": {
      "function": ["additive", "adversative", "causal", "temporal", "conditional"],
      "register": ["formal", "informal", "academic"],
      "complexity": ["basic", "intermediate", "advanced"],
      "examples": {
        "basic": ["y", "pero", "porque", "cuando"],
        "intermediate": ["sin embargo", "aunque", "mientras", "además"],
        "advanced": ["no obstante", "por consiguiente", "a pesar de que"]
      }
    },
    "preposiciones": {
      "simple": ["a", "de", "en", "con", "por", "para"],
      "compound": ["delante de", "detrás de", "encima de"],
      "usage": ["movement", "location", "time", "manner", "cause"]
    },
    "adverbios": {
      "types": ["manner", "time", "place", "quantity", "affirmation", "negation", "doubt"],
      "formation": ["simple", "derived_mente", "phrases"],
      "position": ["flexible", "fixed"]
    }
  }
}
```

---

## 3. **Content Topics** (Thematic Organization)

### **Universal Topics** (All Levels)
```json
{
  "daily_life": {
    "beginner": ["greetings", "family", "house", "food_basic", "numbers", "time"],
    "intermediate": ["routines", "hobbies", "health", "technology", "environment"],
    "advanced": ["lifestyle_choices", "social_issues", "cultural_values"]
  },
  "travel": {
    "beginner": ["transportation", "hotel", "restaurant", "directions"],
    "intermediate": ["planning_trips", "cultural_experiences", "problems_solutions"],
    "advanced": ["travel_philosophy", "cultural_immersion", "sustainable_tourism"]
  },
  "work_education": {
    "beginner": ["jobs", "school_subjects", "workplace_objects"],
    "intermediate": ["career_development", "education_system", "workplace_culture"],
    "advanced": ["professional_relationships", "academic_discourse", "industry_trends"]
  },
  "culture_society": {
    "beginner": ["celebrations", "traditions", "basic_customs"],
    "intermediate": ["regional_differences", "social_norms", "historical_context"],
    "advanced": ["cultural_analysis", "social_movements", "philosophical_concepts"]
  }
}
```

---

## 4. **Sentence Complexity Metrics**

### **Structural Complexity**
```json
{
  "sentence_structure": {
    "simple": {
      "pattern": "Subject + Verb + Object",
      "clauses": 1,
      "complexity_score": 1-2,
      "levels": [1, 2, 3]
    },
    "compound": {
      "pattern": "Independent + Connector + Independent",
      "clauses": 2,
      "complexity_score": 3-4,
      "levels": [3, 4, 5]
    },
    "complex": {
      "pattern": "Main + Subordinate clause",
      "clauses": "2+",
      "complexity_score": 5-6,
      "levels": [4, 5, 6]
    },
    "compound_complex": {
      "pattern": "Multiple main + Multiple subordinate",
      "clauses": "3+",
      "complexity_score": 7-9,
      "levels": [6, 7, 8, 9]
    }
  }
}
```

### **Vocabulary Complexity**
```json
{
  "vocabulary_tiers": {
    "tier_1": {
      "description": "High frequency, everyday words",
      "examples": ["casa", "comer", "bueno", "grande"],
      "levels": [1, 2, 3],
      "frequency": "top_1000"
    },
    "tier_2": {
      "description": "Academic/literary vocabulary",
      "examples": ["analizar", "considerable", "establecer"],
      "levels": [4, 5, 6, 7],
      "frequency": "top_5000"
    },
    "tier_3": {
      "description": "Domain-specific, technical terms",
      "examples": ["fotosíntesis", "jurisprudencia", "epistemología"],
      "levels": [7, 8, 9],
      "frequency": "specialized"
    }
  }
}
```

---

## 5. **Database Schema Implementation**

### **Enhanced Sentences Table**
```sql
CREATE TABLE sentences (
    id INTEGER PRIMARY KEY,
    english_text TEXT NOT NULL,
    spanish_translations JSON NOT NULL, -- Array of accepted translations

    -- Primary Classification
    proficiency_level INTEGER NOT NULL, -- 1-9
    difficulty_score DECIMAL(3,1), -- 1.0-9.0 (more granular)

    -- Grammatical Classification  
    primary_tense VARCHAR(20), -- Main tense focus
    secondary_tenses JSON, -- Additional tenses in sentence
    verb_patterns JSON, -- Array of verb types present

    -- Word Type Analysis
    word_types JSON, -- Count/percentage of each word type
    vocabulary_tier DECIMAL(2,1), -- Average vocabulary complexity

    -- Structural Metrics
    word_count INTEGER,
    clause_count INTEGER,
    sentence_structure VARCHAR(20), -- simple, compound, complex, compound_complex

    -- Thematic Classification
    topic_primary VARCHAR(50),
    topic_secondary JSON, -- Additional relevant topics

    -- Content Metadata
    created_by VARCHAR(20), -- AI, human, community
    regional_variant VARCHAR(20), -- neutral, mexican, argentinian, etc.
    register VARCHAR(20), -- formal, informal, academic, colloquial

    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(4,2), -- Across all users
    avg_attempts DECIMAL(3,1),

    -- AI Metadata
    generation_prompt TEXT, -- For AI-generated sentences
    quality_score DECIMAL(3,1), -- Human/AI evaluation of sentence quality

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Grammar Rules Reference Table**
```sql
CREATE TABLE grammar_rules (
    id INTEGER PRIMARY KEY,
    rule_code VARCHAR(20) UNIQUE, -- PRES_REG, SUBJ_DOUBT, etc.
    rule_name VARCHAR(100),
    category VARCHAR(50), -- tense, mood, syntax, etc.
    complexity_level INTEGER, -- 1-9
    prerequisite_rules JSON, -- Array of rule_codes
    explanation_short TEXT,
    explanation_detailed TEXT,
    examples JSON, -- Array of example sentences
    common_errors JSON, -- Typical mistakes for this rule
    practice_priority INTEGER -- Learning sequence priority
);
```

### **Word Database Tables**
```sql
CREATE TABLE vocabulary (
    id INTEGER PRIMARY KEY,
    spanish_word VARCHAR(100),
    english_translations JSON,
    word_type VARCHAR(20), -- noun, verb, adjective, etc.
    gender VARCHAR(10), -- for nouns/adjectives
    frequency_rank INTEGER, -- 1-50000 based on corpus frequency
    difficulty_level INTEGER, -- 1-9
    topic_tags JSON,
    irregularity_notes TEXT,
    conjugation_pattern VARCHAR(50), -- for verbs
    etymology VARCHAR(100),
    regional_variants JSON
);

CREATE TABLE verb_conjugations (
    id INTEGER PRIMARY KEY,
    verb_id INTEGER REFERENCES vocabulary(id),
    tense_code VARCHAR(20),
    person INTEGER, -- 1, 2, 3
    number VARCHAR(10), -- singular, plural
    form VARCHAR(100), -- The actual conjugated form
    irregularity_type VARCHAR(50),
    notes TEXT
);
```

---

## 6. **AI Content Generation Framework**

### **Prompt Templates by Category**
```json
{
  "sentence_generation": {
    "basic_present": {
      "template": "Generate a {word_count}-word Spanish sentence using present tense regular verbs about {topic}. Include common vocabulary suitable for level {level} learners.",
      "constraints": ["no_subjunctive", "common_vocabulary", "simple_structure"],
      "target_grammar": ["PRES_REG"]
    },
    "intermediate_mixed": {
      "template": "Create a Spanish sentence combining {primary_tense} and {secondary_tense} about {topic}, appropriate for intermediate learners. Include one reflexive verb.",
      "constraints": ["mixed_tenses", "intermediate_vocabulary", "compound_structure"],
      "target_grammar": ["PRET", "IMP", "REFL"]
    },
    "advanced_subjunctive": {
      "template": "Generate an advanced Spanish sentence using present subjunctive in a {subjunctive_trigger} context about {topic}. Include formal register vocabulary.",
      "constraints": ["subjunctive_required", "formal_register", "complex_structure"],
      "target_grammar": ["SUBJ_PRES", "FORMAL_REG"]
    }
  }
}
```

### **Adaptive Content Selection Algorithm**
```python
def select_next_sentence(user_profile, session_goals):
    """
    Select optimal sentence based on:
    - User's current proficiency level
    - Recent performance patterns  
    - Learning objectives for session
    - Grammar rules needing reinforcement
    """

    # Calculate user's strength/weakness map
    grammar_scores = analyze_user_performance(user_profile)

    # Identify target grammar points
    target_rules = identify_learning_targets(grammar_scores, session_goals)

    # Filter sentence pool
    candidate_sentences = filter_sentences(
        level_range=(user_profile.level - 1, user_profile.level + 1),
        grammar_rules=target_rules,
        topics=user_profile.preferred_topics,
        avoid_recent=True
    )

    # Score and rank candidates
    scored_sentences = score_sentences(candidate_sentences, user_profile)

    return select_optimal_sentence(scored_sentences)
```

---

## 7. **Progress Tracking Framework**

### **Skill Progression Matrix**
```json
{
  "user_skills": {
    "tense_mastery": {
      "presente": {"attempts": 45, "success_rate": 0.89, "mastery_level": "proficient"},
      "preterito": {"attempts": 23, "success_rate": 0.67, "mastery_level": "developing"},
      "imperfecto": {"attempts": 12, "success_rate": 0.42, "mastery_level": "novice"}
    },
    "grammar_rules": {
      "gender_agreement": {"mastery": 0.85, "confidence": "high"},
      "ser_vs_estar": {"mastery": 0.73, "confidence": "medium"},
      "subjunctive_doubt": {"mastery": 0.34, "confidence": "low"}
    },
    "vocabulary_tiers": {
      "tier_1": {"known_percentage": 0.92, "active_use": 0.78},
      "tier_2": {"known_percentage": 0.64, "active_use": 0.45},
      "tier_3": {"known_percentage": 0.23, "active_use": 0.12}
    }
  }
}
```

---

## 8. **Implementation Recommendations**

### **Phase 1: Core Framework** 
1. Implement enhanced database schema
2. Create grammar rules reference system
3. Build basic content classification pipeline
4. Develop adaptive sentence selection algorithm

### **Phase 2: AI Integration**
1. Train content generation prompts for each category
2. Implement grammar-aware evaluation system  
3. Build automatic difficulty assessment
4. Create personalized learning path generation

### **Phase 3: Advanced Features**
1. Regional variant support
2. Cultural context integration
3. Advanced analytics dashboard
4. Community content contribution system

### **Success Metrics**
- **Content Quality**: 90%+ appropriate difficulty classification
- **Learning Efficiency**: 25% improvement in skill acquisition rate
- **User Engagement**: 40% increase in session completion
- **Grammar Coverage**: 95% of essential grammar rules represented

---

This framework provides the structure needed for sophisticated content management while remaining practical for implementation in your React/Node.js application.
