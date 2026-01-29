import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EmailRichTextEditor, type EmailRichTextEditorRef } from "@/components/EmailRichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PRICING_TIERS } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User,
  MapPin,
  Globe,
  DollarSign,
  UserCog,
  Check,
  X,
  Printer,
  FileText,
  Package,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Send,
  PhoneCall,
  PhoneMissed,
  Voicemail,
  Clock,
  Calendar,
  HelpCircle,
  Truck,
  Tag,
  CheckCircle,
  Target,
  Ban,
  Pause,
  Play,
  Flame,
  Zap,
  Coffee,
  Settings,
  Users,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  GitMerge,
  Trash2,
  Award,
  Battery,
  Lightbulb,
  BookOpen,
  Star,
  Trophy,
  Rocket,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Search,
  Box,
  UserX,
  Linkedin,
  SkipForward,
} from "lucide-react";

// Progress Ring SVG Component for Pastel & Soft design
const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="spotlight-progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
    </svg>
  );
};
import { PrintLabelButton } from "@/components/PrintLabelButton";

type TaskBucket = 'calls' | 'follow_ups' | 'outreach' | 'data_hygiene' | 'enablement';

interface TaskOutcome {
  id: string;
  label: string;
  icon?: string;
  nextAction?: {
    type: 'schedule_follow_up' | 'send_email' | 'mark_complete' | 'no_action' | 'mark_dnc' | 'custom_follow_up' | 'delete_record' | 'set_customer_type';
    daysUntil?: number;
    taskType?: string;
    customerType?: string;
  };
}

interface SpotlightTask {
  id: string;
  customerId: string;
  leadId?: number;
  isLeadTask?: boolean;
  bucket: TaskBucket;
  taskSubtype: string;
  priority: number;
  whyNow: string;
  outcomes: TaskOutcome[];
  customer: {
    id: string;
    company: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    zip: string | null;
    country: string | null;
    website: string | null;
    salesRepId: string | null;
    salesRepName: string | null;
    pricingTier: string | null;
    isHotProspect: boolean | null;
    customerType: string | null;
  };
  lead?: {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    stage: string;
    priority: string | null;
    score: number | null;
    city: string | null;
    state: string | null;
    salesRepId: string | null;
    salesRepName: string | null;
    firstEmailSentAt: string | null;
    firstEmailReplyAt: string | null;
    lastContactAt: string | null;
    totalTouchpoints: number | null;
    customerType: string | null;
  };
  context?: {
    followUpId?: number;
    followUpTitle?: string;
    followUpDueDate?: string;
    lastContact?: string;
    machineTypes?: string[];
    machineLabels?: string[];
    suggestedProducts?: string[];
    machineContext?: string;
    sourceType?: string;
    // Email task context
    emailId?: number;
    gmailMessageId?: string;
    gmailThreadId?: string;
    originalSubject?: string;
    sentAt?: string;
    daysSinceEmail?: number;
    // Drip campaign context
    campaignName?: string;
    stepName?: string;
    emailsSent?: number;
    daysSinceLastEmail?: number;
    replySubject?: string;
    repliedAt?: string;
  };
}

interface BucketQuota {
  bucket: TaskBucket;
  target: number;
  completed: number;
  skipped: number;
}

interface SpotlightSession {
  totalCompleted: number;
  totalTarget: number;
  buckets: BucketQuota[];
  dayComplete: boolean;
  isPaused?: boolean;
  efficiencyScore?: number;
  currentStreak?: number;
  lastActivityAt?: string;
  currentEnergy?: number;
  warmupShown?: boolean;
}

interface GamificationState {
  comboCount: number;
  comboMultiplier: number;
  currentStreak: number;
  powerUpsAvailable: number;
  hardTasksCompleted: number;
  tasksSinceMicroCard: number;
}

interface MicroCoachingCard {
  id: number;
  cardType: 'product_quiz' | 'objection_practice' | 'customer_story' | 'competitor_intel' | 'machine_profile_check';
  title: string;
  content: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  objectionType?: string;
  suggestedResponses?: { id: string; text: string; isRecommended: boolean }[];
  difficulty: string;
}

interface CoachTip {
  id: number;
  tipType: string;
  content: string;
}

interface WarmupData {
  yesterdaySummary: { calls: number; tasksCompleted: number; pricingTiersAssigned: number };
  todayFocus: string;
  streak: number;
}

interface EfficiencyData {
  score: number;
  breakdown: Record<string, number>;
  streak: number;
}

interface SpotlightHint {
  type: 'bad_fit' | 'stale_contact' | 'duplicate' | 'missing_field' | 'already_handled' | 'quick_win';
  severity: 'high' | 'medium' | 'low';
  message: string;
  ctaLabel: string;
  ctaAction: string;
  metadata?: Record<string, any>;
}

const HINT_STYLES: Record<SpotlightHint['type'], { bg: string; border: string; icon: any; textColor: string }> = {
  bad_fit: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', icon: Ban, textColor: 'text-red-700 dark:text-red-300' },
  stale_contact: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', icon: Clock, textColor: 'text-amber-700 dark:text-amber-300' },
  duplicate: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', icon: AlertCircle, textColor: 'text-purple-700 dark:text-purple-300' },
  missing_field: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', icon: UserCog, textColor: 'text-blue-700 dark:text-blue-300' },
  already_handled: { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', icon: CheckCircle, textColor: 'text-gray-700 dark:text-gray-300' },
  quick_win: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', icon: Flame, textColor: 'text-green-700 dark:text-green-300' },
};

const BUCKET_INFO: Record<TaskBucket, { label: string; icon: any; color: string }> = {
  calls: { label: 'Calls', icon: PhoneCall, color: '#A855F7' },
  follow_ups: { label: 'Follow-ups', icon: RefreshCw, color: '#22C55E' },
  outreach: { label: 'Emails', icon: Mail, color: '#F97316' },
  data_hygiene: { label: 'Data Hygiene', icon: UserCog, color: '#6366F1' },
  enablement: { label: 'Enablement', icon: Package, color: '#06B6D4' },
};

// Creative Director Redesign: Color-coded task cards
const TASK_CARD_STYLES: Record<string, { 
  gradient: string; 
  border: string; 
  badge: string;
  accent: string;
  icon: string;
}> = {
  calls: { 
    gradient: 'from-blue-50 via-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    accent: 'bg-indigo-500',
    icon: 'text-indigo-600'
  },
  follow_ups: { 
    gradient: 'from-purple-50 via-violet-50 to-fuchsia-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    accent: 'bg-purple-500',
    icon: 'text-purple-600'
  },
  outreach: { 
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    accent: 'bg-teal-500',
    icon: 'text-teal-600'
  },
  data_hygiene: { 
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500',
    icon: 'text-amber-600'
  },
  enablement: { 
    gradient: 'from-cyan-50 via-sky-50 to-blue-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
    accent: 'bg-sky-500',
    icon: 'text-sky-600'
  },
  // Special task types
  email_intelligence: { 
    gradient: 'from-rose-50 via-pink-50 to-red-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    accent: 'bg-rose-500',
    icon: 'text-rose-600'
  },
  drip_reply: { 
    gradient: 'from-orange-100 via-amber-100 to-yellow-100',
    border: 'border-orange-300',
    badge: 'bg-orange-200 text-orange-800',
    accent: 'bg-orange-500',
    icon: 'text-orange-600'
  },
  lead: { 
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    accent: 'bg-emerald-500',
    icon: 'text-emerald-600'
  },
};

// Source badge styles (Lead, Contact, Email Intelligence)
const SOURCE_BADGES = {
  lead: { label: 'LEAD', bg: 'bg-emerald-500', text: 'text-white' },
  contact: { label: 'CONTACT', bg: 'bg-blue-500', text: 'text-white' },
  email: { label: 'EMAIL', bg: 'bg-rose-500', text: 'text-white' },
  customer: { label: 'CUSTOMER', bg: 'bg-slate-500', text: 'text-white' },
  drip: { label: 'DRIP', bg: 'bg-orange-500', text: 'text-white' },
};

const OUTCOME_ICONS: Record<string, any> = {
  'check': Check,
  'user-check': CheckCircle,
  'user': User,
  'x': X,
  'tag': Tag,
  'building': Building2,
  'truck': Truck,
  'help-circle': HelpCircle,
  'mail': Mail,
  'clock': Clock,
  'phone': Phone,
  'voicemail': Voicemail,
  'phone-missed': PhoneMissed,
  'calendar': Calendar,
  'send': Send,
  'package': Package,
  'file-text': FileText,
  'ban': Ban,
  'box': Box,
  'linkedin': Linkedin,
  'star': Star,
  'user-x': UserX,
  'trash-2': Trash2,
  'printer': Printer,
  'trending-up': Rocket, // Use Rocket as fallback for trending-up
};

const PRICING_FEEDBACK_OPTIONS = [
  { id: 'price', label: 'Price', icon: DollarSign, color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200', activeColor: 'bg-red-500 text-white' },
  { id: 'moq', label: 'MOQ', icon: Package, color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200', activeColor: 'bg-yellow-500 text-white' },
  { id: 'lead_time', label: 'Lead Time', icon: Truck, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', activeColor: 'bg-blue-500 text-white' },
  { id: 'compatibility', label: 'Compatibility', icon: Settings, color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200', activeColor: 'bg-orange-500 text-white' },
  { id: 'has_supplier', label: 'Has Supplier', icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200', activeColor: 'bg-purple-500 text-white' },
  { id: 'positive', label: 'Good Feedback', icon: ThumbsUp, color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200', activeColor: 'bg-green-500 text-white' },
];

const IDLE_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours

export default function Spotlight() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [fieldValue, setFieldValue] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [showFixDataModal, setShowFixDataModal] = useState(false);
  const [fixDataFields, setFixDataFields] = useState<{ email: string; pricingTier: string; salesRepId: string }>({ email: '', pricingTier: '', salesRepId: '' });
  const [missingFieldsToFix, setMissingFieldsToFix] = useState<string[]>([]);
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeData, setMergeData] = useState<{ sourceCustomer: any; targetCustomer: any; duplicateIds: string[] } | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string | null>(null);
  const [mergeFieldSelections, setMergeFieldSelections] = useState<Record<string, string>>({});
  const [mergeEmailSelections, setMergeEmailSelections] = useState<{ primary: string; secondary: string }>({ primary: '', secondary: '' });
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug: allow forcing a specific bucket via URL param (e.g., ?forceBucket=data_hygiene)
  const urlParams = new URLSearchParams(window.location.search);
  const forceBucket = urlParams.get('forceBucket');
  const spotlightApiUrl = forceBucket 
    ? `/api/spotlight/current?forceBucket=${forceBucket}` 
    : '/api/spotlight/current';

  const { data: currentTask, isLoading, refetch } = useQuery<{ 
    task: SpotlightTask | null; 
    session: SpotlightSession; 
    allDone: boolean; 
    isPaused?: boolean; 
    hints?: SpotlightHint[];
    gamification?: GamificationState;
    microCard?: MicroCoachingCard | null;
    coachTip?: CoachTip | null;
  }>({
    queryKey: ['/api/spotlight/current', forceBucket],
    queryFn: async () => {
      const res = await fetch(spotlightApiUrl, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch spotlight');
      return res.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // Increased from 30s to reduce refetches
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
  
  const [showWarmup, setShowWarmup] = useState(false);
  const [showMicroCard, setShowMicroCard] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(7);
  
  // V0 Redesign: Coaching tray states
  const [callScriptOpen, setCallScriptOpen] = useState(true);
  const [emailIdeasOpen, setEmailIdeasOpen] = useState(false);
  const [showAddMachine, setShowAddMachine] = useState(false);
  
  // Email composer state
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);
  
  // Remind Later dialog state
  const [showRemindLaterDialog, setShowRemindLaterDialog] = useState(false);
  const [remindLaterDays, setRemindLaterDays] = useState(1);
  const [labelType, setLabelType] = useState<'swatch_book' | 'press_test_kit' | 'mailer' | 'other'>('swatch_book');
  const [labelOtherDescription, setLabelOtherDescription] = useState('');
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [labelNotes, setLabelNotes] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const emailEditorRef = useRef<EmailRichTextEditorRef>(null);
  
  // Optimistic states for immediate UI feedback
  const [optimisticCustomerType, setOptimisticCustomerType] = useState<string | null>(null);
  const [optimisticHotProspect, setOptimisticHotProspect] = useState<boolean | null>(null);
  
  // Reset optimistic states when task changes
  const currentTaskId = currentTask?.task?.id;
  useEffect(() => {
    setOptimisticCustomerType(null);
    setOptimisticHotProspect(null);
  }, [currentTaskId]);
  
  // Coaching content based on task type
  const callScriptIdeas = [
    "Open with a question about their recent order or last conversation",
    "Ask about their current printing needs and any upcoming projects",
    "Mention any new products or promotions that might be relevant",
    "Listen for pain points - pricing, lead time, quality concerns",
  ];
  
  const emailIdeas = [
    "Follow up on the conversation with a summary of discussed points",
    "Include relevant product catalogs or spec sheets",
    "Offer a special discount or promotion if appropriate",
    "Set a clear next step and timeline for follow-up",
  ];
  
  // Fetch user's email signature
  const { data: userSignature } = useQuery<{ signatureHtml: string; name: string; title: string; phone: string }>({
    queryKey: ['/api/email/signature'],
  });

  // Fetch warmup data on mount if not yet shown
  const { data: warmupData } = useQuery<WarmupData>({
    queryKey: ['/api/spotlight/warmup'],
    enabled: !currentTask?.session?.warmupShown,
  });
  
  // Show warmup modal on first visit today
  useEffect(() => {
    if (warmupData && !currentTask?.session?.warmupShown && currentTask?.session?.totalCompleted === 0) {
      setShowWarmup(true);
    }
  }, [warmupData, currentTask?.session?.warmupShown, currentTask?.session?.totalCompleted]);
  
  // Show micro-coaching card when returned from API
  useEffect(() => {
    if (currentTask?.microCard) {
      setShowMicroCard(true);
      setSelectedQuizAnswer(null);
      setQuizAnswered(false);
    }
  }, [currentTask?.microCard?.id]);

  const { data: efficiency } = useQuery<EfficiencyData>({
    queryKey: ['/api/spotlight/efficiency'],
    staleTime: 60 * 1000,
    enabled: !!currentTask,
  });

  // Fetch today's kit sending progress for daily goal
  const { data: todayKits } = useQuery<{
    swatchBookCount: number;
    pressTestKitCount: number;
    totalKitsSentToday: number;
    dailyGoal: number;
    goalMet: boolean;
    remaining: number;
    progress: number;
    swatchBookGoal: number;
    swatchBookGoalMet: boolean;
    swatchBookRemaining: number;
    swatchBookProgress: number;
  }>({
    queryKey: ['/api/labels/today'],
    staleTime: 30 * 1000, // Refresh every 30 seconds
  });

  useEffect(() => {
    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        if (!currentTask?.allDone && !currentTask?.isPaused && currentTask?.session) {
          const remaining = currentTask.session.totalTarget - currentTask.session.totalCompleted;
          if (remaining > 0) {
            setShowIdleModal(true);
          }
        }
      }, IDLE_TIMEOUT_MS);
    };

    resetIdleTimer();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, [currentTask]);

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/spotlight/pause', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      setShowIdleModal(false);
      toast({ title: "Session paused", description: "See you tomorrow!" });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/spotlight/resume', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/efficiency'] });
      toast({ title: "Let's go!", description: "Session resumed" });
    },
  });

  const { data: salesReps = [] } = useQuery<{ id: string; name: string; email: string }[]>({
    queryKey: ['/api/sales-reps'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch machine profiles for current customer (not for leads)
  const customerId = currentTask?.task?.customer?.id;
  const isLeadTask = currentTask?.task?.isLeadTask || customerId?.startsWith('lead-');
  const leadId = currentTask?.task?.leadId || (isLeadTask && customerId ? parseInt(customerId.replace('lead-', '')) : null);
  
  const { data: customerMachines = [] } = useQuery<{ id: number; machineFamily: string; confirmed: boolean }[]>({
    queryKey: ['/api/crm/machine-profiles', customerId],
    queryFn: async () => {
      // Skip machine profiles for lead tasks - leads don't have machine profiles
      if (!customerId || isLeadTask) return [];
      const res = await fetch(`/api/crm/machine-profiles/${customerId}`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!customerId && !isLeadTask,
    staleTime: 60 * 1000,
  });

  // Fetch available machine types for inline add
  const { data: machineTypes = [] } = useQuery<{ id: number; code: string; label: string }[]>({
    queryKey: ['/api/crm/machine-types'],
    staleTime: 5 * 60 * 1000,
  });

  // Add machine mutation (not available for leads)
  const addMachineMutation = useMutation({
    mutationFn: async (machineFamily: string) => {
      if (!customerId) throw new Error('No customer selected');
      if (isLeadTask) throw new Error('Machine profiles are not available for leads. Convert to customer first.');
      return apiRequest('POST', '/api/crm/machine-profiles', { customerId, machineFamily, status: 'confirmed', source: 'spotlight' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/machine-profiles', customerId] });
      setShowAddMachine(false);
      toast({ title: 'Machine added', description: 'Customer machine profile updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error?.message || 'Failed to add machine', variant: 'destructive' });
    },
  });

  // Fetch email templates
  const { data: emailTemplates = [] } = useQuery<{ id: number; name: string; subject: string; body: string; category?: string }[]>({
    queryKey: ['/api/email/templates'],
    staleTime: 5 * 60 * 1000,
  });

  // Send email mutation - also marks task as complete for Follow-Up credit
  const sendEmailMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; body: string; customerId?: string; taskId?: string }) => {
      return apiRequest('POST', '/api/email/send', {
        ...data,
        htmlBody: data.body.replace(/\n/g, '<br>'),
      });
    },
    onSuccess: (_, variables) => {
      setShowEmailComposer(false);
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setSelectedTemplateId(null);
      toast({ title: 'Email sent!', description: 'Your email was sent successfully via Gmail' });
      
      // Mark the current Spotlight task as complete (counts as Follow-Up)
      if (variables.taskId || currentTask?.task?.id) {
        const taskId = variables.taskId || currentTask?.task?.id;
        if (taskId) {
          completeMutation.mutate({ 
            taskId, 
            outcomeId: 'email_sent',
            notes: `Email sent to ${variables.to}: ${variables.subject?.substring(0, 50)}...`
          });
        }
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Could not send email';
      const isConnectionError = errorMessage.toLowerCase().includes('not connected') || 
                                 errorMessage.toLowerCase().includes('reconnect');
      toast({ 
        title: 'Failed to send', 
        description: isConnectionError 
          ? 'Gmail not connected. Please connect your Gmail in Settings to send emails.'
          : errorMessage, 
        variant: 'destructive' 
      });
    },
  });

  const printLabelMutation = useMutation({
    mutationFn: async (data: { labelType: string; otherDescription?: string; quantity: number; notes?: string }) => {
      // For leads, pass leadId instead of customerId
      const res = await apiRequest('POST', '/api/labels/print', {
        customerId: isLeadTask ? undefined : customerId,
        leadId: isLeadTask ? leadId : undefined,
        labelType: data.labelType,
        otherDescription: data.otherDescription,
        quantity: data.quantity,
        notes: data.notes,
      });
      return res;
    },
    onSuccess: (data: any) => {
      // Download the PDF
      if (data?.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
      toast({ title: 'Label printed!', description: `${labelQuantity} label(s) ready for printing` });
      setShowPrintLabel(false);
      setLabelType('swatch_book');
      setLabelOtherDescription('');
      setLabelQuantity(1);
      setLabelNotes('');
    },
    onError: (error: any) => {
      toast({ title: 'Failed to print label', description: error?.message || 'Could not generate label', variant: 'destructive' });
    },
  });

  // Fetch activity events for current customer
  const { data: customerNotes = [] } = useQuery<{ id: number; eventType: string; summary: string; occurredAt: string; metadata?: any }[]>({
    queryKey: ['/api/customer-activity/events', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/customer-activity/events?customerId=${customerId}`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!customerId,
    staleTime: 60 * 1000,
  });

  // Helper to get display name from sales rep
  const getSalesRepDisplayName = (rep: { name?: string; email: string; firstName?: string; lastName?: string }) => {
    // Special handling for info@4sgraphics.com
    if (rep.email?.toLowerCase() === 'info@4sgraphics.com') {
      return '4SGraphics-Info';
    }
    // Use name directly if available (from unified API)
    if (rep.name) {
      return rep.name;
    }
    if (rep.firstName && rep.lastName) {
      return `${rep.firstName} ${rep.lastName}`;
    }
    if (rep.firstName) {
      return rep.firstName;
    }
    // Derive from email: aneesh@4sgraphics.com -> Aneesh
    const emailPrefix = rep.email?.split('@')[0] || '';
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
  };

  // Use PRICING_TIERS constant from shared/schema.ts - single source of truth

  const completeMutation = useMutation({
    mutationFn: async (data: { taskId: string; outcomeId: string; field?: string; value?: string; notes?: string; customFollowUpDays?: number }) => {
      const res = await apiRequest('POST', '/api/spotlight/complete', data);
      return res.json();
    },
    onSuccess: (result) => {
      setIsTransitioning(true);
      setShowSuccess(true);
      
      // PERFORMANCE: Reduced transition delays (was 400ms + 300ms = 700ms)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
        setFieldValue("");
        setNotes("");
        setShowNotes(false);
        
        setTimeout(() => {
          setIsTransitioning(false);
          setShowSuccess(false);
        }, 150); // Reduced from 300ms
      }, 200); // Reduced from 400ms
      
      if (result.nextFollowUp) {
        const date = new Date(result.nextFollowUp.date).toLocaleDateString();
        toast({ 
          title: "Done!",
          description: `Follow-up scheduled for ${date}` 
        });
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (data: { taskId: string; reason: string }) => {
      const res = await apiRequest('POST', '/api/spotlight/skip', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      toast({ title: "Skipped", description: "Moving to next moment..." });
    },
  });

  const remindTodayMutation = useMutation({
    mutationFn: async (data: { taskId: string }) => {
      const res = await apiRequest('POST', '/api/spotlight/remind-today', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      toast({ title: "Reminder set", description: "This will come up again at end of day" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to set reminder", variant: "destructive" });
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await apiRequest('DELETE', `/api/customers/${customerId}?reason=Deleted via Spotlight hygiene`);
      if (!res.ok) {
        if (res.status === 404) {
          // Customer already deleted - treat as success
          return { alreadyDeleted: true };
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete customer');
      }
      return res.json();
    },
    onSuccess: (result) => {
      setShowDeleteConfirm(false);
      setIsTransitioning(true);
      
      // PERFORMANCE: Reduced transition delays
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
        queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
        
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150); // Reduced from 300ms
      }, 200); // Reduced from 400ms
      
      toast({ 
        title: result?.alreadyDeleted ? "Customer already deleted" : "Customer deleted", 
        description: result?.alreadyDeleted 
          ? "This customer was already removed from the system"
          : result?.excluded 
            ? "Customer removed and blocked from re-import" 
            : "Customer removed from database"
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete customer", variant: "destructive" });
    },
  });

  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);

  const feedbackMutation = useMutation({
    mutationFn: async (data: { customerId: string; objectionType: string; categoryName: string }) => {
      const res = await apiRequest('POST', '/api/crm/objections', data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      const feedbackLabel = PRICING_FEEDBACK_OPTIONS.find(o => o.id === variables.objectionType)?.label || variables.objectionType;
      toast({ 
        title: "Feedback logged", 
        description: `"${feedbackLabel}" recorded for this quote` 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not log feedback", variant: "destructive" });
    },
  });

  const handleFeedbackClick = (feedbackId: string) => {
    if (!currentTask?.task) return;
    if (selectedFeedback.includes(feedbackId)) return;
    
    const customerId = currentTask.task.customerId;
    const categoryName = currentTask.task.context?.followUpTitle || 'Quote Follow-up';
    
    setSelectedFeedback(prev => [...prev, feedbackId]);
    feedbackMutation.mutate({ customerId, objectionType: feedbackId, categoryName });
  };

  const fixDataMutation = useMutation({
    mutationFn: async (data: { customerId?: string; leadId?: number; updates: Record<string, string> }) => {
      // For lead tasks, update the lead record instead of customer
      if (data.leadId) {
        const res = await apiRequest('PUT', `/api/leads/${data.leadId}`, data.updates);
        return res.json();
      }
      // For regular customer tasks
      const res = await apiRequest('PUT', `/api/customers/${data.customerId}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      const isLead = currentTask?.task?.isLeadTask;
      toast({ title: "Data updated", description: `${isLead ? 'Lead' : 'Customer'} information has been updated.` });
      setShowFixDataModal(false);
      setFixDataFields({ email: '', pricingTier: '', salesRepId: '' });
      setAvailableEmails([]);
      
      // Mark the current task as complete so it counts toward the quota
      if (currentTask?.task) {
        completeMutation.mutate({ 
          taskId: currentTask.task.id, 
          outcomeId: 'fixed_data'
        });
      } else {
        refetch();
      }
    },
    onError: () => {
      const isLead = currentTask?.task?.isLeadTask;
      toast({ title: "Error", description: `Failed to update ${isLead ? 'lead' : 'customer'} data`, variant: "destructive" });
    },
  });

  const handleFixData = async (missingFields: string[]) => {
    setMissingFieldsToFix(missingFields);
    const customer = currentTask?.task?.customer;
    const lead = currentTask?.task?.lead;
    const customerId = currentTask?.task?.customerId;
    const isLeadTask = currentTask?.task?.isLeadTask || customerId?.startsWith('lead-');
    
    // Collect emails from customer or lead
    const emails: string[] = [];
    if (isLeadTask && lead?.email) {
      emails.push(lead.email);
    } else if (customer?.email) {
      emails.push(customer.email);
    }
    
    // Fetch contacts to get additional emails (only for customers, not leads)
    if (customerId && !isLeadTask) {
      try {
        const res = await fetch(`/api/customers/${customerId}/contacts`);
        if (res.ok) {
          const contacts = await res.json();
          contacts.forEach((contact: any) => {
            if (contact.email && !emails.includes(contact.email)) {
              emails.push(contact.email);
            }
          });
        }
      } catch (e) {
        console.error('Failed to fetch contacts:', e);
      }
    }
    
    setAvailableEmails(emails);
    // Use lead data for lead tasks, customer data for customer tasks
    if (isLeadTask && lead) {
      setFixDataFields({
        email: lead.email || '',
        pricingTier: lead.pricingTier || '',
        salesRepId: lead.salesRepId || '',
      });
    } else {
      setFixDataFields({
        email: customer?.email || '',
        pricingTier: customer?.pricingTier || '',
        salesRepId: customer?.salesRepId || '',
      });
    }
    setShowFixDataModal(true);
  };

  const submitFixData = () => {
    if (!currentTask?.task) return;
    const updates: Record<string, string> = {};
    if (missingFieldsToFix.includes('email') && fixDataFields.email.trim()) {
      updates.email = fixDataFields.email.trim();
    }
    if (missingFieldsToFix.includes('pricing tier') && fixDataFields.pricingTier) {
      updates.pricingTier = fixDataFields.pricingTier;
    }
    if (missingFieldsToFix.includes('sales rep') && fixDataFields.salesRepId) {
      updates.salesRepId = fixDataFields.salesRepId;
      // Also set salesRepName using the helper
      const rep = salesReps.find(r => r.id === fixDataFields.salesRepId);
      if (rep) {
        updates.salesRepName = getSalesRepDisplayName(rep);
      }
    }
    if (Object.keys(updates).length > 0) {
      // For lead tasks, update the lead instead of the customer
      const isLeadTask = currentTask.task.isLeadTask || currentTask.task.customerId?.startsWith('lead-');
      if (isLeadTask && currentTask.task.leadId) {
        fixDataMutation.mutate({ leadId: currentTask.task.leadId, updates });
      } else if (!isLeadTask && currentTask.task.customerId) {
        fixDataMutation.mutate({ customerId: currentTask.task.customerId, updates });
      }
    }
  };

  useEffect(() => {
    setSelectedFeedback([]);
  }, [currentTask?.task?.id]);

  // Merge customers mutation
  const mergeCustomersMutation = useMutation({
    mutationFn: async ({ targetId, sourceId, fieldSelections }: { targetId: string; sourceId: string; fieldSelections?: Record<string, string> }) => {
      return await apiRequest("POST", `/api/customers/merge`, { targetId, sourceId, fieldSelections });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Clients merged",
        description: "The two clients have been merged successfully",
      });
      setShowMergeModal(false);
      setMergeData(null);
      setMergeTarget(null);
      setMergeFieldSelections({});
      setMergeEmailSelections({ primary: '', secondary: '' });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error merging clients",
        description: error.message || "Failed to merge clients",
        variant: "destructive",
      });
    },
  });

  // Do Not Merge mutation - mark customers as separate entities and complete the task
  const doNotMergeMutation = useMutation({
    mutationFn: async ({ customerId1, customerId2, taskId }: { customerId1: string; customerId2: string; taskId?: string }) => {
      const result = await apiRequest("POST", `/api/customers/do-not-merge`, { customerId1, customerId2 });
      return { result, taskId };
    },
    onSuccess: ({ taskId }) => {
      toast({
        title: "Marked as separate",
        description: "These customers won't be suggested as duplicates again",
      });
      // Complete the task to move to the next card
      if (taskId) {
        completeMutation.mutate({ 
          taskId, 
          outcomeId: 'not_duplicate',
          notes: 'Marked as separate customers - not duplicates'
        });
      } else {
        refetch(); // Fallback: just refresh hints
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark as do not merge",
        variant: "destructive",
      });
    },
  });

  // Assign as Lead mutation - convert a customer to a lead
  const assignAsLeadMutation = useMutation({
    mutationFn: async ({ customerId, taskId }: { customerId: string; taskId?: string }) => {
      const result = await apiRequest("POST", `/api/leads/convert-from-contact`, { customerId });
      return { result, taskId };
    },
    onSuccess: ({ result, taskId }) => {
      toast({
        title: "Assigned as Lead",
        description: `${result.lead?.name || 'Contact'} is now a lead in your pipeline`,
      });
      // Complete the task to move to the next card
      if (taskId) {
        completeMutation.mutate({ 
          taskId, 
          outcomeId: 'converted_to_lead',
          notes: 'Converted to lead for trust-building workflow'
        });
      } else {
        refetch();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign as lead",
        variant: "destructive",
      });
    },
  });

  const handleOpenMergeModal = async (duplicateIds: string[], currentCustomerId: string) => {
    try {
      // Check if this is a lead task (customer ID starts with 'lead-')
      const isLeadTask = currentCustomerId.startsWith('lead-');
      
      if (isLeadTask) {
        // For leads, the current customer doesn't exist in customers table
        // Fetch only the duplicate customer, and use task.customer data for current
        const duplicateRes = await fetch(`/api/customers/${duplicateIds[0]}`);
        
        if (!duplicateRes.ok) {
          throw new Error('Failed to fetch customer data');
        }
        
        const duplicateCustomer = await duplicateRes.json();
        
        // Get current lead's customer data from current task
        const currentCustomer = currentTask?.task?.customer || {};
        
        // Collect all unique emails from both
        const allEmails: string[] = [];
        if (currentCustomer.email) allEmails.push(currentCustomer.email);
        if (duplicateCustomer.email) allEmails.push(duplicateCustomer.email);
        if (duplicateCustomer.email2) allEmails.push(duplicateCustomer.email2);
        const uniqueEmails = [...new Set(allEmails.filter((e: string) => e && e.trim()))];
        
        setMergeData({
          sourceCustomer: { ...currentCustomer, isLead: true },
          targetCustomer: duplicateCustomer,
          duplicateIds,
        });
        setMergeTarget(duplicateIds[0]); // Default to keeping the duplicate as primary
        setMergeFieldSelections({});
        setMergeEmailSelections({
          primary: uniqueEmails[0] || '',
          secondary: uniqueEmails[1] || ''
        });
        setShowMergeModal(true);
        return;
      }
      
      // Regular customer merge flow
      const [currentRes, duplicateRes] = await Promise.all([
        fetch(`/api/customers/${currentCustomerId}`),
        fetch(`/api/customers/${duplicateIds[0]}`)
      ]);
      
      if (!currentRes.ok || !duplicateRes.ok) {
        throw new Error('Failed to fetch customer data');
      }
      
      const currentCustomer = await currentRes.json();
      const duplicateCustomer = await duplicateRes.json();
      
      // Collect all unique emails from both customers
      const allEmails: string[] = [];
      if (currentCustomer.email) allEmails.push(currentCustomer.email);
      if (currentCustomer.email2) allEmails.push(currentCustomer.email2);
      if (duplicateCustomer.email) allEmails.push(duplicateCustomer.email);
      if (duplicateCustomer.email2) allEmails.push(duplicateCustomer.email2);
      const uniqueEmails = [...new Set(allEmails.filter(e => e && e.trim()))];
      
      setMergeData({
        sourceCustomer: currentCustomer,
        targetCustomer: duplicateCustomer,
        duplicateIds,
      });
      setMergeTarget(duplicateIds[0]); // Default to keeping the duplicate as primary
      setMergeFieldSelections({});
      // Pre-select first email as primary, second as secondary
      setMergeEmailSelections({
        primary: uniqueEmails[0] || '',
        secondary: uniqueEmails[1] || ''
      });
      setShowMergeModal(true);
    } catch (error) {
      console.error('[Merge] Error loading customer data:', error);
      toast({
        title: "Error",
        description: "Could not load customer data for merge",
        variant: "destructive"
      });
    }
  };

  const handleMerge = () => {
    if (!mergeData || !mergeTarget) return;
    
    const sourceId = mergeTarget === mergeData.targetCustomer.id 
      ? mergeData.sourceCustomer.id 
      : mergeData.targetCustomer.id;
    
    // Build email-related field selections
    const allEmails = getMergeEmails();
    const emailFieldSelections: Record<string, string> = { ...mergeFieldSelections };
    
    // Set primary email
    if (mergeEmailSelections.primary) {
      emailFieldSelections['email'] = mergeEmailSelections.primary;
    }
    // Set secondary email
    if (mergeEmailSelections.secondary) {
      emailFieldSelections['email2'] = mergeEmailSelections.secondary;
    }
    // Any extra emails go to notes
    const extraEmails = allEmails.filter(e => e !== mergeEmailSelections.primary && e !== mergeEmailSelections.secondary);
    if (extraEmails.length > 0) {
      emailFieldSelections['extraEmailsForNotes'] = extraEmails.join(', ');
    }
    
    mergeCustomersMutation.mutate({ 
      targetId: mergeTarget, 
      sourceId, 
      fieldSelections: emailFieldSelections 
    });
  };

  const mergeFields = [
    { key: 'company', label: 'Company Name' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'address1', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'province', label: 'Province' },
    { key: 'pricingTier', label: 'Pricing Tier' },
  ];

  // Get all unique emails from both customers for merge modal
  const getMergeEmails = () => {
    if (!mergeData) return [];
    const allEmails: string[] = [];
    if (mergeData.sourceCustomer.email) allEmails.push(mergeData.sourceCustomer.email);
    if (mergeData.sourceCustomer.email2) allEmails.push(mergeData.sourceCustomer.email2);
    if (mergeData.targetCustomer.email) allEmails.push(mergeData.targetCustomer.email);
    if (mergeData.targetCustomer.email2) allEmails.push(mergeData.targetCustomer.email2);
    return [...new Set(allEmails.filter(e => e && e.trim()))];
  };

  const handleOutcome = (outcomeId: string, field?: string, value?: string) => {
    if (!currentTask?.task) return;
    
    // If custom follow-up is selected, show the dialog instead
    if (outcomeId === 'custom_followup') {
      setShowFollowUpDialog(true);
      return;
    }
    
    completeMutation.mutate({ 
      taskId: currentTask.task.id, 
      outcomeId,
      field, 
      value,
      notes: notes.trim() || undefined,
    });
  };
  
  const handleCustomFollowUp = () => {
    if (!currentTask?.task) return;
    const validDays = Math.max(1, Math.min(90, followUpDays || 7));
    completeMutation.mutate({ 
      taskId: currentTask.task.id, 
      outcomeId: 'custom_followup',
      customFollowUpDays: validDays,
      notes: notes.trim() || undefined,
    }, {
      onSuccess: () => {
        setShowFollowUpDialog(false);
        setFollowUpDays(7);
      }
    });
  };

  const handleSkip = () => {
    if (!currentTask?.task) return;
    skipMutation.mutate({ taskId: currentTask.task.id, reason: 'not_now' });
  };

  // Open email composer with customer's or lead's email prefilled
  const handleOpenEmailComposer = () => {
    const customer = currentTask?.task?.customer;
    const lead = currentTask?.task?.lead;
    const isLeadTask = currentTask?.task?.isLeadTask;
    
    // Use lead email for lead tasks, otherwise customer email
    const emailAddress = isLeadTask ? (lead?.email || customer?.email) : customer?.email;
    if (emailAddress) {
      setEmailTo(emailAddress);
    }
    // Pre-fill subject with customer/company/lead name if available
    const customerName = isLeadTask 
      ? (lead?.name || lead?.company || customer?.company || '')
      : (customer?.company || [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || '');
    if (customerName) {
      setEmailSubject(`Following up - ${customerName}`);
    }
    // Pre-fill body with signature if available (keep as HTML)
    const initialBody = userSignature?.signatureHtml 
      ? `<p></p><p></p>${userSignature.signatureHtml}` 
      : '<p></p>';
    setEmailBody(initialBody);
    setShowEmailComposer(true);
    // Set the editor content after dialog opens
    setTimeout(() => {
      emailEditorRef.current?.setContent(initialBody);
    }, 100);
  };

  // Helper to convert HTML to plain text with proper line breaks
  const htmlToPlainText = (html: string): string => {
    // First replace block-level elements with newlines
    let text = html
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li>/gi, '• ')
      .replace(/<ul>|<\/ul>|<ol>|<\/ol>/gi, '\n');
    
    // Parse remaining HTML and get text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up excessive whitespace while preserving intentional line breaks
    return text
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Handle template selection - fill in subject and body
  const handleTemplateSelect = (templateId: string) => {
    const id = parseInt(templateId);
    setSelectedTemplateId(id);
    const template = emailTemplates.find(t => t.id === id);
    if (template) {
      const customer = currentTask?.task?.customer;
      // Replace basic variables in template
      let subject = template.subject;
      let body = template.body;
      const customerName = customer?.company || [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || '';
      const contactName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || '';
      if (customerName) {
        subject = subject.replace(/\{\{name\}\}/gi, customerName).replace(/\{\{customer_name\}\}/gi, customerName);
        body = body.replace(/\{\{name\}\}/gi, customerName).replace(/\{\{customer_name\}\}/gi, customerName);
      }
      if (contactName) {
        subject = subject.replace(/\{\{contact_name\}\}/gi, contactName);
        body = body.replace(/\{\{contact_name\}\}/gi, contactName);
      }
      if (customer?.firstName) {
        body = body.replace(/\{\{client\.firstName\}\}/gi, customer.firstName);
      }
      
      // Replace sales rep variable with current user's name from signature
      const salesRepName = userSignature?.name || 'Your Sales Rep';
      body = body.replace(/\{\{client\.salesRep\}\}/gi, salesRepName);
      body = body.replace(/\{\{salesRep\}\}/gi, salesRepName);
      body = body.replace(/\{\{user\.name\}\}/gi, salesRepName);
      body = body.replace(/\{\{sender\}\}/gi, salesRepName);
      
      // Replace {{user.signature}} variable with actual signature HTML
      // Track if template had the variable so we don't double-append
      const hadSignatureVariable = /\{\{user\.signature\}\}/gi.test(body);
      if (userSignature?.signatureHtml) {
        body = body.replace(/\{\{user\.signature\}\}/gi, userSignature.signatureHtml);
        subject = subject.replace(/\{\{user\.signature\}\}/gi, ''); // Remove from subject if present
      } else {
        // Remove the placeholder if no signature is configured
        body = body.replace(/\{\{user\.signature\}\}/gi, '');
        subject = subject.replace(/\{\{user\.signature\}\}/gi, '');
      }
      
      // Convert plain text with bullet points to HTML if needed
      if (!body.includes('<') || !body.includes('>')) {
        // Plain text - convert line breaks and bullets to HTML
        body = body
          .split('\n')
          .map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
              return `<li>${trimmed.substring(1).trim()}</li>`;
            }
            return trimmed ? `<p>${trimmed}</p>` : '<p><br></p>';
          })
          .join('');
        // Wrap consecutive list items in ul
        body = body.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
      }
      
      // Append signature if available (only if template didn't have {{user.signature}} variable)
      if (userSignature?.signatureHtml && !hadSignatureVariable) {
        body = body + `<br><br>${userSignature.signatureHtml}`;
      }
      
      setEmailSubject(subject);
      setEmailBody(body);
      // Update the rich text editor content
      setTimeout(() => {
        emailEditorRef.current?.setContent(body);
      }, 50);
    }
  };

  // Send email handler
  const handleSendEmail = () => {
    const htmlBody = emailEditorRef.current?.getHTML() || emailBody;
    if (!emailTo || !emailSubject || !htmlBody) {
      toast({ title: 'Missing fields', description: 'Please fill in recipient, subject, and message', variant: 'destructive' });
      return;
    }
    // For lead tasks, don't pass lead-prefixed customerId - it's not a valid customer ID
    const taskCustomerId = currentTask?.task?.customer?.id;
    const validCustomerId = taskCustomerId && !taskCustomerId.startsWith('lead-') ? taskCustomerId : undefined;
    sendEmailMutation.mutate({
      to: emailTo,
      subject: emailSubject,
      body: htmlBody,
      customerId: validCustomerId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111111] mx-auto mb-4" />
          <p className="text-[#666666] text-sm font-medium">Loading Spotlight...</p>
        </div>
      </div>
    );
  }

  const session = currentTask?.session;
  const progress = session ? (session.totalCompleted / session.totalTarget) * 100 : 0;

  if (currentTask?.isPaused) {
    const remaining = (session?.totalTarget || 30) - (session?.totalCompleted || 0);
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-[#EAEAEA] bg-white">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-6">
            <Coffee className="w-12 h-12 text-indigo-500" />
          </div>
          <CardTitle className="text-2xl mb-2 text-[#111111]">Session Paused</CardTitle>
          <CardDescription className="text-[#666666] mb-6 text-base">
            You've paused for today with {remaining} moments remaining.
            <br />Take a break and come back refreshed!
          </CardDescription>
          
          {efficiency && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Score: {efficiency.score}</span>
              </div>
              {efficiency.streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-600">
                  <Flame className="w-4 h-4" />
                  <span className="font-medium">{efficiency.streak} day streak</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button 
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
              className="bg-[#111111] hover:bg-[#333333] text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentTask?.allDone || currentTask?.session?.dayComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-[#EAEAEA] bg-white">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl mb-2 text-[#111111]">Day Complete!</CardTitle>
          <CardDescription className="text-[#666666] mb-6 text-base">
            You've finished your {session?.totalTarget || 30} moments for today. 
            <br />Great work building momentum!
          </CardDescription>
          
          {session && (
            <div className="grid grid-cols-5 gap-2 mb-6">
              {session.buckets.map((bucket) => {
                const info = BUCKET_INFO[bucket.bucket];
                const BucketIcon = info.icon;
                return (
                  <div key={bucket.bucket} className="text-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
                      style={{ backgroundColor: info.color + '20' }}
                    >
                      <BucketIcon className="w-5 h-5" style={{ color: info.color }} />
                    </div>
                    <p className="text-xs font-medium text-[#111111]">{bucket.completed}/{bucket.target}</p>
                    <p className="text-xs text-[#999999]">{info.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentTask?.task) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-[#EAEAEA] bg-white">
          <div className="w-20 h-20 rounded-full bg-[#F2F2F2] flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-[#999999]" />
          </div>
          <CardTitle className="text-xl mb-2 text-[#111111]">No Tasks Available</CardTitle>
          <CardDescription className="text-[#666666] mb-6">
            Check back later or refresh to find new moments.
          </CardDescription>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-[#EAEAEA]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={() => refetch()} className="bg-[#111111] hover:bg-[#333333] text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const task = currentTask.task;
  const bucketInfo = BUCKET_INFO[task.bucket];
  const BucketIcon = bucketInfo.icon;
  const customer = task.customer;
  const customerName = customer.company || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Client';
  
  // For Lead tasks, use lead data for email/address; for customers use customer data
  const effectiveEmail = task.isLeadTask ? (task.lead?.email || customer.email) : customer.email;
  const effectiveAddress = task.isLeadTask ? (task.lead?.address || customer.address1) : customer.address1;
  
  // Calculate remaining for the day
  const remaining = (session?.totalTarget || 30) - (session?.totalCompleted || 0);
  const isPaused = currentTask?.isPaused;
  const isComplete = currentTask?.allDone || currentTask?.session?.dayComplete;

  // Determine task card styling based on task type
  const getTaskCardStyle = () => {
    if (task.context?.sourceType === 'drip_reply') return TASK_CARD_STYLES.drip_reply;
    if (task.context?.sourceType === 'email_pricing_samples' || 
        task.context?.sourceType === 'unreplied_email') return TASK_CARD_STYLES.email_intelligence;
    if (task.isLeadTask || task.context?.sourceType === 'lead') return TASK_CARD_STYLES.lead;
    return TASK_CARD_STYLES[task.bucket] || TASK_CARD_STYLES.calls;
  };
  
  const getSourceBadge = () => {
    if (task.context?.sourceType === 'drip_reply') return SOURCE_BADGES.drip;
    if (task.context?.sourceType === 'email_pricing_samples' || 
        task.context?.sourceType === 'unreplied_email') return SOURCE_BADGES.email;
    if (task.isLeadTask || task.context?.sourceType === 'lead') return SOURCE_BADGES.lead;
    return SOURCE_BADGES.customer;
  };
  
  const cardStyle = getTaskCardStyle();
  const sourceBadge = getSourceBadge();

  return (
    <div className="spotlight-container min-h-screen p-4 lg:p-6">
      {/* COMPACT SINGLE-SCREEN LAYOUT */}
      <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
        
        {/* TOP BAR - Slim Progress Strip */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #F87171 0%, #A78BFA 50%, #3B82F6 100%)'
                  }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                {session?.totalCompleted || 0}/{session?.totalTarget || 30}
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-4 border-l border-slate-200 pl-4">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-slate-600">{efficiency?.streak || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-slate-600">{efficiency?.score || 0}%</span>
              </div>
            </div>
            
            {/* Bucket Pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {session?.buckets
                ?.filter((b) => ['calls', 'outreach', 'data_hygiene'].includes(b.bucket))
                .map((bucket) => {
                  const info = BUCKET_INFO[bucket.bucket];
                  const isCurrent = bucket.bucket === task.bucket;
                  return (
                    <div 
                      key={bucket.bucket} 
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isCurrent 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {bucket.completed}/{bucket.target}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        
        {/* MAIN CONTENT - Two Column Layout */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          
          {/* LEFT - Main Task Card (takes most space) */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Success Overlay */}
            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center animate-ping">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            
            {/* COLOR-CODED TASK CARD */}
            <div className={`transition-all duration-300 flex-1 flex flex-col min-h-0 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className={`bg-gradient-to-br ${cardStyle.gradient} rounded-3xl border-2 ${cardStyle.border} shadow-lg flex-1 flex flex-col overflow-hidden relative`}>
                
                {/* SOURCE BADGE - Top Right Corner */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`${sourceBadge.bg} ${sourceBadge.text} text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wider`}>
                    {sourceBadge.label}
                  </span>
                </div>
                
                {/* COMPACT HEADER - Task Type + Why Now */}
                <div className="p-4 pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl ${cardStyle.accent} flex items-center justify-center shadow-sm`}>
                      <BucketIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-wider ${cardStyle.icon}`}>
                        {bucketInfo.label}
                      </p>
                      <p className="text-sm text-slate-600 truncate">{task.whyNow}</p>
                    </div>
                  </div>
                  
                  {/* Smart Hints - Compact */}
                  {currentTask.hints && currentTask.hints.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {currentTask.hints.slice(0, 2).map((hint, idx) => {
                        const style = HINT_STYLES[hint.type];
                        return (
                          <span 
                            key={idx}
                            className={`text-[11px] px-2 py-0.5 rounded-full ${style.bg} ${style.textColor} font-medium`}
                          >
                            {hint.message.length > 40 ? hint.message.slice(0, 40) + '...' : hint.message}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* CUSTOMER INFO - Rounded Pill Area (inspiration from attached image) */}
                <div className="mx-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-inner p-4 border border-white/50">
                  {/* Customer Name & Hot Badge Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-slate-800 truncate">
                        {customer.company || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown'}
                      </h2>
                      {(customer.firstName || customer.lastName) && customer.company && (
                        <p className="text-sm text-slate-500 truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                      )}
                    </div>
                    
                    {/* Hot Prospect Badge */}
                    {(() => {
                      const isHot = optimisticHotProspect ?? (task.isLeadTask ? (task.lead?.score && task.lead.score >= 50) : customer.isHotProspect);
                      if (isHot) {
                        return (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                            <Flame className="w-3 h-3" />
                            HOT
                          </span>
                        );
                      }
                      return (
                        <button
                          className="text-xs text-slate-400 hover:text-orange-500 flex items-center gap-1 px-2 py-1 rounded-full hover:bg-orange-50 transition-colors"
                          onClick={() => {
                            setOptimisticHotProspect(true);
                            apiRequest('PUT', `/api/customers/${customer.id}`, { isHotProspect: true })
                              .catch(() => setOptimisticHotProspect(null));
                          }}
                        >
                          <Flame className="w-3 h-3" />
                          Mark Hot
                        </button>
                      );
                    })()}
                  </div>
                  
                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* Email */}
                    {customer.email && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className={`w-4 h-4 flex-shrink-0 ${cardStyle.icon}`} />
                        <a href={`mailto:${customer.email}`} className="text-slate-600 hover:text-blue-600 truncate">
                          {customer.email}
                        </a>
                      </div>
                    )}
                    {/* Phone */}
                    {customer.phone && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className={`w-4 h-4 flex-shrink-0 ${cardStyle.icon}`} />
                        <a href={`tel:${customer.phone}`} className="text-slate-600 hover:text-blue-600 truncate">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    {/* Type Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Type:</span>
                      <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
                        {(['printer', 'reseller'] as const).map((type) => {
                          const displayType = optimisticCustomerType || (task.isLeadTask ? task.lead?.customerType : customer.customerType);
                          const isActive = displayType === type;
                          return (
                            <button
                              key={type}
                              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                                isActive 
                                  ? type === 'printer' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                                  : 'text-slate-500 hover:bg-slate-200'
                              }`}
                              onClick={() => {
                                setOptimisticCustomerType(type);
                                const endpoint = task.isLeadTask ? `/api/leads/${task.lead?.id}` : `/api/customers/${customer.id}`;
                                apiRequest('PUT', endpoint, { customerType: type }).catch(() => setOptimisticCustomerType(null));
                              }}
                            >
                              {type === 'printer' ? '🖨️' : '🚚'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Machines (compact) */}
                    {!task.isLeadTask && (
                      <div className="flex items-center gap-2">
                        <Settings className={`w-4 h-4 flex-shrink-0 ${cardStyle.icon}`} />
                        <span className="text-xs text-slate-500">
                          {customerMachines.length > 0 
                            ? customerMachines.slice(0, 2).map(m => m.machineFamily).join(', ') 
                            : 'No machines'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Actions Row */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                      onClick={handleOpenEmailComposer}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </button>
                    {effectiveAddress && (
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors"
                        onClick={() => setShowPrintLabel(true)}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Label
                      </button>
                    )}
                    <a 
                      href={task.isLeadTask 
                        ? `https://maps.google.com/?q=${encodeURIComponent(`${task.lead?.city || ''} ${task.lead?.state || ''}`)}` 
                        : `https://maps.google.com/?q=${encodeURIComponent(`${customer.city || ''} ${customer.province || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Map
                    </a>
                    <button 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors ml-auto"
                      onClick={() => setShowProfilePanel(true)}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Full Profile
                    </button>
                  </div>
                </div>
                
                {/* OUTCOME ACTIONS - Horizontal Pill Layout */}
                <div className="p-4 mt-auto">
                  {task.bucket !== 'data_hygiene' && task.outcomes.length > 0 && (
                    <div className="space-y-3">
                      {/* Primary Actions - Big Pills */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {task.outcomes.slice(0, 4).map((outcome) => {
                          const OutcomeIcon = outcome.icon ? OUTCOME_ICONS[outcome.icon] : Check;
                          const isPositive = ['connected', 'completed', 'sent', 'done', 'email_sent', 'called'].includes(outcome.id);
                          const isNegative = ['bad_number', 'not_interested', 'lost'].includes(outcome.id);
                          return (
                            <button
                              key={outcome.id}
                              onClick={() => handleOutcome(outcome.id)}
                              disabled={completeMutation.isPending}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                                isPositive 
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                  : isNegative
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                              }`}
                            >
                              {OutcomeIcon && <OutcomeIcon className="w-4 h-4" />}
                              {outcome.label}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Secondary Actions */}
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          onClick={() => completeMutation.mutate({ taskId: task.id, outcomeId: 'bad_fit', outcomeLabel: 'Bad Fit' })}
                        >
                          <Ban className="w-3.5 h-3.5 inline mr-1" />
                          Bad Fit
                        </button>
                        <button 
                          className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                          onClick={handleSkip}
                        >
                          <SkipForward className="w-3.5 h-3.5 inline mr-1" />
                          Skip
                        </button>
                        <button 
                          className="px-3 py-1.5 text-xs font-medium text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
                          onClick={() => remindTodayMutation.mutate({ taskId: task.id })}
                        >
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          Later
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Data Hygiene Actions */}
                  {task.bucket === 'data_hygiene' && task.outcomes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {task.outcomes.map((outcome) => {
                        const OutcomeIcon = outcome.icon ? OUTCOME_ICONS[outcome.icon] : Check;
                        return (
                          <button
                            key={outcome.id}
                            onClick={() => handleOutcome(outcome.id)}
                            disabled={completeMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                          >
                            {OutcomeIcon && <OutcomeIcon className="w-4 h-4" />}
                            {outcome.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* RIGHT - Coaching Tips (Collapsible) */}
          <div className="hidden lg:flex w-64 flex-shrink-0 flex-col">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-4 flex-1 overflow-y-auto">
              {/* Coaching Script */}
              <div className="mb-4">
                <button 
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setCallScriptOpen(!callScriptOpen)}
                >
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" />
                    Calling Tips
                  </span>
                  {callScriptOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {callScriptOpen && (
                  <div className="mt-2 space-y-1.5">
                    {callScriptIdeas.map((idea, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5" />
                        <p className="text-xs text-slate-500">{idea}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Email Ideas */}
              <div>
                <button 
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setEmailIdeasOpen(!emailIdeasOpen)}
                >
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Ideas
                  </span>
                  {emailIdeasOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {emailIdeasOpen && (
                  <div className="mt-2 space-y-1.5">
                    {emailIdeas.map((idea, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5" />
                        <p className="text-xs text-slate-500">{idea}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Full Profile Side Panel */}
      <Sheet open={showProfilePanel} onOpenChange={setShowProfilePanel}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-600" />
              {customer?.company || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Customer Profile'}
            </SheetTitle>
            <SheetDescription>Full customer details - no page navigation needed</SheetDescription>
          </SheetHeader>
          
          {customer && (
            <div className="py-6 space-y-6">
              {/* Key Contact */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Key Contact</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-800">
                      {customer.firstName || customer.lastName ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'No name on file'}
                    </span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline text-sm">
                        {customer.email}
                      </a>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline text-sm">
                        {customer.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {customer.address1 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Address</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <div className="text-sm text-slate-700">
                        <p>{customer.address1}</p>
                        {customer.address2 && <p>{customer.address2}</p>}
                        <p>{customer.city}, {customer.province} {customer.zip}</p>
                        {customer.country && <p>{customer.country}</p>}
                      </div>
                    </div>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${customer.address1}, ${customer.city || ''} ${customer.province || ''} ${customer.zip || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      Open in Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Business Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Business Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Pricing Tier</p>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 capitalize">
                      {customer.pricingTier || 'Not set'}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Sales Rep</p>
                    <p className="text-sm font-medium text-slate-800">{customer.salesRepName || 'Unassigned'}</p>
                  </div>
                </div>
                {customer.website && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Website</p>
                    <a 
                      href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      {customer.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Machines */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Machines</h4>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {customerMachines.length > 0 ? (
                      customerMachines.map((m) => (
                        <Badge key={m.id} variant="outline" className="text-xs bg-white">
                          {m.machineFamily}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No machines on file</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Notes */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Recent Notes</h4>
                <div className="space-y-2">
                  {customerNotes.length > 0 ? (
                    customerNotes.slice(0, 5).map((note) => (
                      <div key={note.id} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-blue-600 mb-1">
                          {new Date(note.occurredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-slate-700">{note.summary}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">No notes yet</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setShowProfilePanel(false);
                        handleOpenEmailComposer();
                      }}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Send Email
                    </Button>
                  )}
                  {customer.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      asChild
                    >
                      <a href={`tel:${customer.phone}`}>
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </a>
                    </Button>
                  )}
                  <Link href={`/odoo-contacts/${customer.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowProfilePanel(false)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Full Page
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Customer?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <span className="block">
                  <span className="font-medium text-gray-900">
                    {customer?.company || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'This customer'}
                  </span>
                  {customer?.email && <span className="text-gray-500 ml-1">({customer.email})</span>}
                </span>
                <span className="block text-amber-600">
                  This action cannot be undone. The customer will be permanently removed and blocked from future imports.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => customer?.id && deleteMutation.mutate(customer.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Idle Check-in Modal */}
      <Dialog open={showIdleModal} onOpenChange={setShowIdleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-indigo-500" />
              Taking a break?
            </DialogTitle>
            <DialogDescription>
              You've been away for a while. Would you like to continue or pause for today?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {efficiency && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-600">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Score: {efficiency.score}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">{(session?.totalTarget || 30) - (session?.totalCompleted || 0)} left</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                pauseMutation.mutate();
              }}
              disabled={pauseMutation.isPending}
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Until Tomorrow
            </Button>
            <Button
              onClick={() => {
                setShowIdleModal(false);
                lastActivityRef.current = Date.now();
              }}
              className="flex-1 bg-[#111111] hover:bg-[#333333]"
            >
              <Play className="w-4 h-4 mr-2" />
              Keep Going
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fix Data Modal */}
      <Dialog open={showFixDataModal} onOpenChange={setShowFixDataModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-500" />
              Update Missing Data
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1">
                <span className="font-medium text-gray-900 block">
                  {customer?.company || customer?.firstName || 'Unknown'}
                </span>
                {customer?.email && (
                  <a 
                    href={`mailto:${customer.email}`}
                    className="text-sm text-primary hover:underline block"
                  >
                    {customer.email}
                  </a>
                )}
                <span className="text-gray-400 mt-1 block">Fill in the missing information to improve data quality.</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {missingFieldsToFix.includes('email') && (
              <div className="space-y-2">
                <Label htmlFor="fix-email" className="text-sm font-medium">Email Address</Label>
                {availableEmails.length > 0 ? (
                  <div className="space-y-2">
                    <Select 
                      value={fixDataFields.email} 
                      onValueChange={(value) => setFixDataFields(prev => ({ ...prev, email: value === '__new__' ? '' : value }))}
                    >
                      <SelectTrigger className="border-[#EAEAEA]">
                        <SelectValue placeholder="Select an email..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEmails.map((email) => (
                          <SelectItem key={email} value={email}>
                            {email}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">
                          <span className="text-blue-600">+ Enter new email</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fixDataFields.email === '' && (
                      <Input
                        type="email"
                        value={fixDataFields.email}
                        onChange={(e) => setFixDataFields(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter new email address..."
                        className="border-[#EAEAEA]"
                      />
                    )}
                  </div>
                ) : (
                  <Input
                    id="fix-email"
                    type="email"
                    value={fixDataFields.email}
                    onChange={(e) => setFixDataFields(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="customer@example.com"
                    className="border-[#EAEAEA]"
                  />
                )}
              </div>
            )}
            {missingFieldsToFix.includes('pricing tier') && (
              <div className="space-y-2">
                <Label htmlFor="fix-pricing" className="text-sm font-medium">Pricing Tier</Label>
                <Select 
                  value={fixDataFields.pricingTier} 
                  onValueChange={(value) => setFixDataFields(prev => ({ ...prev, pricingTier: value }))}
                >
                  <SelectTrigger className="border-[#EAEAEA]">
                    <SelectValue placeholder="Select pricing tier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {missingFieldsToFix.includes('sales rep') && (
              <div className="space-y-2">
                <Label htmlFor="fix-salesrep" className="text-sm font-medium">Sales Rep</Label>
                <Select 
                  value={fixDataFields.salesRepId} 
                  onValueChange={(value) => setFixDataFields(prev => ({ ...prev, salesRepId: value }))}
                >
                  <SelectTrigger className="border-[#EAEAEA]">
                    <SelectValue placeholder="Select sales rep..." />
                  </SelectTrigger>
                  <SelectContent>
                    {salesReps.map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {getSalesRepDisplayName(rep)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFixDataModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={submitFixData}
              disabled={fixDataMutation.isPending}
              className="flex-1 bg-[#111111] hover:bg-[#333333]"
            >
              {fixDataMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Customers Modal */}
      <Dialog open={showMergeModal} onOpenChange={setShowMergeModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-500" />
              Merge Duplicate Clients
            </DialogTitle>
            <DialogDescription>
              Select which client to keep as the primary record. Data from the other client will be merged in.
            </DialogDescription>
          </DialogHeader>
          
          {mergeData && (
            <div className="py-4 space-y-4">
              {/* Select Primary Client */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMergeTarget(mergeData.sourceCustomer.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    mergeTarget === mergeData.sourceCustomer.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-500 mb-1">Current Card</div>
                  <div className="font-semibold text-[#111111]">
                    {mergeData.sourceCustomer.company || `${mergeData.sourceCustomer.firstName || ''} ${mergeData.sourceCustomer.lastName || ''}`.trim() || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{mergeData.sourceCustomer.email || 'No email'}</div>
                  {mergeTarget === mergeData.sourceCustomer.id && (
                    <Badge className="mt-2 bg-purple-500">Keep as Primary</Badge>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setMergeTarget(mergeData.targetCustomer.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    mergeTarget === mergeData.targetCustomer.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-500 mb-1">Duplicate Found</div>
                  <div className="font-semibold text-[#111111]">
                    {mergeData.targetCustomer.company || `${mergeData.targetCustomer.firstName || ''} ${mergeData.targetCustomer.lastName || ''}`.trim() || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{mergeData.targetCustomer.email || 'No email'}</div>
                  {mergeTarget === mergeData.targetCustomer.id && (
                    <Badge className="mt-2 bg-purple-500">Keep as Primary</Badge>
                  )}
                </button>
              </div>

              {/* Email Selection */}
              {(() => {
                const allEmails = getMergeEmails();
                if (allEmails.length === 0) return null;
                
                const extraEmails = allEmails.filter(e => e !== mergeEmailSelections.primary && e !== mergeEmailSelections.secondary);
                
                return (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-3">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Addresses ({allEmails.length} found)
                    </h4>
                    <div className="space-y-3">
                      {/* Primary Email */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-blue-700 mb-2">Primary Email</div>
                        <div className="flex flex-wrap gap-2">
                          {allEmails.map((email) => (
                            <button
                              key={`primary-${email}`}
                              type="button"
                              onClick={() => {
                                setMergeEmailSelections(prev => ({
                                  primary: email,
                                  secondary: prev.secondary === email ? '' : prev.secondary
                                }));
                              }}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                mergeEmailSelections.primary === email
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white border-gray-300 hover:border-blue-400 text-gray-700'
                              }`}
                            >
                              {email}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Secondary Email */}
                      {allEmails.length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-600 mb-2">Secondary Email</div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setMergeEmailSelections(prev => ({ ...prev, secondary: '' }))}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                !mergeEmailSelections.secondary
                                  ? 'bg-gray-600 text-white border-gray-600'
                                  : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                              }`}
                            >
                              None
                            </button>
                            {allEmails.filter(e => e !== mergeEmailSelections.primary).map((email) => (
                              <button
                                key={`secondary-${email}`}
                                type="button"
                                onClick={() => setMergeEmailSelections(prev => ({ ...prev, secondary: email }))}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                  mergeEmailSelections.secondary === email
                                    ? 'bg-gray-600 text-white border-gray-600'
                                    : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'
                                }`}
                              >
                                {email}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Extra Emails Warning */}
                      {extraEmails.length > 0 && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <div className="text-xs font-medium text-amber-700 mb-1">
                            Extra emails will be added to Notes:
                          </div>
                          <div className="text-sm text-amber-800">
                            {extraEmails.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Field Selection */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Choose which data to keep for each field:</h4>
                <div className="space-y-3">
                  {mergeFields.map(({ key, label }) => {
                    const valueA = mergeData.sourceCustomer[key] || '';
                    const valueB = mergeData.targetCustomer[key] || '';
                    const selectedValue = mergeFieldSelections[key];
                    
                    if (!valueA && !valueB && key !== 'pricingTier') return null;
                    if (valueA === valueB && key !== 'pricingTier') return null;
                    
                    // Special handling for Pricing Tier - show dropdown from app config
                    if (key === 'pricingTier') {
                      return (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
                          <Select 
                            value={selectedValue || valueA || valueB || ''} 
                            onValueChange={(value) => setMergeFieldSelections(prev => ({ ...prev, [key]: value }))}
                          >
                            <SelectTrigger className="border-gray-200 bg-white">
                              <SelectValue placeholder="Select pricing tier..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PRICING_TIERS.map((tier) => (
                                <SelectItem key={tier} value={tier}>
                                  {tier}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {(valueA || valueB) && (
                            <div className="mt-2 text-xs text-gray-500">
                              Current values: {valueA && <span className="font-medium">{valueA}</span>}
                              {valueA && valueB && ' / '}
                              {valueB && <span className="font-medium">{valueB}</span>}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMergeFieldSelections(prev => ({ ...prev, [key]: mergeData.sourceCustomer.id }))}
                            className={`p-2 text-left rounded border text-sm transition-all cursor-pointer hover:bg-gray-100 ${
                              selectedValue === mergeData.sourceCustomer.id
                                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 font-medium'
                                : 'border-gray-200 hover:border-purple-300 bg-white'
                            }`}
                          >
                            {valueA || <span className="text-gray-400 italic">Empty</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => setMergeFieldSelections(prev => ({ ...prev, [key]: mergeData.targetCustomer.id }))}
                            className={`p-2 text-left rounded border text-sm transition-all cursor-pointer hover:bg-gray-100 ${
                              selectedValue === mergeData.targetCustomer.id
                                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 font-medium'
                                : 'border-gray-200 hover:border-purple-300 bg-white'
                            }`}
                          >
                            {valueB || <span className="text-gray-400 italic">Empty</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowMergeModal(false);
                setMergeData(null);
                setMergeTarget(null);
                setMergeFieldSelections({});
                setMergeEmailSelections({ primary: '', secondary: '' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!mergeTarget || mergeCustomersMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {mergeCustomersMutation.isPending ? 'Merging...' : 'Merge Clients'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Morning Warmup Modal */}
      <Dialog open={showWarmup} onOpenChange={setShowWarmup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-500" />
              Good Morning!
            </DialogTitle>
          </DialogHeader>
          {warmupData && (
            <div className="space-y-4 py-4">
              {warmupData.streak > 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <span className="text-lg font-semibold text-orange-700">{warmupData.streak} Day Streak!</span>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Yesterday you:</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{warmupData.yesterdaySummary.calls}</div>
                    <div className="text-xs text-gray-500">Calls</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{warmupData.yesterdaySummary.tasksCompleted}</div>
                    <div className="text-xs text-gray-500">Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{warmupData.yesterdaySummary.pricingTiersAssigned}</div>
                    <div className="text-xs text-gray-500">Tiers Set</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Today's focus:</p>
                <p className="text-base font-medium text-[#111111]">{warmupData.todayFocus}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setShowWarmup(false)} 
              className="w-full bg-[#111111] hover:bg-[#333333]"
            >
              Let's Go!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Micro-Coaching Card Modal */}
      <Dialog open={showMicroCard} onOpenChange={setShowMicroCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentTask?.microCard?.cardType === 'product_quiz' && <BookOpen className="w-5 h-5 text-blue-500" />}
              {currentTask?.microCard?.cardType === 'objection_practice' && <MessageSquare className="w-5 h-5 text-orange-500" />}
              {currentTask?.microCard?.cardType === 'competitor_intel' && <Target className="w-5 h-5 text-red-500" />}
              {currentTask?.microCard?.cardType === 'customer_story' && <Star className="w-5 h-5 text-yellow-500" />}
              {currentTask?.microCard?.cardType === 'machine_profile_check' && <Settings className="w-5 h-5 text-purple-500" />}
              {currentTask?.microCard?.title}
            </DialogTitle>
            <Badge variant="outline" className="w-fit">
              {currentTask?.microCard?.difficulty === 'easy' ? 'Quick' : currentTask?.microCard?.difficulty === 'hard' ? 'Challenge' : 'Standard'}
            </Badge>
          </DialogHeader>
          
          {currentTask?.microCard && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">{currentTask.microCard.content}</p>
              
              {/* Quiz options */}
              {currentTask.microCard.cardType === 'product_quiz' && currentTask.microCard.options && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">{currentTask.microCard.question}</p>
                  {currentTask.microCard.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedQuizAnswer(idx);
                        setQuizAnswered(true);
                      }}
                      disabled={quizAnswered}
                      className={`w-full p-3 text-left rounded-lg border text-sm transition-all ${
                        quizAnswered && idx === currentTask.microCard?.correctAnswer
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : quizAnswered && idx === selectedQuizAnswer
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : selectedQuizAnswer === idx
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  
                  {quizAnswered && (
                    <div className={`p-3 rounded-lg text-sm ${
                      selectedQuizAnswer === currentTask.microCard.correctAnswer
                        ? 'bg-green-50 text-green-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {selectedQuizAnswer === currentTask.microCard.correctAnswer ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Correct!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Not quite.
                        </span>
                      )}
                      {currentTask.microCard.explanation && (
                        <p className="mt-2 text-xs">{currentTask.microCard.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Objection practice */}
              {currentTask.microCard.cardType === 'objection_practice' && currentTask.microCard.suggestedResponses && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Suggested responses:</p>
                  {currentTask.microCard.suggestedResponses.map((response) => (
                    <div 
                      key={response.id} 
                      className={`p-3 rounded-lg border text-sm ${
                        response.isRecommended ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {response.isRecommended && (
                        <Badge variant="secondary" className="mb-2 bg-green-100 text-green-700">
                          Recommended
                        </Badge>
                      )}
                      <p>{response.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setShowMicroCard(false)} 
              variant="outline"
              className="w-full"
            >
              {quizAnswered || currentTask?.microCard?.cardType !== 'product_quiz' ? 'Continue' : 'Skip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Custom Follow-up Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Schedule Follow-up
            </DialogTitle>
            <DialogDescription>
              When should you follow up with this customer?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 14].map((days) => (
                <Button
                  key={days}
                  variant={followUpDays === days ? 'default' : 'outline'}
                  className={`${followUpDays === days ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setFollowUpDays(days)}
                >
                  {days}d
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={90}
                value={followUpDays}
                onChange={(e) => setFollowUpDays(parseInt(e.target.value) || 7)}
                className="w-20"
              />
              <span className="text-sm text-gray-600">days from now</span>
            </div>
            
            <div className="text-sm text-gray-500">
              Follow-up date: {new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUpDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCustomFollowUp}
              disabled={completeMutation.isPending || followUpDays < 1 || followUpDays > 90}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {completeMutation.isPending ? 'Scheduling...' : 'Schedule Follow-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remind Later Dialog - For email/sample tasks */}
      <Dialog open={showRemindLaterDialog} onOpenChange={setShowRemindLaterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Remind Me Later
            </DialogTitle>
            <DialogDescription>
              When should this email task come back to your queue?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 7].map((days) => (
                <Button
                  key={days}
                  variant={remindLaterDays === days ? 'default' : 'outline'}
                  className={`${remindLaterDays === days ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                  onClick={() => setRemindLaterDays(days)}
                >
                  {days === 1 ? 'Tomorrow' : `${days}d`}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={30}
                value={remindLaterDays}
                onChange={(e) => setRemindLaterDays(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-gray-600">days from now</span>
            </div>
            
            <div className="text-sm text-gray-500">
              Will resurface: {new Date(Date.now() + remindLaterDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemindLaterDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Create a follow-up task for the specified number of days
                if (currentTask?.task) {
                  completeMutation.mutate({ 
                    taskId: currentTask.task.id, 
                    outcomeId: 'remind_later', 
                    customFollowUpDays: remindLaterDays 
                  });
                  setShowRemindLaterDialog(false);
                }
              }}
              disabled={completeMutation.isPending || remindLaterDays < 1 || remindLaterDays > 30}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {completeMutation.isPending ? 'Setting reminder...' : 'Set Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer Dialog */}
      <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Compose Email
            </DialogTitle>
            <DialogDescription>
              Send an email to this customer via your Gmail account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Template Selector */}
            {emailTemplates.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Use Template</Label>
                <Select 
                  value={selectedTemplateId?.toString() || ''} 
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name} {template.category && `(${template.category})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* To Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">To</Label>
              <Input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full"
              />
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subject</Label>
              <Input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full"
              />
            </div>

            {/* Body Field with rich text editor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message</Label>
              <EmailRichTextEditor
                ref={emailEditorRef}
                content={emailBody}
                onChange={(html) => setEmailBody(html)}
                placeholder="Type your message here..."
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEmailComposer(false);
                setEmailTo('');
                setEmailSubject('');
                setEmailBody('');
                setSelectedTemplateId(null);
                emailEditorRef.current?.setContent('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending || !emailTo || !emailSubject || !emailBody || emailBody === '<p></p>'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Label Dialog */}
      <Dialog open={showPrintLabel} onOpenChange={setShowPrintLabel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-purple-600" />
              Print Address Label
            </DialogTitle>
            <DialogDescription>
              Generate a 4"x3" thermal label for shipping marketing materials.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>What are you sending?</Label>
              <Select value={labelType} onValueChange={(v: 'swatch_book' | 'press_test_kit' | 'mailer' | 'other') => setLabelType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select label type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swatch_book">Swatch Book</SelectItem>
                  <SelectItem value="press_test_kit">Press Test Kit</SelectItem>
                  <SelectItem value="mailer">Mailer</SelectItem>
                  <SelectItem value="other">Something Else</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {labelType === 'other' && (
              <div className="grid gap-2">
                <Label htmlFor="otherDescription">Description</Label>
                <Input
                  id="otherDescription"
                  value={labelOtherDescription}
                  onChange={(e) => setLabelOtherDescription(e.target.value)}
                  placeholder="What are you sending?"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={labelQuantity}
                onChange={(e) => setLabelQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={labelNotes}
                onChange={(e) => setLabelNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>

            {/* Address Preview - Use lead data for lead tasks */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-xs text-gray-500 mb-2">Shipping To:</p>
              {task?.isLeadTask && task?.lead ? (
                <>
                  <p className="font-semibold">{task.lead.company || task.lead.name || 'Lead'}</p>
                  {task.lead.address && <p className="text-sm text-gray-700">{task.lead.address}</p>}
                  {task.lead.city && (
                    <p className="text-sm text-gray-700">
                      {[task.lead.city, task.lead.state, task.lead.zip].filter(Boolean).join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold">{customer?.company || `${customer?.firstName} ${customer?.lastName}`.trim()}</p>
                  {customer?.address1 && <p className="text-sm text-gray-700">{customer.address1}</p>}
                  {customer?.address2 && <p className="text-sm text-gray-700">{customer.address2}</p>}
                  <p className="text-sm text-gray-700">
                    {[customer?.city, customer?.province, customer?.zip].filter(Boolean).join(', ')}
                  </p>
                  {customer?.country && !['US', 'USA', 'CA', 'CAN'].includes(customer.country) && (
                    <p className="text-sm text-gray-700">{customer.country}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPrintLabel(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => printLabelMutation.mutate({
                labelType,
                otherDescription: labelType === 'other' ? labelOtherDescription : undefined,
                quantity: labelQuantity,
                notes: labelNotes || undefined,
              })}
              disabled={printLabelMutation.isPending || (labelType === 'other' && !labelOtherDescription.trim())}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {printLabelMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 mr-2" />
              )}
              Print Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
