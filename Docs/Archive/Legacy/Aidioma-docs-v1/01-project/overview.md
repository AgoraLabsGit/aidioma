# AIdioma - Spanish Learning App Overview

## Project Vision
An AI-powered Spanish learning application that transforms traditional language learning through intelligent translation practice, adaptive progression, and gamified engagement.

## Core Value Proposition
- **Real-world relevance**: Practice with authentic, contextual sentences
- **AI-powered evaluation**: Intelligent assessment using OpenAI GPT-4o
- **Adaptive progression**: Content difficulty scales with user performance
- **Gamified learning**: Points, streaks, and progress tracking
- **Strike-inspired UI**: Minimal dark theme optimized for distraction-free learning

## Target Users

### Primary Audience
- **All Spanish proficiency levels** (Beginner → Advanced)
- **Broad age range** (teens to adults)
- **Self-motivated learners** seeking practical translation skills
- **Users wanting flexible, bite-sized learning sessions**

### User Personas
1. **Complete Beginner**: Needs foundational verb conjugation practice
2. **Intermediate Learner**: Wants to improve fluency and accuracy
3. **Advanced Student**: Seeks complex sentence structures and regional variations
4. **Casual Learner**: Enjoys gamified, low-pressure practice

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with Strike-inspired dark theme
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express
- **SQLite (local) / PostgreSQL (production)** with Drizzle ORM
- **Environment-aware authentication** (stubbed for local development)
- **OpenAI GPT-4o** for translation evaluation with 3-tier caching system

### Key Features
- **AI-powered translation evaluation** with 85-90% cost reduction
- **3-tier caching system**: Exact cache → Error templates → AI evaluation
- **Progressive hint system** with verb conjugation hints
- **Adaptive difficulty scaling** based on performance
- **Progress tracking and analytics** with comprehensive user stats
- **Gamified learning experience** with points and streaks

## Repository
- **GitHub**: https://github.com/AgoraLabsGit/AIdioma.v1
- **Status**: Active development, MVP complete
- **License**: MIT

## Success Metrics
- User engagement and retention
- Translation accuracy improvements
- Learning progression rates
- User satisfaction scores