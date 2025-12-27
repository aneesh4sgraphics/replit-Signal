import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  Copy,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  id?: number;
  name: string;
  guidance: string;
  color: string;
  confidenceLevel: number | null;
  overdueDays: number | null;
  autoCloseDays: number | null;
}

interface JourneyTemplate {
  id: number;
  key: string;
  name: string;
  description: string | null;
  isSystemDefault: boolean;
  isActive: boolean;
  stages: Stage[];
}

interface JourneyCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTemplate?: JourneyTemplate | null;
}

const STAGE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#64748b', // slate
];

const defaultStages: Stage[] = [
  { name: 'Stage 1', guidance: '', color: '#3b82f6', confidenceLevel: null, overdueDays: null, autoCloseDays: null },
  { name: 'Stage 2', guidance: '', color: '#22c55e', confidenceLevel: null, overdueDays: null, autoCloseDays: null },
  { name: 'Stage 3', guidance: '', color: '#eab308', confidenceLevel: null, overdueDays: null, autoCloseDays: null },
  { name: 'Stage 4', guidance: '', color: '#8b5cf6', confidenceLevel: null, overdueDays: null, autoCloseDays: null },
];

export default function JourneyCreatorModal({ open, onOpenChange, editTemplate }: JourneyCreatorModalProps) {
  const [step, setStep] = useState<'choose' | 'build'>('choose');
  const [creationType, setCreationType] = useState<'scratch' | 'copy'>('scratch');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineDescription, setPipelineDescription] = useState("");
  const [stages, setStages] = useState<Stage[]>(defaultStages);
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery<JourneyTemplate[]>({
    queryKey: ['/api/crm/journey-templates'],
  });

  useEffect(() => {
    if (editTemplate) {
      setPipelineName(editTemplate.name);
      setPipelineDescription(editTemplate.description || "");
      setStages(editTemplate.stages.map(s => ({
        ...s,
        guidance: s.guidance || '',
        color: s.color || '#3b82f6',
      })));
      setStep('build');
    } else if (open) {
      resetForm();
    }
  }, [editTemplate, open]);

  const resetForm = () => {
    setStep('choose');
    setCreationType('scratch');
    setSelectedTemplateId(null);
    setPipelineName("");
    setPipelineDescription("");
    setStages(defaultStages);
    setEditingStageIndex(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; stages: Stage[] }) => {
      const endpoint = editTemplate 
        ? `/api/crm/journey-templates/${editTemplate.id}`
        : '/api/crm/journey-templates';
      const method = editTemplate ? 'PUT' : 'POST';
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/journey-templates'] });
      toast({
        title: editTemplate ? "Pipeline Updated" : "Pipeline Created",
        description: `"${pipelineName}" has been ${editTemplate ? 'updated' : 'created'} successfully.`,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save pipeline",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const res = await apiRequest('POST', `/api/crm/journey-templates/${templateId}/duplicate`, {});
      return res.json();
    },
    onSuccess: (data) => {
      setPipelineName(data.name);
      setPipelineDescription(data.description || "");
      setStages(data.stages.map((s: any) => ({
        ...s,
        guidance: s.guidance || '',
        color: s.color || '#3b82f6',
      })));
      setStep('build');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to copy template",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (creationType === 'copy' && selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setPipelineName(`${template.name} (Copy)`);
        setPipelineDescription(template.description || "");
        setStages(template.stages.map(s => ({
          ...s,
          guidance: s.guidance || '',
          color: s.color || '#3b82f6',
        })));
      }
    }
    setStep('build');
  };

  const handleSave = () => {
    if (!pipelineName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a pipeline name",
        variant: "destructive",
      });
      return;
    }
    if (stages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one stage",
        variant: "destructive",
      });
      return;
    }
    if (stages.some(s => !s.name.trim())) {
      toast({
        title: "Error",
        description: "All stages must have a name",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: pipelineName,
      description: pipelineDescription,
      stages,
    });
  };

  const addStage = () => {
    const colorIndex = stages.length % STAGE_COLORS.length;
    setStages([...stages, {
      name: `Stage ${stages.length + 1}`,
      guidance: '',
      color: STAGE_COLORS[colorIndex],
      confidenceLevel: null,
      overdueDays: null,
      autoCloseDays: null,
    }]);
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
    if (editingStageIndex === index) {
      setEditingStageIndex(null);
    }
  };

  const updateStage = (index: number, updates: Partial<Stage>) => {
    setStages(stages.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newStages = [...stages];
    const draggedStage = newStages[draggedIndex];
    newStages.splice(draggedIndex, 1);
    newStages.splice(index, 0, draggedStage);
    setStages(newStages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editTemplate ? 'Edit Pipeline' : 'Create a new pipeline'}
          </DialogTitle>
          <DialogDescription>
            {step === 'choose' 
              ? 'Choose how you want to start building your pipeline'
              : 'Build your pipeline by adding and configuring stages'}
          </DialogDescription>
        </DialogHeader>

        {step === 'choose' && !editTemplate && (
          <div className="flex gap-6 p-4">
            <div className="w-1/3 space-y-3">
              <button
                data-testid="btn-start-scratch"
                onClick={() => setCreationType('scratch')}
                className={cn(
                  "w-full p-4 text-left border-2 rounded-lg transition-all",
                  creationType === 'scratch' 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4" />
                  Start from scratch
                </div>
              </button>
              <button
                data-testid="btn-copy-existing"
                onClick={() => setCreationType('copy')}
                className={cn(
                  "w-full p-4 text-left border-2 rounded-lg transition-all",
                  creationType === 'copy' 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Copy className="h-4 w-4" />
                  Copy from existing pipeline
                </div>
              </button>

              {creationType === 'copy' && templates.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">Templates</Label>
                  <ScrollArea className="h-48 border rounded-lg">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        data-testid={`template-option-${template.id}`}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={cn(
                          "w-full p-3 text-left border-b last:border-b-0 transition-all",
                          selectedTemplateId === template.id
                            ? "bg-blue-50 dark:bg-blue-950"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-500">
                          {template.stages?.length || 0} stages
                        </div>
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>

            <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                {creationType === 'scratch' ? 'Start from scratch' : 'Copy from existing pipeline'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {creationType === 'scratch' 
                  ? 'Start from a clean slate and shape your pipeline around your company goals'
                  : 'Use an existing pipeline as a starting point and customize it'}
              </p>
              
              <div className="flex items-center gap-1">
                {(creationType === 'scratch' ? defaultStages : 
                  (selectedTemplateId ? templates.find(t => t.id === selectedTemplateId)?.stages || defaultStages : defaultStages)
                ).map((stage, i) => (
                  <div key={i} className="flex items-center">
                    <div 
                      className="px-4 py-2 bg-white dark:bg-gray-800 rounded text-sm font-medium shadow-sm border"
                      style={{ borderColor: stage.color }}
                    >
                      {stage.name}
                    </div>
                    {i < (creationType === 'scratch' ? defaultStages : 
                      (selectedTemplateId ? templates.find(t => t.id === selectedTemplateId)?.stages || defaultStages : defaultStages)
                    ).length - 1 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'build' && (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 px-4">
              <div>
                <Label htmlFor="pipeline-name">Pipeline Name</Label>
                <Input
                  id="pipeline-name"
                  data-testid="input-pipeline-name"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="Enter pipeline name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pipeline-description">Description (optional)</Label>
                <Input
                  id="pipeline-description"
                  data-testid="input-pipeline-description"
                  value={pipelineDescription}
                  onChange={(e) => setPipelineDescription(e.target.value)}
                  placeholder="Brief description"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex gap-4 px-4">
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Build your pipeline</Label>
                  <Button
                    data-testid="btn-add-stage"
                    variant="outline"
                    size="sm"
                    onClick={addStage}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add stage
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Create and configure the stages that you'll use to organize your leads.
                </p>
                
                <ScrollArea className="flex-1 border rounded-lg p-2">
                  <div className="space-y-2">
                    {stages.map((stage, index) => (
                      <div
                        key={index}
                        data-testid={`stage-item-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setEditingStageIndex(index)}
                        className={cn(
                          "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                          editingStageIndex === index
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800",
                          draggedIndex === index && "opacity-50"
                        )}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />
                        <div className="flex-1">
                          <Input
                            value={stage.name}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateStage(index, { name: e.target.value });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                            placeholder="Stage name"
                          />
                        </div>
                        <Button
                          data-testid={`btn-remove-stage-${index}`}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStage(index);
                          }}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="w-1/2 flex flex-col">
                {editingStageIndex !== null && stages[editingStageIndex] && (
                  <div className="flex-1 border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">New stage</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStageIndex(null)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stage-name">Name</Label>
                        <Input
                          id="stage-name"
                          data-testid="input-stage-name"
                          value={stages[editingStageIndex].name}
                          onChange={(e) => updateStage(editingStageIndex, { name: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="stage-guidance">Stage guidance</Label>
                        <Textarea
                          id="stage-guidance"
                          data-testid="textarea-stage-guidance"
                          value={stages[editingStageIndex].guidance}
                          onChange={(e) => updateStage(editingStageIndex, { guidance: e.target.value })}
                          placeholder="Example: Leads enter this stage after a 30 minute conversation."
                          className="mt-1 min-h-[80px]"
                        />
                      </div>

                      <div>
                        <Label>Stage color</Label>
                        <div className="flex gap-2 mt-2">
                          {STAGE_COLORS.map((color) => (
                            <button
                              key={color}
                              data-testid={`color-${color}`}
                              onClick={() => updateStage(editingStageIndex, { color })}
                              className={cn(
                                "w-6 h-6 rounded-full transition-all",
                                stages[editingStageIndex].color === color && "ring-2 ring-offset-2 ring-blue-500"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="confidence"
                            checked={stages[editingStageIndex].confidenceLevel !== null}
                            onCheckedChange={(checked) => 
                              updateStage(editingStageIndex, { 
                                confidenceLevel: checked ? 50 : null 
                              })
                            }
                          />
                          <div className="space-y-1">
                            <label htmlFor="confidence" className="text-sm font-medium cursor-pointer">
                              Set confidence for leads when they enter this stage
                            </label>
                            {stages[editingStageIndex].confidenceLevel !== null && (
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={stages[editingStageIndex].confidenceLevel || 0}
                                onChange={(e) => updateStage(editingStageIndex, { 
                                  confidenceLevel: parseInt(e.target.value) || 0 
                                })}
                                className="w-20 h-7 text-sm"
                                placeholder="%"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="overdue"
                            checked={stages[editingStageIndex].overdueDays !== null}
                            onCheckedChange={(checked) => 
                              updateStage(editingStageIndex, { 
                                overdueDays: checked ? 7 : null 
                              })
                            }
                          />
                          <div className="space-y-1">
                            <label htmlFor="overdue" className="text-sm font-medium cursor-pointer">
                              Mark leads overdue if they remain in this stage for more than...
                            </label>
                            {stages[editingStageIndex].overdueDays !== null && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  value={stages[editingStageIndex].overdueDays || 7}
                                  onChange={(e) => updateStage(editingStageIndex, { 
                                    overdueDays: parseInt(e.target.value) || 1 
                                  })}
                                  className="w-16 h-7 text-sm"
                                />
                                <span className="text-sm text-gray-500">days</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="autoclose"
                            checked={stages[editingStageIndex].autoCloseDays !== null}
                            onCheckedChange={(checked) => 
                              updateStage(editingStageIndex, { 
                                autoCloseDays: checked ? 30 : null 
                              })
                            }
                          />
                          <div className="space-y-1">
                            <label htmlFor="autoclose" className="text-sm font-medium cursor-pointer">
                              Automatically close leads if they remain in this stage for more than...
                            </label>
                            {stages[editingStageIndex].autoCloseDays !== null && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  value={stages[editingStageIndex].autoCloseDays || 30}
                                  onChange={(e) => updateStage(editingStageIndex, { 
                                    autoCloseDays: parseInt(e.target.value) || 1 
                                  })}
                                  className="w-16 h-7 text-sm"
                                />
                                <span className="text-sm text-gray-500">days</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingStageIndex === null && (
                  <div className="flex-1 border rounded-lg p-6 flex flex-col items-center justify-center text-center text-gray-500">
                    <FileText className="h-12 w-12 mb-3 opacity-50" />
                    <p className="font-medium">Click on a stage to configure it</p>
                    <p className="text-sm mt-1">Add guidance, colors, and automation rules</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-xs text-gray-500 mb-2 block">Pipeline Preview</Label>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {stages.map((stage, i) => (
                  <div key={i} className="flex items-center flex-shrink-0">
                    <div 
                      className="px-3 py-1.5 bg-white dark:bg-gray-700 rounded text-xs font-medium shadow-sm border-l-4"
                      style={{ borderLeftColor: stage.color }}
                    >
                      {stage.name || `Stage ${i + 1}`}
                    </div>
                    {i < stages.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-gray-400 mx-0.5 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          {step === 'choose' && !editTemplate ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                data-testid="btn-next"
                onClick={handleNext}
                disabled={creationType === 'copy' && !selectedTemplateId}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              {!editTemplate && (
                <Button variant="outline" onClick={() => setStep('choose')}>
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                data-testid="btn-save-pipeline"
                onClick={handleSave}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : (editTemplate ? 'Update Pipeline' : 'Create Pipeline')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
