import { useState } from 'react';
import { DayPlan, DAYS_OF_WEEK, VISIT_PURPOSE_LABELS, Visit } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { MapPin, Users, Clock, CheckCircle, Plus, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { VisitForm } from './VisitForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DayCardProps {
  day: DayPlan;
  onClick?: () => void;
  showCheckIn?: boolean;
  editable?: boolean;
  onAddVisit?: (visit: Visit) => void;
  onUpdateVisit?: (visit: Visit) => void;
  onDeleteVisit?: (visitId: string) => void;
  defaultExpanded?: boolean;
}

function VisitCard({
  visit,
  index,
  onEdit,
}: {
  visit: Visit;
  index: number;
  onEdit?: () => void;
}) {
  const hasCheckIn = !!visit.checkIn;
  return (
    <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Visit {index + 1}
        </span>
        <div className="flex items-center gap-2">
          {hasCheckIn && (
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle size={12} /> Done
            </span>
          )}
          {onEdit && (
            <button onClick={onEdit} className="text-xs text-primary flex items-center gap-1">
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>
      </div>

      {visit.cluster && (
        <div className="flex items-start gap-1.5">
          <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs">{visit.cluster.name}</span>
        </div>
      )}

      {visit.agents.length > 0 && (
        <div className="flex items-start gap-1.5">
          <Users size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs">{visit.agents.map((a) => a.name).join(', ')}</span>
        </div>
      )}

      {visit.timeSlot && (
        <div className="flex items-start gap-1.5">
          <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs">
            {visit.timeSlot.start} - {visit.timeSlot.end}
          </span>
        </div>
      )}

      {visit.purposes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {visit.purposes.map((p) => (
            <span key={p} className="chip text-[10px] py-0.5 px-1.5">
              {VISIT_PURPOSE_LABELS[p]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DayCard({
  day,
  onClick,
  showCheckIn = false,
  editable = false,
  onAddVisit,
  onUpdateVisit,
  onDeleteVisit,
  defaultExpanded = true,
}: DayCardProps) {
  const dayName = DAYS_OF_WEEK[day.dayOfWeek];
  const dateStr = format(parseISO(day.date), 'dd MMM');
  const isEmpty = day.visits.length === 0;
  const checkedInCount = day.visits.filter((v) => v.checkIn).length;

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [addingVisit, setAddingVisit] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  // Non-editable mode: behave like a single tap card (legacy)
  if (!editable) {
    return (
      <div
        className="day-card cursor-pointer touch-feedback animate-fade-in"
        onClick={onClick}
      >
        <div className="day-card-header flex items-center justify-between">
          <span>{dayName}</span>
          <div className="flex items-center gap-2">
            {showCheckIn && day.visits.length > 0 && (
              <span className="text-xs bg-card/20 px-1.5 py-0.5 rounded">
                {checkedInCount}/{day.visits.length}
              </span>
            )}
            <span className="text-sm opacity-80">{dateStr}</span>
          </div>
        </div>

        <div className="day-card-content">
          {isEmpty ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
              <Plus size={16} />
              <span className="text-sm">Tap to add visits</span>
            </div>
          ) : (
            <div className="space-y-2">
              {day.visits.map((visit, index) => (
                <VisitCard key={visit.id} visit={visit} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editable mode: expandable accordion with inline Add/Edit Visit form
  return (
    <div className="bg-card rounded-lg border-2 border-border overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between"
      >
        <span className="font-semibold text-base">{dayName}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">{dateStr}</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Existing visits */}
          {day.visits.map((visit, index) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              index={index}
              onEdit={() => {
                setAddingVisit(false);
                setEditingVisit(visit);
              }}
            />
          ))}

          {/* Add Visit */}
          {!addingVisit && !editingVisit && (
            <button
              onClick={() => setAddingVisit(true)}
              className="w-full border-2 border-dashed border-border rounded-lg py-3 flex items-center justify-center gap-2 text-foreground/80 touch-feedback"
            >
              <Plus size={18} />
              <span className="font-medium">Add Visit</span>
            </button>
          )}

          {isEmpty && !addingVisit && !editingVisit && (
            <p className="text-center text-sm text-muted-foreground py-2">
              No visits planned for this day
            </p>
          )}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={addingVisit || !!editingVisit}
        onOpenChange={(open) => {
          if (!open) {
            setAddingVisit(false);
            setEditingVisit(null);
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVisit ? `Edit Visit – ${dayName}` : `Add Visit – ${dayName}`}
            </DialogTitle>
          </DialogHeader>
          {(addingVisit || editingVisit) && (
            <VisitForm
              visit={editingVisit || undefined}
              onSave={(v) => {
                if (editingVisit) {
                  onUpdateVisit?.(v);
                  setEditingVisit(null);
                } else {
                  onAddVisit?.(v);
                  setAddingVisit(false);
                }
              }}
              onDelete={
                editingVisit
                  ? () => {
                      onDeleteVisit?.(editingVisit.id);
                      setEditingVisit(null);
                    }
                  : undefined
              }
              onCancel={() => {
                setAddingVisit(false);
                setEditingVisit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
