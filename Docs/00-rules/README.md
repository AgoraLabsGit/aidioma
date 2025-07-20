# AIdioma Development Rules & Guidelines
*Consolidated development standards, protocols, and guidelines*

## Active Rules

### Primary Development Rule
- **`.cursorrules`** (project root) - Main concise rules for Cursor AI (196 lines)

### Detailed Guidelines (Reference Documentation)

#### Core Standards
- `development-standards.md` - Comprehensive development practices and standards
- `framework-compliance.md` - Framework compliance requirements and patterns
- `typescript-standards.mdc` - Detailed TypeScript guidelines and patterns

#### Specialized Rules
- `ai-integration.mdc` - AI service integration patterns and caching requirements
- `design-system.mdc` - UI design system standards and component patterns
- `library-research.mdc` - Dependency evaluation protocol and decision matrix
- `final-review.mdc` - Pre-commit checklist and quality gates

#### Project Context
- `project-overview.mdc` - Core project context and constraints
- `quick-reference.md` - Quick lookup guide for common patterns

## Rule Hierarchy

1. **Primary**: `.cursorrules` in project root (used by Cursor AI)
2. **Reference**: Detailed rules in this directory (for developers and documentation)
3. **Archived**: Historical rules in `archive/v1-docs/` (preserved for reference)

## Usage

### For Cursor AI Development
The main `.cursorrules` file in the project root provides concise, actionable guidance for AI-assisted development.

### For Developer Reference
The detailed files in this directory provide comprehensive guidelines, examples, and decision frameworks for complex scenarios.

### For Team Onboarding
New developers should read:
1. `project-overview.mdc` - Understand AIdioma's architecture
2. `quick-reference.md` - Essential patterns and constraints
3. `development-standards.md` - Comprehensive development practices

## Maintenance

- Primary rule (`.cursorrules`) should remain under 500 lines and focused
- Detailed rules can be comprehensive and include examples
- Update both primary and detailed rules when standards change
- Archive old rules rather than deleting them

## Key Principles

All rules enforce:
- Module-first architecture with component reusability
- TypeScript-first development with zero `any` usage
- Performance requirements (AI <2000ms, UI <100ms)
- AI cost optimization through mandatory caching
- Design system compliance using established tokens only
- Comprehensive testing with >90% coverage requirement 