import React from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import { Idea } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IdeaCard } from './ideas/IdeaCard';
import { NewIdeaForm } from './ideas/NewIdeaForm';
import { IdeaDetails } from './ideas/IdeaDetails';

export function Dashboard() {
  const { user } = useAuth();
  const [ideas, setIdeas] = React.useState<Idea[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'ideas'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Idea));
      setIdeas(ideasData);
    });

    return unsubscribe;
  }, [user]);

  const selectedIdea = ideas.find(i => i.id === selectedIdeaId);

  if (selectedIdeaId && selectedIdea) {
    return <IdeaDetails idea={selectedIdea} onBack={() => setSelectedIdeaId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Ideas</h1>
          <p className="text-gray-600">Track and validate your startup assumptions.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Idea
        </Button>
      </div>

      {ideas.length === 0 && !isAdding ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Every great startup begins with a single idea. Add yours and start validating today.
          </p>
          <Button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Idea
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {ideas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                onClick={() => setSelectedIdeaId(idea.id)} 
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <NewIdeaForm isOpen={isAdding} onClose={() => setIsAdding(false)} />
    </div>
  );
}
