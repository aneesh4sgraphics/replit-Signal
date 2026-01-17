import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface LostQuote {
  id: number;
  quoteNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerId: string | null;
  totalAmount: string;
  createdAt: string;
  outcomeUpdatedAt: string | null;
}

interface QuoteOutcomeEditorProps {
  quote: LostQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function QuoteOutcomeEditor({ quote, isOpen, onClose, onSuccess }: QuoteOutcomeEditorProps) {
  const [outcome, setOutcome] = useState<string>("lost");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [objectionSummary, setObjectionSummary] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (quote) {
      setOutcome("lost");
      setOutcomeNotes("");
      setCompetitorName("");
      setObjectionSummary("");
    }
  }, [quote]);

  const updateOutcomeMutation = useMutation({
    mutationFn: async () => {
      if (!quote) return;
      return await apiRequest("PUT", `/api/quotes/${quote.id}/outcome`, {
        outcome,
        outcomeNotes,
        competitorName,
        objectionSummary
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: `Quote marked as ${outcome.toUpperCase()}` });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/lost-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/follow-ups/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sent-quotes"] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update quote", variant: "destructive" });
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      if (!quote) return;
      return await apiRequest("POST", `/api/quotes/${quote.id}/dismiss-notification`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/lost-notifications"] });
      onClose();
    }
  });

  if (!quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Quote {quote.quoteNumber} - Update Outcome
          </DialogTitle>
          <DialogDescription>
            This quote for {quote.customerName} was auto-marked as lost. Update the outcome and provide feedback for coaching.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>Customer:</strong> {quote.customerName}</p>
            <p><strong>Amount:</strong> ${parseFloat(quote.totalAmount).toFixed(2)}</p>
            <p><strong>Created:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="space-y-2">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="won">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Won
                  </span>
                </SelectItem>
                <SelectItem value="lost">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Lost
                  </span>
                </SelectItem>
                <SelectItem value="pending">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Still Pending
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {outcome === "lost" && (
            <>
              <div className="space-y-2">
                <Label>Lost to Competitor (if known)</Label>
                <Input
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  placeholder="e.g., Spicers, Clampitt, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Objection Summary</Label>
                <Textarea
                  value={objectionSummary}
                  onChange={(e) => setObjectionSummary(e.target.value)}
                  placeholder="Why did we lose? (price too high, delivery time, product quality, etc.)"
                  rows={3}
                />
              </div>
            </>
          )}

          {outcome === "won" && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Any notes about the sale..."
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => dismissMutation.mutate()}>
            Dismiss
          </Button>
          <Button onClick={() => updateOutcomeMutation.mutate()} disabled={updateOutcomeMutation.isPending}>
            {updateOutcomeMutation.isPending ? "Saving..." : "Save Outcome"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QuoteFollowUpNotifications() {
  const [selectedQuote, setSelectedQuote] = useState<LostQuote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();

  const { data: lostNotifications = [] } = useQuery<LostQuote[]>({
    queryKey: ["/api/quotes/lost-notifications"],
    refetchInterval: 60000 // Check every minute
  });

  // Show toast notification for newly lost quotes
  useEffect(() => {
    if (lostNotifications.length > 0) {
      const firstQuote = lostNotifications[0];
      toast({
        title: "Quote Marked as Lost",
        description: `Quote ${firstQuote.quoteNumber} for ${firstQuote.customerName} needs your attention.`,
        variant: "destructive",
        duration: 10000,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedQuote(firstQuote);
              setIsEditorOpen(true);
            }}
          >
            Review
          </Button>
        )
      });
    }
  }, [lostNotifications.length]);

  return (
    <>
      {lostNotifications.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Quotes Need Attention ({lostNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lostNotifications.slice(0, 3).map((quote) => (
              <div 
                key={quote.id} 
                className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50"
              >
                <div>
                  <p 
                    className="font-medium text-sm cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsEditorOpen(true);
                    }}
                  >
                    {quote.quoteNumber}
                  </p>
                  {quote.customerId ? (
                    <Link href={`/odoo-contacts/${quote.customerId}`}>
                      <span className="text-xs text-[#875A7B] hover:underline cursor-pointer flex items-center gap-1">
                        {quote.customerName}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </Link>
                  ) : (
                    <p className="text-xs text-gray-500">{quote.customerName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Lost</Badge>
                  <DollarSign className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">${parseFloat(quote.totalAmount).toFixed(0)}</span>
                </div>
              </div>
            ))}
            {lostNotifications.length > 3 && (
              <p className="text-xs text-gray-500 text-center">+ {lostNotifications.length - 3} more</p>
            )}
          </CardContent>
        </Card>
      )}

      <QuoteOutcomeEditor
        quote={selectedQuote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedQuote(null);
        }}
        onSuccess={() => {}}
      />
    </>
  );
}

export function QuoteFollowUpReminders() {
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: pendingFollowUps = [] } = useQuery<any[]>({
    queryKey: ["/api/quotes/follow-ups/pending"]
  });

  const overdueQuotes = pendingFollowUps.filter(q => q.isOverdue);
  const upcomingQuotes = pendingFollowUps.filter(q => !q.isOverdue && q.daysUntilDue !== null && q.daysUntilDue <= 3);

  if (pendingFollowUps.length === 0) return null;

  return (
    <>
      {overdueQuotes.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
              <Clock className="h-4 w-4" />
              Overdue Quote Follow-ups ({overdueQuotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueQuotes.slice(0, 3).map((quote: any) => (
              <div 
                key={quote.id} 
                className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50"
              >
                <div>
                  <p 
                    className="font-medium text-sm cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsEditorOpen(true);
                    }}
                  >
                    {quote.quoteNumber}
                  </p>
                  {quote.customerId ? (
                    <Link href={`/odoo-contacts/${quote.customerId}`}>
                      <span className="text-xs text-[#875A7B] hover:underline cursor-pointer flex items-center gap-1">
                        {quote.customerName}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </Link>
                  ) : (
                    <p className="text-xs text-gray-500">{quote.customerName}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  {Math.abs(quote.daysUntilDue)} days overdue
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {upcomingQuotes.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              Upcoming Follow-ups ({upcomingQuotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingQuotes.slice(0, 3).map((quote: any) => (
              <div 
                key={quote.id} 
                className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50"
              >
                <div>
                  <p 
                    className="font-medium text-sm cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsEditorOpen(true);
                    }}
                  >
                    {quote.quoteNumber}
                  </p>
                  {quote.customerId ? (
                    <Link href={`/odoo-contacts/${quote.customerId}`}>
                      <span className="text-xs text-[#875A7B] hover:underline cursor-pointer flex items-center gap-1">
                        {quote.customerName}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </Link>
                  ) : (
                    <p className="text-xs text-gray-500">{quote.customerName}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                  {quote.daysUntilDue} days left
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <QuoteOutcomeEditor
        quote={selectedQuote}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedQuote(null);
        }}
        onSuccess={() => {}}
      />
    </>
  );
}

export default QuoteFollowUpNotifications;
