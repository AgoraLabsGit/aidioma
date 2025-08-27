# Archive Notice: 00-rules Directory

**Archive Date**: $(date +%Y-%m-%d)
**Status**: DEPRECATED - Content Migrated to `.cursor` Directory

## Migration Summary

This directory has been **deprecated** and all content has been successfully migrated to the `.cursor` directory for active cursor rule enforcement.

### Content Migration Map

| Original File | Migrated To | Status |
|---------------|-------------|---------|
| `ai-integration.md` | `.cursor/ai-integration-standards.mdc` | ✅ Migrated |
| `development-standards.md` | Distributed across multiple `.cursor/*.mdc` files | ✅ Migrated |
| `final-review.md` | `.cursor/workflow-standards.mdc` | ✅ Migrated |
| `framework-compliance.md` | `.cursor/workflow-standards.mdc` | ✅ Migrated |
| `library-research.md` | `.cursor/library-research-standards.mdc` | ✅ Migrated |
| `project-overview.md` | `.cursor/project-context.mdc` | ✅ Migrated |
| `quick-reference.md` | `.cursor/README.mdc` | ✅ Migrated |
| `typescript-standards.md` | `.cursor/typescript-standards.mdc` | ✅ Enhanced |
| `README.md` | `.cursor/README.mdc` | ✅ Updated |

## Why This Migration?

1. **Active Enforcement**: `.cursor` rules are actively enforced during development
2. **Centralized Location**: All cursor rules in one dedicated directory
3. **Proper Format**: `.mdc` files follow cursor best practices [[memory:7421402]]
4. **Reduced Duplication**: Single source of truth for development standards
5. **Better Organization**: Clear separation between enforced rules and documentation

## Current Rule Location

**All development rules are now located in**: `.cursor/`

- **Main Overview**: `.cursor/README.mdc`
- **Project Context**: `.cursor/project-context.mdc`
- **Library Research**: `.cursor/library-research-standards.mdc`
- **Workflow Standards**: `.cursor/workflow-standards.mdc`
- **Plus 11 other specialized rule files**

## For Developers

❌ **Do NOT reference files in this archive**
✅ **Use `.cursor/*.mdc` files for current standards**

This archive is preserved for historical reference only. All active development should follow the cursor rules in the `.cursor` directory.
