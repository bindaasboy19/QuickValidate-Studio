import React from 'react';
import { Idea, Experiment } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Zap, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExperimentGenerator } from '../experiments/ExperimentGenerator';
import { toast } from 'sonner';
import { generateValidationFeedback } from '@/services/gemini';

interface IdeaDetailsProps {
  idea: Idea;
  onBack: () => void;
}

export function IdeaDetails({ idea, onBack }: IdeaDetailsProps) {
  const [experiments, setExperiments] = React.useState<Experiment[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [feedback, setFeedback] = React.useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = React.useState(false);

  React.useEffect(() => {
    const q = query(
      collection(db, `ideas/${idea.id}/experiments`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const experimentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experiment));
      setExperiments(experimentsData);
    });

    return unsubscribe;
  }, [idea.id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this idea?')) {
      await deleteDoc(doc(db, 'ideas', idea.id));
      onBack();
      toast.success('Idea deleted');
    }
  };

  const getFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await generateValidationFeedback(idea, experiments);
      setFeedback(res);
      // Update score in DB
      await updateDoc(doc(db, 'ideas', idea.id), {
        validationScore: res.score
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to get AI feedback');
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-extrabold text-gray-900">{idea.title}</h1>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{idea.status.toUpperCase()}</Badge>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">{idea.description}</p>
          </section>

          <Tabs defaultValue="experiments" className="w-full">
            <TabsList className="bg-gray-100 p-1 rounded-xl mb-6">
              <TabsTrigger value="experiments" className="rounded-lg px-6">Experiments</TabsTrigger>
              <TabsTrigger value="assumptions" className="rounded-lg px-6">Assumptions</TabsTrigger>
              <TabsTrigger value="market" className="rounded-lg px-6">Market & Schemes</TabsTrigger>
            </TabsList>

            <TabsContent value="experiments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Validation Sprints</h3>
                <Button onClick={() => setIsGenerating(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Experiments
                </Button>
              </div>

              {experiments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Zap className="h-10 w-10 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No experiments yet. Use AI to generate some!</p>
                  <Button onClick={() => setIsGenerating(true)} variant="outline">
                    Get Started
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {experiments.map((exp) => (
                    <Card key={exp.id} className="border-gray-100 hover:border-orange-200 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Badge variant="outline" className="mb-2">{exp.type.replace('_', ' ').toUpperCase()}</Badge>
                            <h4 className="text-lg font-bold text-gray-900">{exp.name}</h4>
                            <p className="text-sm text-gray-500">{exp.goal}</p>
                          </div>
                          <Badge className={exp.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {exp.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                          <div className="flex gap-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-400 uppercase font-bold">Reach</p>
                              <p className="font-bold text-gray-900">{exp.metrics.reach}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400 uppercase font-bold">Signals</p>
                              <p className="font-bold text-gray-900">{exp.metrics.positiveSignals}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-orange-600 font-bold">
                            View Details →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assumptions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Core Assumptions</CardTitle>
                  <CardDescription>What must be true for your idea to succeed?</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {idea.assumptions.map((assumption, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="text-gray-700">{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Relevant Support Schemes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-gray-900">Startup India Seed Fund Scheme (SISFS)</h5>
                    <p className="text-sm text-gray-600 mb-2">Financial assistance to startups for proof of concept, prototype development, and product trials.</p>
                    <Badge className="bg-blue-100 text-blue-700">Early Stage</Badge>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-gray-900">MYUVA (Mukhyamantri Yuva Udyami Vikas Abhiyan)</h5>
                    <p className="text-sm text-gray-600 mb-2">State-level support for young entrepreneurs in Uttar Pradesh with interest-free loans.</p>
                    <Badge className="bg-blue-100 text-blue-700">UP Only</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-white shadow-sm border-gray-100 overflow-hidden">
            <div className="bg-orange-600 h-2 w-full" />
            <CardHeader>
              <CardTitle className="text-lg">Validation Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="relative inline-flex items-center justify-center mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * idea.validationScore) / 100}
                    className="text-orange-600 transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-3xl font-black text-gray-900">{idea.validationScore}%</span>
              </div>
              <Button 
                onClick={getFeedback} 
                disabled={loadingFeedback}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {loadingFeedback ? 'Analyzing...' : 'Refresh AI Analysis'}
              </Button>
            </CardContent>
          </Card>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="border-green-100 bg-green-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-gray-600">
                    {feedback.strengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-100 bg-amber-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    Validation Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-1 text-gray-600">
                    {feedback.gaps.map((g: string, i: number) => <li key={i}>• {g}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <ExperimentGenerator 
        isOpen={isGenerating} 
        onClose={() => setIsGenerating(false)} 
        idea={idea} 
      />
    </div>
  );
}
