# Unified Header Component
## Standard Header for All Pages

### **Overview**
The UnifiedHeader component provides a consistent header structure across all pages in the AIdioma application. It includes responsive logo placement, page titles, and action areas.

### **Implementation**
```tsx
<header className="flex border-b border-border bg-muted">
  {/* Desktop Logo Section */}
  <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Mobile Logo */}
  <div className="md:hidden px-4 py-4 flex items-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Page Title Section */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
      {pageTitle}
    </h1>
  </div>
  
  {/* Actions/Stats Section */}
  <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
    {/* Page-specific content */}
  </div>
</header>
```

### **Props Interface**
```tsx
interface UnifiedHeaderProps {
  pageTitle: string
  icon: React.ComponentType<any>
  children?: React.ReactNode // For action/stats content
}
```

### **Key Features**
- **Responsive Logo**: Desktop shows full logo (w-64), mobile shows compact version
- **Flexible Content**: Page title and action area adapt to content
- **Consistent Spacing**: Standardized padding and gaps across all pages
- **Icon Integration**: Accepts any Lucide React icon component

### **Usage Examples**

#### **Practice Page**
```tsx
<UnifiedHeader 
  pageTitle="Translation Practice" 
  icon={BookOpen}
>
  <div className="px-2 md:px-3 py-1 bg-yellow-500 text-black rounded-lg text-xs font-medium">
    0 day streak
  </div>
  <div className="px-2 md:px-3 py-1 bg-blue-500 text-gray-200 rounded-lg text-xs font-medium">
    ⭐ 0 pts
  </div>
</UnifiedHeader>
```

#### **Reading Page**
```tsx
<UnifiedHeader 
  pageTitle="Reading Practice" 
  icon={Book}
>
  <div className="text-sm text-muted-foreground">
    Progress: 45%
  </div>
</UnifiedHeader>
```

### **Styling Requirements**
- **Background**: `bg-muted` for header background
- **Border**: `border-b border-border` for bottom separation
- **Logo Container**: Exactly `w-64` on desktop for sidebar alignment
- **Typography**: Responsive text sizing (`text-xl md:text-2xl`)

### **Responsive Behavior**
- **Desktop (md:+)**: Shows full logo section with border separator
- **Mobile**: Hides desktop logo, shows compact mobile version
- **Tablet**: Uses desktop layout with responsive typography

### **Accessibility**
- Header uses semantic `<header>` element
- Logo text provides screen reader context
- Proper heading hierarchy with h1 elements
- Color contrast meets WCAG AA standards

### **Implementation Checklist**
- [ ] Uses exact class names as specified
- [ ] Implements responsive logo switching
- [ ] Page title is properly centered with flex-1
- [ ] Action area adapts to content
- [ ] Icon is passed as prop and properly sized
- [ ] Mobile and desktop layouts both functional

### **Dependencies**
- Lucide React icons
- Tailwind CSS utility classes
- React TypeScript
