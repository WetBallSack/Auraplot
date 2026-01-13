import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeEvent } from '../types';
import { Plus, Trash2, TrendingUp, TrendingDown, Zap, Anchor, HelpCircle, CalendarClock, Pencil, X, Check } from 'lucide-react';

interface StepEventsProps {
  events: LifeEvent[];
  setEvents: React.Dispatch<React.SetStateAction<LifeEvent[]>>;
  onNext: () => void;
}

// Helper Component for Labels with Animated Info
const LabelWithInfo: React.FC<{ label: React.ReactNode, info: string, rightElement?: React.ReactNode }> = ({ label, info, rightElement }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group outline-none text-left"
          type="button"
        >
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1.5 group-hover:text-primary transition-colors">
            {label}
          </span>
          <HelpCircle size={14} className={`text-gray-300 dark:text-gray-600 transition-colors group-hover:text-primary ${isOpen ? 'text-primary' : ''}`} />
        </button>
        {rightElement}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Slow, smooth easing
            className="overflow-hidden"
          >
             <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 leading-relaxed shadow-sm mt-2">
               {info}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StepEvents: React.FC<StepEventsProps> = ({ events, setEvents, onNext }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [inputState, setInputState] = useState<Omit<LifeEvent, 'id'>>({
    name: '',
    date: new Date().toISOString().slice(0, 16),
    impact: 0,
    intensity: 5,
    stickiness: 0.5,
  });

  const resetForm = () => {
    setInputState({
      name: '',
      date: new Date().toISOString().slice(0, 16),
      impact: 0,
      intensity: 5,
      stickiness: 0.5,
    });
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    if (!inputState.name || !inputState.date) return;
    
    setEvents((prev) => {
        let updated;
        if (editingId) {
            // Update existing
            updated = prev.map(e => e.id === editingId ? { ...inputState, id: editingId } : e);
        } else {
            // Add new
            updated = [...prev, { ...inputState, id: crypto.randomUUID() }];
        }
        // Sort DESC
        return updated.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    resetForm();
  };

  const startEditing = (event: LifeEvent) => {
    setEditingId(event.id);
    setInputState({
        name: event.name,
        date: event.date,
        impact: event.impact,
        intensity: event.intensity,
        stickiness: event.stickiness
    });
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-accent dark:text-white">Market Movers</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Log events to automatically determine the period and volatility.</p>
      </div>

      {/* Input Card */}
      <div className={`p-6 rounded-2xl shadow-sm border space-y-6 transition-colors ${
          editingId 
            ? 'bg-green-50 dark:bg-green-900/10 border-primary dark:border-primary' 
            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
      }`}>
        
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {editingId ? 'Editing Event' : 'New Entry'}
            </span>
            {editingId && (
                <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
                    <X size={12} /> Cancel Edit
                </button>
            )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <LabelWithInfo 
            label="Event Name" 
            info="A short, descriptive title for the life event. Examples: 'Promotion', 'Breakup', 'Started New Hobby', 'Moved Cities'." 
          />
          <input
            type="text"
            value={inputState.name}
            onChange={(e) => setInputState({ ...inputState, name: e.target.value })}
            placeholder="e.g. Promotion, Breakup, New Hobby"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
          />
        </div>

        {/* Date Time */}
        <div className="space-y-2">
            <LabelWithInfo 
                label={<><CalendarClock size={14}/> Timestamp (UTC)</>}
                info="When did this occur? The sequence of dates determines your chart's timeline."
            />
            <input 
                type="datetime-local"
                value={inputState.date}
                onChange={(e) => setInputState({ ...inputState, date: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-gray-600 dark:text-gray-300"
            />
        </div>

        {/* Impact */}
        <div className="space-y-3">
          <LabelWithInfo 
            label="Market Impact" 
            info="How positive (Bullish) or negative (Bearish) was this event? -10 is a catastrophic loss, +10 is pure euphoria. 0 is neutral."
          />
          <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase px-1">
            <span className="flex items-center gap-1"><TrendingDown size={14}/> Bearish (-10)</span>
            <span className="text-accent dark:text-white font-mono text-lg">{inputState.impact > 0 ? '+' : ''}{inputState.impact}</span>
            <span className="flex items-center gap-1">Bullish (+10) <TrendingUp size={14}/></span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="1"
            value={inputState.impact}
            onChange={(e) => setInputState({ ...inputState, impact: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Intensity */}
          <div className="space-y-3">
            <LabelWithInfo
              label={<><Zap size={14}/> Intensity</>}
              info="How strong was the emotional force? 1 is barely noticeable, 10 is an overwhelming experience that consumed your attention."
              rightElement={<span className="text-accent dark:text-white font-mono text-xs font-bold">{inputState.intensity}</span>}
            />
            <input
              type="range"
              min="1"
              max="10"
              value={inputState.intensity}
              onChange={(e) => setInputState({ ...inputState, intensity: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Stickiness */}
          <div className="space-y-3">
            <LabelWithInfo
              label={<><Anchor size={14}/> Stickiness</>}
              info="How long-lasting are the effects? 0 means fleeting (gone tomorrow), 1 means a permanent shift in your baseline (sticking with you)."
              rightElement={<span className="text-accent dark:text-white font-mono text-xs font-bold">{inputState.stickiness}</span>}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={inputState.stickiness}
              onChange={(e) => setInputState({ ...inputState, stickiness: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        <button
          onClick={handleAddOrUpdate}
          disabled={!inputState.name || !inputState.date}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            editingId 
            ? 'bg-primary text-white hover:bg-primary-dark shadow-md' 
            : 'border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:text-primary'
          }`}
        >
          {editingId ? <><Check size={18}/> Update Trade</> : <><Plus size={18}/> Log Trade</>}
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => startEditing(event)}
              className={`flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 cursor-pointer transition-all ${
                editingId === event.id 
                    ? 'bg-green-50 dark:bg-green-900/20 ring-1 ring-primary' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={{ borderLeftColor: event.impact >= 0 ? '#00C896' : '#FF5F5F' }}
            >
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 dark:text-gray-200">
                    {event.name}
                    {editingId === event.id && <span className="text-[10px] bg-primary text-white px-1.5 rounded">EDITING</span>}
                </h4>
                <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500 mt-1 items-center">
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{new Date(event.date).toLocaleDateString()}</span>
                  <span>Imp: {event.impact}</span>
                  <span>Int: {event.intensity}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); startEditing(event); }} className="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
                    <Pencil size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeEvent(event.id); }} className="text-gray-300 hover:text-danger dark:text-gray-600 dark:hover:text-danger">
                    <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="text-center py-4 text-gray-400 dark:text-gray-600 text-sm italic">
            No events logged yet.
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-accent dark:bg-primary text-white dark:text-black py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Calculate PNL
      </button>
    </div>
  );
};