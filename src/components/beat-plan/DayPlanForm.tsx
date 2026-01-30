import { useState } from 'react';
import { DayPlan, MOCK_CLUSTERS, MOCK_AGENTS, TIME_SLOTS, VisitPurpose, VISIT_PURPOSE_LABELS, DAYS_OF_WEEK, Cluster, Agent, TimeSlot } from '@/types/beatPlan';
import { format, parseISO } from 'date-fns';
import { X, Check } from 'lucide-react';

interface DayPlanFormProps {
  day: DayPlan;
  onSave: (day: DayPlan) => void;
  onClose: () => void;
}

export function DayPlanForm({ day, onSave, onClose }: DayPlanFormProps) {
  const [selectedClusters, setSelectedClusters] = useState<Cluster[]>(day.clusters);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>(day.agents);
  const [selectedPurposes, setSelectedPurposes] = useState<VisitPurpose[]>(day.purposes);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>(day.timeSlots);

  const dayName = DAYS_OF_WEEK[day.dayOfWeek];
  const dateStr = format(parseISO(day.date), 'dd MMM yyyy');

  const toggleCluster = (cluster: Cluster) => {
    if (selectedClusters.find(c => c.id === cluster.id)) {
      setSelectedClusters(selectedClusters.filter(c => c.id !== cluster.id));
    } else if (selectedClusters.length < 2) {
      setSelectedClusters([...selectedClusters, cluster]);
    }
  };

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

  const toggleTimeSlot = (slot: typeof TIME_SLOTS[0]) => {
    const existing = selectedTimeSlots.find(t => t.start === slot.start);
    if (existing) {
      setSelectedTimeSlots(selectedTimeSlots.filter(t => t.start !== slot.start));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, { start: slot.start, end: slot.end }]);
    }
  };

  const handleSave = () => {
    onSave({
      ...day,
      clusters: selectedClusters,
      agents: selectedAgents,
      purposes: selectedPurposes,
      timeSlots: selectedTimeSlots,
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
          <button onClick={handleSave} className="touch-feedback">
            <Check size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] p-4 space-y-6">
          {/* Route/Cluster Selection */}
          <div>
            <h3 className="font-medium mb-2">Route / Cluster (max 2)</h3>
            <div className="space-y-2">
              {MOCK_CLUSTERS.map(cluster => (
                <button
                  key={cluster.id}
                  onClick={() => toggleCluster(cluster)}
                  className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                    selectedClusters.find(c => c.id === cluster.id)
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

          {/* Time Slots */}
          <div>
            <h3 className="font-medium mb-2">Time Slots</h3>
            <div className="space-y-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot.start}
                  onClick={() => toggleTimeSlot(slot)}
                  className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-colors ${
                    selectedTimeSlots.find(t => t.start === slot.start)
                      ? 'border-primary bg-secondary'
                      : 'border-border bg-card'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
