import { Idea } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'motion/react';
import { Target, Clock, IndianRupee } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'validated': return 'bg-blue-100 text-blue-700';
      case 'pivoted': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="h-full border-gray-200 hover:border-orange-300 transition-colors overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge className={getStatusColor(idea.status)} variant="secondary">
              {idea.status.toUpperCase()}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(idea.createdAt).toLocaleDateString()}
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">{idea.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
            {idea.description}
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Validation Progress</span>
                <span className="text-orange-600 font-bold">{idea.validationScore}%</span>
              </div>
              <Progress value={idea.validationScore} className="h-2 bg-gray-100" />
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Target className="h-3 w-3 mr-1 text-orange-500" />
                {idea.sector}
              </div>
              <div className="flex items-center">
                <IndianRupee className="h-3 w-3 mr-1 text-green-500" />
                {idea.budgetConstraint}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
