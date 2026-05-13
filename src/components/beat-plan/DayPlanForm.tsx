import { useState } from 'react';
import { DayPlan, Visit, DAYS_OF_WEEK, VISIT_PURPOSE_LABELS } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { X, Plus, MapPin, Users, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { VisitForm } from './VisitForm';

interface DayPlanFormProps {
  day: DayPlan;
  onSave: (day: DayPlan) => void;
  onClose: () => void;
}

export function DayPlanForm({ day, onSave, onClose }: DayPlanFormProps) {
  const [visits, setVisits] = useState<Visit[]>(day.visits);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);

  const dayName = DAYS_OF_WEEK[day.dayOfWeek];
  const dateStr = format(parseISO(day.date), 'dd MMM yyyy');

  const handleAddVisit = (visit: Visit) => {
    setVisits([...visits, visit]);
    setIsAddingVisit(false);
  };

  const handleUpdateVisit = (updatedVisit: Visit) => {
    setVisits(visits.map(v => v.id === updatedVisit.id ? updatedVisit : v));
    setEditingVisit(null);
  };

  const handleDeleteVisit = (visitId: string) => {
    setVisits(visits.filter(v => v.id !== visitId));
    setEditingVisit(null);
  };

  const handleSave = () => {
    onSave({
      ...day,
      visits,
      // Update legacy fields for backward compatibility
      clusters: visits.filter(v => v.cluster).map(v => v.cluster!),
      agents: visits.flatMap(v => v.agents),
      purposes: [...new Set(visits.flatMap(v => v.purposes))],
      timeSlots: visits.filter(v => v.timeSlot).map(v => v.timeSlot!),
    });
  };

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-md max-h-[90vh] rounded-t-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="touch-feedback">
            <X size={24} />
          </button>
          <div className="text-center">
            <h2 className="font-semibold">{dayName}</h2>
            <p className="text-sm opacity-80">{dateStr}</p>
          </div>
          <button onClick={handleSave} className="touch-feedback font-medium">
            Save
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] p-4 space-y-4">
          {/* Visits List */}
          {visits.map((visit, index) => (
            <div
              key={visit.id}
              onClick={() => setEditingVisit(visit)}
              className="bg-muted rounded-lg p-3 space-y-2 cursor-pointer touch-feedback"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Visit {index + 1}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              
              {visit.cluster && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-muted-foreground mt-0.5" />
                  <span className="text-sm">{visit.cluster.name}</span>
                </div>
              )}
              
              {visit.agents.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users size={14} className="text-muted-foreground mt-0.5" />
                  <span className="text-sm">{visit.agents.map(a => a.name).join(', ')}</span>
                </div>
              )}
              
              {visit.timeSlot && (
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-muted-foreground mt-0.5" />
                  <span className="text-sm">{visit.timeSlot.start} - {visit.timeSlot.end}</span>
                </div>
              )}
              
              {visit.purposes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {visit.purposes.map(p => (
                    <span key={p} className="chip text-xs">{VISIT_PURPOSE_LABELS[p]}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add Visit Button */}
          <button
            onClick={() => setIsAddingVisit(true)}
            className="w-full border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-2 text-muted-foreground touch-feedback"
          >
            <Plus size={20} />
            <span>Add Visit</span>
          </button>

          {visits.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No visits planned for this day yet.
              <br />
              Tap "Add Visit" to plan your first visit.
            </p>
          )}
        </div>
      </div>

      {/* Visit Form Modal */}
      {(isAddingVisit || editingVisit) && (
        <VisitForm
          visit={editingVisit || undefined}
          onSave={editingVisit ? handleUpdateVisit : handleAddVisit}
          onDelete={editingVisit ? () => handleDeleteVisit(editingVisit.id) : undefined}
          onCancel={() => {
            setIsAddingVisit(false);
            setEditingVisit(null);
          }}
        />
      )}
    </div>
  );
}
