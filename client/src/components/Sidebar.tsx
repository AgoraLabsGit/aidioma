import React from 'react';
import { useLocation } from 'wouter';
import { 
  BookOpen,
  Book,
  Brain,
  MessageCircle,
  TrendingUp,
  Award,
  Settings
} from 'lucide-react';
import type { CurrentUser } from '../types';

interface SidebarProps {
  currentUser: CurrentUser;
}

const navigationItems = [
  { icon: BookOpen, label: 'Practice', path: '/practice' },
  { icon: Book, label: 'Reading', path: '/reading' },
  { icon: Brain, label: 'Memorize', path: '/memorize' },
  { icon: MessageCircle, label: 'Conversations', path: '/conversations' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ currentUser }: SidebarProps) {
  const [location, setLocation] = useLocation();

  return (
    <aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col fixed left-0 top-16 bottom-0 z-40">
      {/* Navigation */}
      <nav className="flex-1 p-4 pt-8">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === location || (location === '/' && item.path === '/practice');
            
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
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-gray-200 text-sm font-semibold">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-sm text-foreground">{currentUser.email}</div>
            <div className="text-xs text-muted-foreground">Level {currentUser.level} • {currentUser.totalPoints} pts</div>
          </div>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors block w-full text-center">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
