import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';

const ideaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  problem: z.string().min(10, "Problem statement must be at least 10 characters"),
  targetCustomer: z.string().min(3, "Target customer is required"),
  sector: z.string().min(1, "Sector is required"),
  budgetConstraint: z.string().min(1, "Budget is required"),
  timeConstraint: z.string().min(1, "Time is required"),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

interface NewIdeaFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewIdeaForm({ isOpen, onClose }: NewIdeaFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [assumptions, setAssumptions] = React.useState<string[]>(['']);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      budgetConstraint: '0',
      timeConstraint: '1 week',
    }
  });

  const onSubmit = async (data: IdeaFormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const filteredAssumptions = assumptions.filter(a => a.trim() !== '');
      await addDoc(collection(db, 'ideas'), {
        ...data,
        userId: user.uid,
        assumptions: filteredAssumptions,
        validationScore: 0,
        status: 'draft',
        location: 'India',
        createdAt: new Date().toISOString(),
      });
      toast.success('Idea created successfully!');
      reset();
      setAssumptions(['']);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create idea');
    } finally {
      setLoading(false);
    }
  };

  const addAssumption = () => setAssumptions([...assumptions, '']);
  const removeAssumption = (index: number) => {
    const newAssumptions = [...assumptions];
    newAssumptions.splice(index, 1);
    setAssumptions(newAssumptions.length ? newAssumptions : ['']);
  };

  const updateAssumption = (index: number, value: string) => {
    const newAssumptions = [...assumptions];
    newAssumptions[index] = value;
    setAssumptions(newAssumptions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Startup Idea</DialogTitle>
          <DialogDescription>
            Capture your vision and the core assumptions you need to test.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Idea Title</Label>
            <Input id="title" placeholder="e.g., EcoDelivery for Students" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea id="description" placeholder="What does your startup do?" {...register('description')} />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select onValueChange={(v) => setValue('sector', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="D2C">D2C</SelectItem>
                  <SelectItem value="AgriTech">AgriTech</SelectItem>
                  <SelectItem value="HealthTech">HealthTech</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-xs text-red-500">{errors.sector.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetCustomer">Target Customer</Label>
              <Input id="targetCustomer" placeholder="e.g., College Students" {...register('targetCustomer')} />
              {errors.targetCustomer && <p className="text-xs text-red-500">{errors.targetCustomer.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">What problem are you solving?</Label>
            <Textarea id="problem" placeholder="Describe the pain point..." {...register('problem')} />
            {errors.problem && <p className="text-xs text-red-500">{errors.problem.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Key Assumptions</Label>
            <p className="text-xs text-gray-500">What must be true for this idea to work?</p>
            {assumptions.map((assumption, index) => (
              <div key={index} className="flex gap-2">
                <Input 
                  value={assumption} 
                  onChange={(e) => updateAssumption(index, e.target.value)}
                  placeholder={`Assumption ${index + 1}`}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAssumption(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addAssumption} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Assumption
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Constraint</Label>
              <Select onValueChange={(v) => setValue('budgetConstraint', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">₹0 (Zero Budget)</SelectItem>
                  <SelectItem value="< ₹500">Under ₹500</SelectItem>
                  <SelectItem value="₹500 - ₹2000">₹500 - ₹2000</SelectItem>
                  <SelectItem value="> ₹2000">Above ₹2000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time Available</Label>
              <Select onValueChange={(v) => setValue('timeConstraint', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 day">1 Day</SelectItem>
                  <SelectItem value="3 days">3 Days</SelectItem>
                  <SelectItem value="1 week">1 Week</SelectItem>
                  <SelectItem value="2 weeks">2 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Idea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
