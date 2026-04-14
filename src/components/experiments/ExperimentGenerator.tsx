import React from 'react';
import { Idea } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Check, Plus, MessageSquare, Globe, Target, Clock, IndianRupee } from 'lucide-react';
import { generateExperiments } from '@/services/gemini';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface ExperimentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}

export function ExperimentGenerator({ isOpen, onClose, idea }: ExperimentGeneratorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);
  const [saving, setSaving] = React.useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await generateExperiments(idea, 'en');
      setSuggestions(res);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate experiments');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const saveSelected = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const selected = suggestions.filter((_, i) => selectedIndices.includes(i));
      for (const exp of selected) {
        await addDoc(collection(db, `ideas/${idea.id}/experiments`), {
          ideaId: idea.id,
          userId: user.uid,
          name: exp.name,
          goal: exp.goal,
          type: exp.type,
          status: 'planned',
          metrics: { reach: 0, positiveSignals: 0, conversionRate: 0 },
          description: exp.description,
          effort: exp.effort,
          costEstimate: exp.costEstimate,
          createdAt: new Date().toISOString(),
        });
      }
      toast.success(`${selected.length} experiments added!`);
      onClose();
      setSuggestions([]);
      setSelectedIndices([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save experiments');
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp_outreach': return <MessageSquare className="h-4 w-4" />;
      case 'landing_page': return <Globe className="h-4 w-4" />;
      case 'survey': return <Target className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            AI Experiment Generator
          </DialogTitle>
          <DialogDescription>
            Based on your idea and assumptions, here are the best ways to validate your startup.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your idea and constraints...</p>
              <p className="text-xs text-gray-400 mt-2">Generating high-impact validation sprints</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {suggestions.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        selectedIndices.includes(index) 
                          ? 'border-orange-600 bg-orange-50/30' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => toggleSelection(index)}
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${selectedIndices.includes(index) ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {getIcon(exp.type)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{exp.name}</h4>
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{exp.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          {selectedIndices.includes(index) && (
                            <div className="bg-orange-600 text-white rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                          {exp.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Effort: <span className="font-bold ml-1 text-gray-700">{exp.effort}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <IndianRupee className="h-3 w-3 mr-1" />
                            Est. Cost: <span className="font-bold ml-1 text-gray-700">{exp.costEstimate}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Target className="h-3 w-3 mr-1" />
                            Goal: <span className="font-bold ml-1 text-gray-700">{exp.goal}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={fetchSuggestions} disabled={loading || saving}>
            Regenerate
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button 
              onClick={saveSelected} 
              disabled={selectedIndices.length === 0 || saving}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add {selectedIndices.length} Experiments
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
