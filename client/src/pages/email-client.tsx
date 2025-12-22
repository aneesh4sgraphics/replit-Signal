import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Mail, 
  Send, 
  Inbox, 
  RefreshCw, 
  PenSquare,
  Clock,
  Star,
  Trash2,
  Archive,
  MoreHorizontal,
  Search,
  ChevronDown,
  X,
  Minus,
  Maximize2,
  Reply,
  Forward,
  Loader2,
  FileText,
  Tag
} from "lucide-react";
import { format } from "date-fns";

interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  labelIds: string[];
  body?: string;
}

interface EmailLabel {
  id: string;
  name: string;
  type: string;
}

export default function EmailClient() {
  const { toast } = useToast();
  const [selectedLabel, setSelectedLabel] = useState("INBOX");
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMinimized, setComposeMinimized] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: labelsData, isLoading: labelsLoading } = useQuery<EmailLabel[]>({
    queryKey: ["/api/email/labels"],
    queryFn: async () => {
      const res = await fetch('/api/email/labels', { credentials: 'include' });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });
  
  const labels = Array.isArray(labelsData) ? labelsData : [];

  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery<EmailMessage[]>({
    queryKey: ["/api/email/messages", selectedLabel],
    queryFn: async () => {
      const res = await fetch(`/api/email/messages?label=${selectedLabel}&maxResults=30`, { credentials: 'include' });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });
  
  const messages = Array.isArray(messagesData) ? messagesData : [];

  const { data: fullMessage, isLoading: messageLoading } = useQuery<EmailMessage>({
    queryKey: ["/api/email/messages", selectedMessage?.id],
    queryFn: () => fetch(`/api/email/messages/${selectedMessage?.id}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!selectedMessage?.id
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; body: string }) => {
      return apiRequest("POST", "/api/email/send", data);
    },
    onSuccess: () => {
      toast({ title: "Email sent successfully" });
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      queryClient.invalidateQueries({ queryKey: ["/api/email/messages"] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to send email", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  });

  const handleSendEmail = () => {
    if (!composeTo || !composeSubject || !composeBody) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    sendEmailMutation.mutate({ to: composeTo, subject: composeSubject, body: composeBody });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      return isToday ? format(date, "h:mm a") : format(date, "MMM d");
    } catch {
      return dateStr;
    }
  };

  const extractSenderName = (from: string) => {
    const match = from.match(/^([^<]+)</);
    return match ? match[1].trim() : from.split("@")[0];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const systemLabels = [
    { id: 'INBOX', name: 'Inbox', icon: Inbox },
    { id: 'STARRED', name: 'Starred', icon: Star },
    { id: 'SENT', name: 'Sent', icon: Send },
    { id: 'DRAFT', name: 'Drafts', icon: FileText },
    { id: 'TRASH', name: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200">
      {/* Top Search Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500"
              data-testid="input-search"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetchMessages()}
          className="text-gray-600 hover:bg-gray-200"
          data-testid="button-refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Labels */}
        <div className="w-64 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-2xl py-6"
              onClick={() => setComposeOpen(true)}
              data-testid="button-compose"
            >
              <PenSquare className="h-5 w-5 mr-3" />
              Compose
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <nav className="space-y-1">
              {systemLabels.map((label) => {
                const Icon = label.icon;
                const isActive = selectedLabel === label.id;
                const count = label.id === 'INBOX' ? messages.length : 0;
                
                return (
                  <button
                    key={label.id}
                    onClick={() => setSelectedLabel(label.id)}
                    className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full text-sm transition-all ${
                      isActive
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    data-testid={`label-${label.id}`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left">{label.name}</span>
                    {count > 0 && isActive && (
                      <span className="text-xs font-medium">{count}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {labels.filter(l => l.type === 'user').length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Labels</p>
                {labels.filter(l => l.type === 'user').map((label) => (
                  <button
                    key={label.id}
                    onClick={() => setSelectedLabel(label.id)}
                    className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full text-sm ${
                      selectedLabel === label.id
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-left truncate">{label.name}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message List */}
        <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {messages.length > 0 && `1-${messages.length}`}
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {messagesLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Mail className="h-16 w-16 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">No messages</p>
                <p className="text-gray-400 text-sm">Your inbox is empty</p>
              </div>
            ) : (
              <div>
                {messages.map((msg) => {
                  const senderName = extractSenderName(msg.from);
                  const isSelected = selectedMessage?.id === msg.id;
                  
                  return (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors group ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div className="flex gap-3">
                        <Avatar className={`h-10 w-10 flex-shrink-0 ${getAvatarColor(senderName)}`}>
                          <AvatarFallback className="text-white text-xs font-medium">
                            {getInitials(senderName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-gray-900 truncate">
                              {senderName}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(msg.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 truncate font-medium">
                            {msg.subject || "(No subject)"}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {msg.snippet}
                          </p>
                        </div>
                      </div>
                      
                      <div className="hidden group-hover:flex items-center gap-1 mt-2 ml-13">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Archive className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Mail className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Preview */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-normal text-gray-900">
                    {selectedMessage.subject || "(No subject)"}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Archive className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Trash2 className="h-5 w-5 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Avatar className={`h-10 w-10 ${getAvatarColor(extractSenderName(selectedMessage.from))}`}>
                    <AvatarFallback className="text-white text-sm font-medium">
                      {getInitials(extractSenderName(selectedMessage.from))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {extractSenderName(selectedMessage.from)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      to me
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedMessage.date)}
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <ScrollArea className="flex-1 p-6">
                {messageLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : fullMessage?.body ? (
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: fullMessage.body }}
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedMessage.snippet}</p>
                )}
              </ScrollArea>

              {/* Reply Actions */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setComposeTo(selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from);
                    setComposeSubject(`Re: ${selectedMessage.subject}`);
                    setComposeOpen(true);
                  }}
                  data-testid="button-reply"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Mail className="h-20 w-20 text-gray-200 mb-4" />
              <p className="text-lg text-gray-500">Select a message to read</p>
              <p className="text-sm text-gray-400 mt-1">Click on a message from the list</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compose Dialog */}
      {composeOpen && (
        <div className={`fixed bottom-0 right-6 w-[500px] bg-white rounded-t-xl shadow-2xl border border-gray-300 z-50 ${composeMinimized ? 'h-12' : ''}`}>
          {/* Compose Header */}
          <div 
            className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white rounded-t-xl cursor-pointer"
            onClick={() => composeMinimized && setComposeMinimized(false)}
          >
            <span className="font-medium text-sm">New Message</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setComposeMinimized(!composeMinimized); }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setComposeOpen(false); }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {!composeMinimized && (
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center border-b border-gray-200 py-2">
                  <span className="text-sm text-gray-500 w-12">To</span>
                  <Input
                    type="email"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0"
                    placeholder="Recipients"
                    data-testid="input-to"
                  />
                </div>
                <div className="flex items-center border-b border-gray-200 py-2">
                  <span className="text-sm text-gray-500 w-12">Subject</span>
                  <Input
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0"
                    placeholder="Subject"
                    data-testid="input-subject"
                  />
                </div>
                <Textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Compose email"
                  rows={12}
                  className="border-0 focus-visible:ring-0 resize-none"
                  data-testid="input-body"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <Button 
                  onClick={handleSendEmail} 
                  disabled={sendEmailMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
                  data-testid="button-send"
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setComposeOpen(false)}
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
