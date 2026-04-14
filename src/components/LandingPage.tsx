import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { Rocket, Target, Zap, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingPage() {
  const { signIn } = useAuth();

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-orange-500" />,
      title: "AI Experiment Generator",
      description: "Turn assumptions into ready-to-run validation sprints in seconds."
    },
    {
      icon: <Target className="h-6 w-6 text-blue-500" />,
      title: "Validation Scoring",
      description: "Get a data-driven score on how solid your startup idea really is."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      title: "WhatsApp Execution",
      description: "Launch outreach experiments directly via WhatsApp with pre-built scripts."
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      title: "Regional Support",
      description: "Full support for Hindi and regional languages for tier-2/3 founders."
    }
  ];

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Stop Guessing. <br />
            <span className="text-orange-600">Start Validating.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            QuickValidate Studio helps student founders turn rough ideas into concrete evidence. 
            Build habits of experimentation, not just pitch decks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={signIn} className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 h-auto">
              Start Your Validation Sprint
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
              View Demo
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="mb-4 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-orange-50 rounded-3xl p-8 md:p-12 border border-orange-100 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for the next generation of Indian Founders</h2>
          <p className="text-gray-700 mb-6 text-lg">
            Whether you're in a metro or a tier-3 city, QuickValidate Studio provides the tools, 
            templates, and government scheme mappings to help you succeed.
          </p>
          <Button variant="link" className="text-orange-600 font-bold p-0 h-auto text-lg">
            Learn about Startup India & MYUVA schemes →
          </Button>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
          <Rocket className="w-64 h-64 text-orange-600" />
        </div>
      </div>
    </div>
  );
}
