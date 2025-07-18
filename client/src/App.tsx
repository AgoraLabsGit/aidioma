import { Router, Route, Link, useLocation } from 'wouter'
import { BookOpen, BarChart3, Settings, User, Trophy, Brain } from 'lucide-react'
import PracticeInterface from './components/PracticeInterface'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          <Route path="/" component={PracticeInterface} />
          <Route path="/practice" component={PracticeInterface} />
          <Route path="/stats" component={StatsView} />
          <Route path="/profile" component={ProfileView} />
          <Route path="/settings" component={SettingsView} />
        </main>
      </div>
    </Router>
  )
}

function Sidebar() {
  const [location] = useLocation()
  
  const navItems = [
    { icon: BookOpen, label: 'Practice', path: '/practice' },
    { icon: Brain, label: 'Learn', path: '/learn' },
    { icon: BarChart3, label: 'Statistics', path: '/stats' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">AIdioma</h1>
        <p className="text-sm text-muted-foreground">Learn Spanish with AI</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location === item.path
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Guest User</p>
            <p className="text-xs text-muted-foreground">Beginner Level</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Placeholder components for other routes
function StatsView() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <div className="card p-6">
        <p className="text-muted-foreground">Statistics view coming soon...</p>
      </div>
    </div>
  )
}

function ProfileView() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="card p-6">
        <p className="text-muted-foreground">Profile view coming soon...</p>
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="card p-6">
        <p className="text-muted-foreground">Settings view coming soon...</p>
      </div>
    </div>
  )
}

export default App
