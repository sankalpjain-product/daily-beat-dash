import { ReactNode } from 'react';
import { ArrowLeft, Bell, MoreVertical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
}

export function MobileLayout({ children, title, showBack = false }: MobileLayoutProps) {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="status-bar" />
      
      {/* App Header */}
      <header className="app-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="touch-feedback">
              <ArrowLeft size={24} />
            </button>
          ) : null}
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {!showBack && (
              <p className="text-sm opacity-80">{currentUser.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="touch-feedback relative">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full" />
          </button>
          <button className="touch-feedback">
            <MoreVertical size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Version Footer */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-primary text-primary-foreground text-xs py-1 px-4 flex justify-between">
        <span>V: 1.0.0</span>
        <span>Last Synced: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-14 bg-primary border-t border-primary-foreground/20 flex items-center justify-around">
        <button className="flex flex-col items-center gap-0.5 text-primary-foreground/70">
          <div className="w-6 h-0.5 bg-current" />
          <div className="w-6 h-0.5 bg-current" />
          <div className="w-6 h-0.5 bg-current" />
        </button>
        <button className="w-10 h-10 border-2 border-primary-foreground/70 rounded" />
        <button className="w-0 h-0 border-l-8 border-r-8 border-b-[14px] border-l-transparent border-r-transparent border-b-primary-foreground/70" />
      </div>
    </div>
  );
}
