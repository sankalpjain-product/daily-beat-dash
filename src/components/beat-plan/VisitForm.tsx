import { useState } from 'react';
import { Visit, MOCK_CLUSTERS, MOCK_AGENTS, TIME_SLOTS, VisitPurpose, VISIT_PURPOSE_LABELS, Cluster, Agent, TimeSlot } from '@/types/beatPlan';
import { X, Check, Trash2 } from 'lucide-react';

interface VisitFormProps {
  visit?: Visit;
  onSave: (visit: Visit) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function VisitForm({ visit, onSave, onDelete, onClose }: VisitFormProps) {
  const [selectedCluster, setSelectedCluster] = useState<Cluster | undefined>(visit?.cluster);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>(visit?.agents || []);
  const [selectedPurposes, setSelectedPurposes] = useState<VisitPurpose[]>(visit?.purposes || []);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(visit?.timeSlot);

  const isEditing = !!visit;

  const toggleAgent = (agent: Agent) => {
    if (selectedAgents.find(a => a.id === agent.id)) {
      setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id));
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  const togglePurpose = (purpose: VisitPurpose) => {
    if (selectedPurposes.includes(purpose)) {
      setSelectedPurposes(selectedPurposes.filter(p => p !== purpose));
    } else {
      setSelectedPurposes([...selectedPurposes, purpose]);
    }
  };

  const handleSave = () => {
    const newVisit: Visit = {
      id: visit?.id || `visit_${Date.now()}`,
      cluster: selectedCluster,
      agents: selectedAgents,
      purposes: selectedPurposes,
      timeSlot: selectedTimeSlot,
      checkIn: visit?.checkIn,
    };
    onSave(newVisit);
  };

  const canSave = selectedAgents.length > 0 || selectedCluster;

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-md max-h-[90vh] rounded-t-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="touch-feedback">
            <X size={24} />
          </button>
          <h2 className="font-semibold">{isEditing ? 'Edit Visit' : 'Add Visit'}</h2>
          <button onClick={handleSave} className="touch-feedback" disabled={!canSave}>
            <Check size={24} className={canSave ? '' : 'opacity-50'} />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] p-4 space-y-6">
          {/* Route/Cluster Selection */}
          <div>
            <h3 className="font-medium mb-2">Route / Cluster</h3>
            <div className="space-y-2">
              {MOCK_CLUSTERS.map(cluster => (
                <button
                  key={cluster.id}
                  onClick={() => setSelectedCluster(selectedCluster?.id === cluster.id ? undefined : cluster)}
                  className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                    selectedCluster?.id === cluster.id
                      ? 'border-primary bg-secondary'
                      : 'border-border bg-card'
                  }`}
                >
                  {cluster.name}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Selection */}
          <div>
            <h3 className="font-medium mb-2">Agents to Visit</h3>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent)}
                  className={`text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                    selectedAgents.find(a => a.id === agent.id)
                      ? 'border-primary bg-secondary'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="font-medium text-sm">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.location}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Purpose Selection */}
          <div>
            <h3 className="font-medium mb-2">Purpose of Visit</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(VISIT_PURPOSE_LABELS) as VisitPurpose[]).map(purpose => (
                <button
                  key={purpose}
                  onClick={() => togglePurpose(purpose)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedPurposes.includes(purpose)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {VISIT_PURPOSE_LABELS[purpose]}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <h3 className="font-medium mb-2">Time Slot</h3>
            <div className="space-y-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot.start}
                  onClick={() => setSelectedTimeSlot(
                    selectedTimeSlot?.start === slot.start 
                      ? undefined 
                      : { start: slot.start, end: slot.end }
                  )}
                  className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                    selectedTimeSlot?.start === slot.start
                      ? 'border-primary bg-secondary'
                      : 'border-border bg-card'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Button */}
          {isEditing && onDelete && (
            <button
              onClick={onDelete}
              className="w-full py-3 flex items-center justify-center gap-2 text-destructive border-2 border-destructive rounded-lg"
            >
              <Trash2 size={20} />
              <span>Delete Visit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
