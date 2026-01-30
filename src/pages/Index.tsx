import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, Users, ClipboardCheck, Camera, Settings } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { currentUser, switchRole } = useApp();

  const atdMenuItems = [
    { 
      label: 'Beat Planning', 
      icon: Calendar, 
      path: '/atd/weekly-plan',
      description: 'Create & manage weekly plans'
    },
    { 
      label: 'Check In', 
      icon: Camera, 
      path: '/atd/check-in',
      description: 'Visit check-in with photo'
    },
  ];

  const rbmMenuItems = [
    { 
      label: 'Review Plans', 
      icon: ClipboardCheck, 
      path: '/rbm/review',
      description: 'Approve ATD beat plans'
    },
  ];

  const menuItems = currentUser.role === 'atd' ? atdMenuItems : rbmMenuItems;

  return (
    <MobileLayout title="Welcome!">
      <div className="p-4 space-y-3">
        {/* Menu Items */}
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full menu-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        ))}

        {/* Role Switcher (Demo only) */}
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 text-center">Demo: Switch Role</p>
          <div className="flex gap-2">
            <button
              onClick={() => switchRole('atd')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                currentUser.role === 'atd' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border-2 border-border text-foreground'
              }`}
            >
              ATD View
            </button>
            <button
              onClick={() => switchRole('rbm')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                currentUser.role === 'rbm' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border-2 border-border text-foreground'
              }`}
            >
              RBM View
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
