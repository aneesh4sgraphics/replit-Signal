import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Mail, Download, ArrowLeft, Calendar, User, DollarSign, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface SentQuote {
  id: number;
  quoteNumber: string;
  customerName: string;
  customerEmail: string | null;
  quoteItems: string;
  totalAmount?: string | null;
  createdAt: string;
  sentVia?: string | null;
  status: string;
}

export default function SavedQuotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);
  
  const { data: sentQuotes, isLoading: quotesLoading, error: quotesError } = useQuery({
    queryKey: ["/api/sent-quotes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sent-quotes");
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/sent-quotes/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete quote");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sent-quotes"] });
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quote",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    },
  });

  const handleDeleteQuote = (id: number) => {
    setQuoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      deleteQuoteMutation.mutate(quoteToDelete);
    }
  };

  // Safe date formatting function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center sm:text-center flex-1">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Saved Quotes</h1>
            <p className="text-sm sm:text-base text-gray-600">View and manage all generated quotes</p>
          </div>
          <div className="hidden sm:block w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Quotes Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              All Generated Quotes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              All quotes generated from the Quote Calculator are automatically saved here.
            </p>
          </CardHeader>
          <CardContent>
            {quotesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : quotesError ? (
              <div className="text-center py-8 text-red-600">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Error loading quotes. Please refresh the page.</p>
                <p className="text-sm mt-2">
                  {quotesError instanceof Error ? quotesError.message : "Unknown error occurred"}
                </p>
              </div>
            ) : sentQuotes && Array.isArray(sentQuotes) && sentQuotes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Quote #</TableHead>
                      <TableHead className="w-[200px]">Customer</TableHead>
                      <TableHead className="w-[200px]">Email</TableHead>
                      {(user as any)?.role === 'admin' && <TableHead className="w-[80px]">Actions</TableHead>}
                      <TableHead className="w-[120px]">Total Amount</TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[100px]">Method</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentQuotes.map((quote: SentQuote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {quote.customerName}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {quote.customerEmail || 'N/A'}
                        </TableCell>
                        {(user as any)?.role === 'admin' && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuote(quote.id)}
                              disabled={deleteQuoteMutation.isPending}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                        <TableCell>
                          ${quote.totalAmount && typeof quote.totalAmount === 'string' ? parseFloat(quote.totalAmount).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(quote.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {typeof quote.sentVia === 'string' && quote.sentVia.trim()
                              ? quote.sentVia.split(',').map((method, index) => {
                                  const trimmed = method.trim().toLowerCase();
                                  if (trimmed === 'not known') {
                                    return (
                                      <Badge key={index} variant="outline">
                                        <FileText className="h-3 w-3 mr-1" />Not Known
                                      </Badge>
                                    );
                                  }
                                  return (
                                    <Badge key={index} variant={trimmed === 'email' ? 'default' : 'secondary'}>
                                      {trimmed === 'email' ? (
                                        <><Mail className="h-3 w-3 mr-1" />Email</>
                                      ) : (
                                        <><Download className="h-3 w-3 mr-1" />PDF</>
                                      )}
                                    </Badge>
                                  );
                                })
                              : (
                                <Badge variant="outline">
                                  <FileText className="h-3 w-3 mr-1" />Not Known
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={quote.status === 'sent' ? 'default' : 'secondary'}>
                            {quote.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No quotes generated yet</h3>
                <p className="text-sm">
                  Generate quotes from the Quote Calculator to see them here.
                </p>
                <Link href="/quote-calculator">
                  <Button className="mt-4">
                    Go to Quote Calculator
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Quote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this quote? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteQuoteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteQuoteMutation.isPending}
                >
                  {deleteQuoteMutation.isPending ? "Deleting..." : "Delete Quote"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}