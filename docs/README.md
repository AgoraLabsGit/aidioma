# AIdioma Documentation
## Module-First Spanish Learning Platform

*AIdioma is built on a **modular architecture** where 12 reusable modules power 6 different pages, enabling rapid development and consistent user experience.*

---

## 🧩 **Module-First Architecture**

AIdioma's core strength is its **modular design philosophy**:

- **12 Core Modules** provide all functionality
- **6 Pages** compose modules in different combinations  
- **Cross-page reusability** - same modules used everywhere
- **Standardized APIs** - consistent integration patterns
- **Independent development** - modules can be built and tested separately

### **Quick Module Overview**

| Module Category | Modules | Used By |
|-----------------|---------|---------|
| **🤖 Language/AI** | Translation Evaluation, Progressive Hints, Conversation Suite, Content Processing, AI Cost Optimization | All pages |
| **👤 User Experience** | Gamification, Progress Tracking | All pages |
| **🎨 UI Interface** | Reading Interface, Practice Interface, Conversation UI | Specific pages |

---

## 📚 **Documentation Structure**

### **🎯 Start Here: Core Documentation**

#### **For New Developers**
1. **[Project Overview](./01-project/)** - Understand AIdioma's vision and MVP features
2. **[Module Ecosystem](./02-modules/)** - Learn the modular architecture ⭐
3. **[Development Setup](./05-development/getting-started.md)** - Get coding quickly

#### **For Module Development**
1. **[Module Development Guide](./02-modules/module-development-guide.md)** - How to build modules
2. **[Integration Patterns](./02-modules/integration-patterns.md)** - How modules work together
3. **[API Standards](./05-development/API-documentation.md)** - Consistent interfaces

#### **For Page Development**
1. **[Page Specifications](./04-pages/)** - How modules compose into pages
2. **[Component Library](./06-design/component-library.md)** - UI building blocks
3. **[System Architecture](./03-architecture/)** - Complete system design
4. **[Design System](./06-design/)** - Consistent styling

---

## 🗂️ **Directory Guide**

### **📋 Primary Documentation**

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| **[01-project/](./01-project/)** | Project vision, features, roadmap | Understanding AIdioma's goals |
| **[02-modules/](./02-modules/)** | ⭐ **Module specifications & guides** | Building or understanding modules |
| **[03-architecture/](./03-architecture/)** | ⭐ **System design & database architecture** | System-level understanding |
| **[04-pages/](./04-pages/)** | Page implementations & module usage | Building page features |
| **[05-development/](./05-development/)** | Developer resources & standards | Day-to-day development |
| **[06-design/](./06-design/)** | UI/UX system & components | Frontend development |

### **🗄️ Reference & History**
- **[archive/](./archive/)** - Historical documentation and migration records

---

## 🎯 **Development Workflow**

### **Building a New Feature**
1. **Identify modules needed** - Check [module ecosystem](./02-modules/)
2. **Design module interactions** - Use [integration patterns](./02-modules/integration-patterns.md)
3. **Implement using standards** - Follow [development standards](./05-development/development-standards.md)
4. **Test module independently** - Use [testing strategy](./05-development/testing-strategy.md)
5. **Integrate into pages** - Reference [page specifications](./04-pages/)

### **Common Tasks**
- **Adding a new module** → [Module Development Guide](./02-modules/module-development-guide.md)
- **Modifying existing functionality** → Find the module in [02-modules/](./02-modules/)
- **UI/UX changes** → [Design System](./06-design/)
- **API changes** → [API Documentation](./05-development/API-documentation.md)

---

## 🚀 **Quick Links**

### **Most Frequently Needed**
- [Getting Started](./05-development/getting-started.md) - Developer setup
- [Module Ecosystem](./02-modules/README.md) - All modules overview
- [Component Library](./06-design/component-library.md) - UI components
- [API Documentation](./05-development/API-documentation.md) - Backend interfaces

### **Project Management**
- [Implementation Roadmap](./01-project/implementation-roadmap.md) - Development timeline
- [MVP Features](./01-project/mvp-features.md) - Core functionality specs
- [System Overview](./03-architecture/system-overview.md) - High-level architecture

---

## 💡 **Why Modular Architecture?**

**For Developers:**
- **Faster development** - Reuse modules across pages
- **Easier testing** - Test modules independently
- **Clear separation** - Each module has single responsibility
- **Consistent APIs** - Standardized integration patterns

**For Product:**
- **Rapid feature addition** - Compose existing modules
- **Consistent UX** - Same modules provide same experience
- **Quality assurance** - Well-tested modules reduce bugs
- **Scalable growth** - Add pages by combining modules

---

*This documentation structure reflects AIdioma's modular architecture - start with modules, understand their interactions, then see how they compose into powerful user experiences.* 