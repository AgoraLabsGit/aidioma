# AIdioma Development Backup Strategy

## 🎯 **Philosophy**: Never lose working functionality

## 🔀 **When to Use What**

### **Git Branches** (Preferred - 90% of work)
```bash
git checkout -b feature/component-name  # Major features, refactoring, multi-file changes
```

### **File Backups** (Quick experiments - 10% of work)  
```bash
cp Component.tsx Component_BACKUP_WORKING.tsx  # Rapid prototyping, single-file tweaks
```

## 📝 **Quick Commands**

### **File Backup Workflow**
```bash
# Before experiment
cp PracticePage.tsx PracticePage_BACKUP_WORKING.tsx

# If experiment fails
cp PracticePage_BACKUP_WORKING.tsx PracticePage.tsx

# If experiment succeeds  
rm PracticePage_BACKUP_WORKING.tsx && git add -A && git commit
```

### **Git Branch Workflow**
```bash
# Major feature
git checkout -b feature/practice-hints
# Work with frequent commits
git checkout main && git merge feature/practice-hints
```

## 📦 **Naming Conventions**
- `Component_BACKUP_WORKING.tsx` - Last working state
- `Component_FEATURE_SOURCE.tsx` - Archived feature reference  
- `Component_ARCHIVE_YYYY_MM_DD.tsx` - Historical versions

## 📁 **Current Status**
- **PracticePageV1_FEATURE_SOURCE.tsx** - ✅ Archived (features merged into main)
- Can be removed once main version is stable

## ⚡ **TL;DR**
- **Big changes**: Use Git branches  
- **Quick tests**: Copy file, experiment, restore if needed
- **Golden rule**: Always have a way back to working code 