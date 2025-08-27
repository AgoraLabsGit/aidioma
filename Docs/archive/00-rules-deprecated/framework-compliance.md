# Framework Compliance Workflow
## Development Workflow & Quality Assurance

> **Note**: Development standards, coding patterns, and implementation requirements are now enforced through [Cursor Rules](./.cursor/README.mdc). This document focuses on workflow procedures and quality gates.

---

## 🏃 **Development Session Workflow**

### **Start of Development Session**
```bash
git pull origin main
npm install  # if package.json changed
npx tsc --noEmit --skipLibCheck
npm test
npm run dev
```

### **Environment Setup Verification**
- [ ] Development environment running properly
- [ ] Database connection established
- [ ] All tests passing: `npm test`
- [ ] No console errors in browser
- [ ] TypeScript compilation clean

### **End of Development Session**
```bash
npx tsc --noEmit --skipLibCheck
npm test
npm run lint
npm run build
git add .
git commit -m "descriptive message"
git push
```

---

## 📋 **Pull Request Requirements**

### **PR Description Requirements**
- [ ] Clear description of what and why changes were made
- [ ] Screenshots or recordings for UI changes
- [ ] Breaking changes clearly documented
- [ ] Performance impact noted (if applicable)
- [ ] Test coverage maintained or improved

### **PR Review Checklist**
- [ ] Code follows established patterns from cursor rules
- [ ] Performance implications considered and measured
- [ ] Security vulnerabilities addressed
- [ ] Accessibility standards maintained (WCAG 2.1 AA)
- [ ] Mobile experience tested and responsive
- [ ] Documentation updated for any API/interface changes

---

## ⚠️ **Critical Failure Points**

### **Automatic Rejection Criteria** *(Zero Tolerance)*
- TypeScript compilation errors
- Breaking existing functionality without migration path
- Security vulnerabilities (SQL injection, XSS, exposed secrets)
- Performance degradation >20% without justification
- Missing required documentation updates

### **Quality Gates** *(Must Pass Before Merge)*
- [ ] All automated tests passing (>90% coverage maintained)
- [ ] Code review approval from team member
- [ ] Performance benchmarks met (see [performance-standards.mdc](./.cursor/performance-standards.mdc))
- [ ] Security scan completed (no high/critical vulnerabilities)
- [ ] Documentation updated for interface changes

---

## 📚 **Documentation Standards**

### **Documentation Update Requirements**
When making changes, update relevant documentation:
- [ ] Component documentation in design system
- [ ] API documentation for new/changed endpoints
- [ ] Module specifications for interface changes
- [ ] Architecture diagrams for structural changes
- [ ] README files for setup/usage changes

### **Documentation Quality Standards**
- [ ] Decision rationale documented for complex changes
- [ ] Examples provided for new features or patterns
- [ ] Migration guides for breaking changes
- [ ] API changes documented with before/after examples

---

## 🎯 **Quick Reference**

### **Development Standards Location**
All coding standards, patterns, and requirements are enforced through:
- **Cursor Rules**: [.cursor/README.mdc](./.cursor/README.mdc) *(Main overview)*
- **TypeScript**: [.cursor/typescript-standards.mdc](./.cursor/typescript-standards.mdc) *(Zero `any` policy)*
- **AI Integration**: [.cursor/ai-integration-standards.mdc](./.cursor/ai-integration-standards.mdc) *(Caching required)*
- **Performance**: [.cursor/performance-standards.mdc](./.cursor/performance-standards.mdc) *(Response time limits)*
- **Security**: [.cursor/security-standards.mdc](./.cursor/security-standards.mdc) *(Input validation)*
- **Testing**: [.cursor/testing-standards.mdc](./.cursor/testing-standards.mdc) *(>90% coverage)*

### **Pre-Commit Commands**
```bash
npm run lint                    # Zero warnings required
npm run type-check             # Zero TypeScript errors required  
npm run test                   # >90% coverage required
npm run build                  # Production build must succeed
```

### **Performance Targets** *(Non-Negotiable)*
- **AI Evaluation**: <2000ms response time
- **UI Interactions**: <100ms response time
- **Bundle Size**: <10KB additions preferred, >50KB requires justification
- **Cache Hit Rate**: >80% for AI services

---

**Remember**: This workflow ensures AIdioma maintains exceptional quality standards while scaling efficiently. When in doubt, consult the [cursor rules](./.cursor/README.mdc) for specific implementation guidance.