import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, WeeklyPlan, UserRole, Comment, DayPlan, MOCK_CLUSTERS, MOCK_AGENTS, DAYS_OF_WEEK, Visit, GPSCoordinates } from '@/types/beatPlan';
import { addDays, startOfWeek, format } from 'date-fns';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  weeklyPlans: WeeklyPlan[];
  currentPlan: WeeklyPlan | null;
  createNewPlan: () => void;
  updateDayPlan: (dayPlan: DayPlan) => void;
  submitPlan: () => void;
  approvePlan: (planId: string) => void;
  sendBackPlan: (planId: string, comment: string) => void;
  addComment: (planId: string, content: string, dayId?: string) => void;
  addCheckIn: (dayId: string, visitId: string, photoUrl: string, location?: GPSCoordinates, notes?: string) => void;
  addVisitToDay: (dayId: string, visit: Visit) => void;
  updateVisit: (dayId: string, visit: Visit) => void;
  deleteVisit: (dayId: string, visitId: string) => void;
}

const ATD_USER: User = {
  id: 'atd1',
  name: 'Rahul Kumar',
  role: 'atd',
  hq: 'Delhi North',
};

const RBM_USER: User = {
  id: 'rbm1',
  name: 'Suresh Sharma',
  role: 'rbm',
  hq: 'Delhi North',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function getNextWeekDates(): { date: string; dayOfWeek: number }[] {
  const nextMonday = startOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 });
  return DAYS_OF_WEEK.map((_, index) => ({
    date: format(addDays(nextMonday, index), 'yyyy-MM-dd'),
    dayOfWeek: index,
  }));
}

function getCurrentWeekDates(): { date: string; dayOfWeek: number }[] {
  const thisMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return DAYS_OF_WEEK.map((_, index) => ({
    date: format(addDays(thisMonday, index), 'yyyy-MM-dd'),
    dayOfWeek: index,
  }));
}

function createEmptyPlan(user: User): WeeklyPlan {
  const weekDates = getNextWeekDates();
  return {
    id: `plan_${Date.now()}`,
    weekStartDate: weekDates[0].date,
    atdId: user.id,
    atdName: user.name,
    hq: user.hq,
    status: 'draft',
    days: weekDates.map(({ date, dayOfWeek }) => ({
      id: `day_${dayOfWeek}_${Date.now()}`,
      dayOfWeek,
      date,
      visits: [],
      clusters: [],
      agents: [],
      purposes: [],
      timeSlots: [],
    })),
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Sample existing plan for demo - using current week and approved status for testing check-in
function createSamplePlan(user: User): WeeklyPlan {
  const weekDates = getCurrentWeekDates();
  return {
    id: 'plan_sample_1',
    weekStartDate: weekDates[0].date,
    atdId: user.id,
    atdName: user.name,
    hq: user.hq,
    status: 'approved',
    days: weekDates.map(({ date, dayOfWeek }) => ({
      id: `day_${dayOfWeek}_sample`,
      dayOfWeek,
      date,
      visits: [
        {
          id: `visit_${dayOfWeek}_1`,
          cluster: MOCK_CLUSTERS[dayOfWeek % MOCK_CLUSTERS.length],
          agents: [MOCK_AGENTS[dayOfWeek], MOCK_AGENTS[(dayOfWeek + 1) % MOCK_AGENTS.length]],
          purposes: ['sales_support', 'stock_check'] as any,
          timeSlot: { start: '10:00', end: '13:00' },
        },
        {
          id: `visit_${dayOfWeek}_2`,
          cluster: MOCK_CLUSTERS[(dayOfWeek + 1) % MOCK_CLUSTERS.length],
          agents: [MOCK_AGENTS[(dayOfWeek + 2) % MOCK_AGENTS.length]],
          purposes: ['collection_followup'] as any,
          timeSlot: { start: '14:00', end: '17:00' },
        },
      ],
      clusters: [MOCK_CLUSTERS[dayOfWeek % MOCK_CLUSTERS.length]],
      agents: [MOCK_AGENTS[dayOfWeek], MOCK_AGENTS[(dayOfWeek + 1) % MOCK_AGENTS.length]],
      purposes: ['sales_support', 'stock_check'] as any,
      timeSlots: [{ start: '10:00', end: '13:00' }, { start: '14:00', end: '17:00' }],
    })),
    comments: [],
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(ATD_USER);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([createSamplePlan(ATD_USER)]);
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);

  const switchRole = (role: UserRole) => {
    setCurrentUser(role === 'atd' ? ATD_USER : RBM_USER);
  };

  const createNewPlan = () => {
    const newPlan = createEmptyPlan(currentUser);
    setCurrentPlan(newPlan);
  };

  const updateDayPlan = (updatedDay: DayPlan) => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map(day => 
        day.id === updatedDay.id ? updatedDay : day
      ),
      updatedAt: new Date().toISOString(),
      status: currentPlan.status === 'approved' ? 're_approval_required' as const : currentPlan.status,
    };
    
    setCurrentPlan(updatedPlan);
    setWeeklyPlans(plans => 
      plans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  };

  const submitPlan = () => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      status: 'pending_approval' as const,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setCurrentPlan(updatedPlan);
    setWeeklyPlans(plans => {
      const exists = plans.find(p => p.id === updatedPlan.id);
      if (exists) {
        return plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
      }
      return [...plans, updatedPlan];
    });
  };

  const approvePlan = (planId: string) => {
    setWeeklyPlans(plans =>
      plans.map(p =>
        p.id === planId
          ? { ...p, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const sendBackPlan = (planId: string, comment: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUser.name,
      authorRole: currentUser.role,
      content: comment,
      timestamp: new Date().toISOString(),
    };
    
    setWeeklyPlans(plans =>
      plans.map(p =>
        p.id === planId
          ? { ...p, status: 'sent_back' as const, comments: [...p.comments, newComment] }
          : p
      )
    );
  };

  const addComment = (planId: string, content: string, dayId?: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: new Date().toISOString(),
      dayId,
    };
    
    setWeeklyPlans(plans =>
      plans.map(p =>
        p.id === planId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );
  };

  const addCheckIn = (dayId: string, visitId: string, photoUrl: string, location?: GPSCoordinates, notes?: string) => {
    const planToUpdate = currentPlan || weeklyPlans.find(p => p.status === 'approved');
    if (!planToUpdate) return;
    
    const updatedPlan = {
      ...planToUpdate,
      days: planToUpdate.days.map(day =>
        day.id === dayId
          ? {
              ...day,
              visits: day.visits.map(visit =>
                visit.id === visitId
                  ? {
                      ...visit,
                      checkIn: {
                        timestamp: new Date().toISOString(),
                        photoUrl,
                        location,
                        notes,
                      },
                    }
                  : visit
              ),
            }
          : day
      ),
      updatedAt: new Date().toISOString(),
    };
    
    if (currentPlan) {
      setCurrentPlan(updatedPlan);
    }
    setWeeklyPlans(plans =>
      plans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  };

  const addVisitToDay = (dayId: string, visit: Visit) => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map(day =>
        day.id === dayId
          ? { ...day, visits: [...day.visits, visit] }
          : day
      ),
      updatedAt: new Date().toISOString(),
      status: currentPlan.status === 'approved' ? 're_approval_required' as const : currentPlan.status,
    };
    
    setCurrentPlan(updatedPlan);
    setWeeklyPlans(plans =>
      plans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  };

  const updateVisit = (dayId: string, visit: Visit) => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map(day =>
        day.id === dayId
          ? { ...day, visits: day.visits.map(v => v.id === visit.id ? visit : v) }
          : day
      ),
      updatedAt: new Date().toISOString(),
      status: currentPlan.status === 'approved' ? 're_approval_required' as const : currentPlan.status,
    };
    
    setCurrentPlan(updatedPlan);
    setWeeklyPlans(plans =>
      plans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  };

  const deleteVisit = (dayId: string, visitId: string) => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map(day =>
        day.id === dayId
          ? { ...day, visits: day.visits.filter(v => v.id !== visitId) }
          : day
      ),
      updatedAt: new Date().toISOString(),
      status: currentPlan.status === 'approved' ? 're_approval_required' as const : currentPlan.status,
    };
    
    setCurrentPlan(updatedPlan);
    setWeeklyPlans(plans =>
      plans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        weeklyPlans,
        currentPlan,
        createNewPlan,
        updateDayPlan,
        submitPlan,
        approvePlan,
        sendBackPlan,
        addComment,
        addCheckIn,
        addVisitToDay,
        updateVisit,
        deleteVisit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
