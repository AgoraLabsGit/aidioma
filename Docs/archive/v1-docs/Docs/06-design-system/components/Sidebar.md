# Sidebar Component
## Navigation Sidebar with User Profile

### **Overview**
The Sidebar component provides consistent navigation across all pages with a user profile section at the bottom. It's responsive and hidden on mobile devices.

### **Implementation**
```tsx
interface SidebarProps {
  currentUser: {
    email: string
    level: number
    points: number
  }
}

function Sidebar({ currentUser }: SidebarProps) {
  const [location, setLocation] = useLocation()
  
  const navigationItems = [
    { icon: BookOpen, label: 'Practice', path: '/practice' },
    { icon: Book, label: 'Reading', path: '/reading' },
    { icon: Brain, label: 'Memorize', path: '/memorize' },
    { icon: MessageCircle, label: 'Conversations', path: '/conversations' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: Award, label: 'Achievements', path: '/achievements' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4 pt-8">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = item.path === location || (location === '/' && item.path === '/practice')
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => setLocation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-gray-200 text-sm font-semibold">
            {getInitials(currentUser.email)}
          </div>
          <div className="flex-1">
            <div className="text-sm text-foreground">{currentUser.email}</div>
            <div className="text-xs text-muted-foreground">
              Level {currentUser.level} • {currentUser.points} pts
            </div>
          </div>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors block w-full text-center">
          Sign Out
        </button>
      </div>
    </aside>
  )
}
```

### **Props Interface**
```tsx
interface SidebarProps {
  currentUser: {
    email: string
    level: number
    points: number
  }
}
```

### **Key Features**
- **Responsive Design**: Hidden on mobile (`hidden md:flex`)
- **Active State Management**: Highlights current page
- **Consistent Width**: Fixed `w-64` to match header logo section
- **Navigation Integration**: Uses Wouter for routing
- **User Profile**: Shows user info and sign out option

### **Navigation Items**
The sidebar includes 7 main navigation items:
1. **Practice** (`/practice`) - BookOpen icon
2. **Reading** (`/reading`) - Book icon  
3. **Memorize** (`/memorize`) - Brain icon
4. **Conversations** (`/conversations`) - MessageCircle icon
5. **Progress** (`/progress`) - TrendingUp icon
6. **Achievements** (`/achievements`) - Award icon
7. **Settings** (`/settings`) - Settings icon

### **Styling States**

#### **Active Navigation Item**
```css
bg-accent text-accent-foreground font-medium
```

#### **Inactive Navigation Item**
```css
text-muted-foreground hover:text-foreground hover:bg-accent/50
```

#### **Hover Transitions**
All interactive elements use `transition-colors` for smooth state changes.

### **User Profile Section**
- **Avatar**: Circular with user initials, blue background
- **User Info**: Email and level/points display
- **Sign Out**: Centered button with hover states

### **Responsive Behavior**
- **Desktop (md:+)**: Full sidebar visible with `w-64` width
- **Mobile**: Completely hidden to save space
- **Tablet**: Uses desktop layout

### **Layout Integration**
```tsx
<div className="flex flex-1">
  {/* Sidebar */}
  <Sidebar currentUser={currentUser} />
  
  {/* Main Content */}
  <main className="flex-1 flex flex-col">
    {/* Page content */}
  </main>
</div>
```

### **Dependencies**
- Wouter routing (`useLocation`)
- Lucide React icons
- User state management
- Tailwind CSS classes

### **Implementation Notes**
- Must be placed inside the content area div (after header)
- Requires user state to be passed as prop
- Navigation logic should be consistent across all pages
- Icon size standardized at `w-5 h-5`

### **Accessibility**
- Uses semantic `<nav>` and `<aside>` elements
- Proper button roles for navigation items
- Screen reader friendly with icon + text labels
- Keyboard navigation support
- Color contrast compliant
