import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, ApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Pencil, Check, ChevronUp, ChevronDown } from "lucide-react";
import type { SketchboardEntry } from "@shared/schema";

const COLUMNS = [
  {
    key: "working_on" as const,
    label: "Working On",
    emoji: "🔨",
    color: "bg-blue-50 border-blue-200",
    headerColor: "text-blue-700 bg-blue-100",
    badgeColor: "bg-blue-100 text-blue-700",
    buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
    inputBorder: "border-blue-200 focus:border-blue-400",
  },
  {
    key: "waiting_on" as const,
    label: "Waiting On",
    emoji: "⏳",
    color: "bg-amber-50 border-amber-200",
    headerColor: "text-amber-700 bg-amber-100",
    badgeColor: "bg-amber-100 text-amber-700",
    buttonColor: "bg-amber-600 hover:bg-amber-700 text-white",
    inputBorder: "border-amber-200 focus:border-amber-400",
  },
  {
    key: "decide_on" as const,
    label: "Decide On",
    emoji: "⚡",
    color: "bg-purple-50 border-purple-200",
    headerColor: "text-purple-700 bg-purple-100",
    badgeColor: "bg-purple-100 text-purple-700",
    buttonColor: "bg-purple-600 hover:bg-purple-700 text-white",
    inputBorder: "border-purple-200 focus:border-purple-400",
  },
];

interface CapacityDialogProps {
  open: boolean;
  onClose: () => void;
  column: typeof COLUMNS[0];
  entries: SketchboardEntry[];
  pendingName: string;
  pendingNote: string;
  onDropAndAdd: (idsToRemove: number[]) => void;
}

function CapacityDialog({ open, onClose, column, entries, pendingName, pendingNote, onDropAndAdd }: CapacityDialogProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    onDropAndAdd([...selected]);
    setSelected(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{column.emoji}</span>
            <span>You've got 15 on your plate</span>
          </DialogTitle>
          <DialogDescription>
            Pick what's done or can wait to make room for <strong>"{pendingName}"</strong>.
            Select one or more to remove.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[340px] overflow-y-auto py-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected.has(entry.id) ? "bg-red-50 border-red-300" : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => toggle(entry.id)}
            >
              <Checkbox
                checked={selected.has(entry.id)}
                onCheckedChange={() => toggle(entry.id)}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.customerName}</p>
                {entry.note && (
                  <p className="text-xs text-gray-500 truncate">{entry.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Remove {selected.size > 0 ? `${selected.size} ` : ""}& Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EntryCardProps {
  entry: SketchboardEntry;
  column: typeof COLUMNS[0];
  isFirst: boolean;
  isLast: boolean;
  onDelete: (id: number) => void;
  onUpdate: (id: number, note: string) => void;
  onMoveUp: (id: number, currentOrder: number) => void;
  onMoveDown: (id: number, currentOrder: number) => void;
}

function EntryCard({ entry, column, isFirst, isLast, onDelete, onUpdate, onMoveUp, onMoveDown }: EntryCardProps) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(entry.note || "");

  const saveNote = () => {
    onUpdate(entry.id, noteValue);
    setEditingNote(false);
  };

  return (
    <div className="group flex items-start gap-2 p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMoveUp(entry.id, entry.sortOrder)}
          disabled={isFirst}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-25 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={() => onMoveDown(entry.id, entry.sortOrder)}
          disabled={isLast}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-25 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{entry.customerName}</p>
        {editingNote ? (
          <div className="flex items-center gap-1 mt-1">
            <Input
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNote();
                if (e.key === "Escape") { setEditingNote(false); setNoteValue(entry.note || ""); }
              }}
              placeholder="Add a note..."
              className="h-6 text-xs py-0 px-2"
              autoFocus
              maxLength={255}
            />
            <button onClick={saveNote} className="p-0.5 text-green-600 hover:text-green-700">
              <Check className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 mt-0.5 cursor-pointer"
            onClick={() => setEditingNote(true)}
          >
            {entry.note ? (
              <p className="text-xs text-gray-500 truncate">{entry.note}</p>
            ) : (
              <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">+ add note</p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditingNote(true)}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Edit note"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="p-1 text-gray-400 hover:text-red-500"
          title="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface ColumnPanelProps {
  col: typeof COLUMNS[0];
  entries: SketchboardEntry[];
  onAdd: (col: typeof COLUMNS[0], name: string, note: string) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, note: string) => void;
  onReorder: (id: number, newSortOrder: number, swapId: number, swapSortOrder: number) => void;
  compact?: boolean;
}

function ColumnPanel({ col, entries, onAdd, onDelete, onUpdate, onReorder, compact }: ColumnPanelProps) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(col, name.trim(), note.trim());
    setName("");
    setNote("");
  };

  const handleMoveUp = (id: number, currentOrder: number) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    const above = entries[idx - 1];
    onReorder(id, above.sortOrder, above.id, currentOrder);
  };

  const handleMoveDown = (id: number, currentOrder: number) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx < 0 || idx >= entries.length - 1) return;
    const below = entries[idx + 1];
    onReorder(id, below.sortOrder, below.id, currentOrder);
  };

  return (
    <div className={`flex flex-col rounded-2xl border-2 ${col.color} overflow-hidden`}>
      <div className={`px-4 py-3 flex items-center justify-between ${col.headerColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{col.emoji}</span>
          <h3 className="font-bold text-base">{col.label}</h3>
        </div>
        <Badge className={`${col.badgeColor} border-0 font-semibold text-xs`}>
          {entries.length} / 15
        </Badge>
      </div>

      <div className={`flex-1 p-3 space-y-2 ${compact ? "min-h-[120px] max-h-[280px]" : "min-h-[200px] max-h-[calc(100vh-360px)]"} overflow-y-auto`}>
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-gray-400">
            <p className="text-sm text-center italic">Nothing here yet.<br />Add a name below.</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              column={col}
              isFirst={idx === 0}
              isLast={idx === entries.length - 1}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))
        )}
      </div>

      <div className="px-3 pb-3">
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer / lead name..."
            className={`h-9 text-sm border ${col.inputBorder} bg-white`}
            maxLength={255}
          />
          <div className="flex gap-1.5">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tag (e.g. call back, sent proposal)"
              className={`h-7 text-xs border ${col.inputBorder} bg-white flex-1`}
              maxLength={255}
            />
            <Button
              type="submit"
              disabled={!name.trim()}
              className={`h-7 px-3 text-xs ${col.buttonColor} shrink-0`}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SketchboardBoard({ compact = false }: { compact?: boolean } = {}) {
  const { toast } = useToast();
  const [capacityDialog, setCapacityDialog] = useState<{
    open: boolean;
    col: typeof COLUMNS[0];
    pendingName: string;
    pendingNote: string;
  } | null>(null);

  const { data: entries = [], isLoading } = useQuery<SketchboardEntry[]>({
    queryKey: ["/api/sketchboard/entries"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/sketchboard/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sketchboard/entries"] });
    },
    onError: () => {
      toast({ title: "Failed to remove entry", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; note?: string; sortOrder?: number }) =>
      apiRequest("PATCH", `/api/sketchboard/entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sketchboard/entries"] });
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    },
  });

  const handleAdd = async (col: typeof COLUMNS[0], name: string, note: string) => {
    const colEntries = entries.filter((e) => e.column === col.key);
    if (colEntries.length >= 15) {
      setCapacityDialog({ open: true, col, pendingName: name, pendingNote: note });
      return;
    }
    try {
      await apiRequest("POST", "/api/sketchboard/entries", {
        column: col.key,
        customerName: name,
        note: note || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sketchboard/entries"] });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setCapacityDialog({ open: true, col, pendingName: name, pendingNote: note });
      } else {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({ title: "Failed to add entry", description: message, variant: "destructive" });
      }
    }
  };

  const handleDropAndAdd = async (idsToRemove: number[]) => {
    if (!capacityDialog) return;
    try {
      await Promise.all(idsToRemove.map((id) => apiRequest("DELETE", `/api/sketchboard/entries/${id}`)));
      await apiRequest("POST", "/api/sketchboard/entries", {
        column: capacityDialog.col.key,
        customerName: capacityDialog.pendingName,
        note: capacityDialog.pendingNote || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sketchboard/entries"] });
      setCapacityDialog(null);
      toast({ title: "Done! Entry added." });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleUpdate = (id: number, note: string) => {
    updateMutation.mutate({ id, note });
  };

  const handleReorder = async (id: number, newSortOrder: number, swapId: number, swapSortOrder: number) => {
    try {
      await Promise.all([
        apiRequest("PATCH", `/api/sketchboard/entries/${id}`, { sortOrder: newSortOrder }),
        apiRequest("PATCH", `/api/sketchboard/entries/${swapId}`, { sortOrder: swapSortOrder }),
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/sketchboard/entries"] });
    } catch {
      toast({ title: "Failed to reorder entries", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? "gap-3" : "gap-4"}`}>
        {COLUMNS.map((col) => (
          <ColumnPanel
            key={col.key}
            col={col}
            entries={entries.filter((e) => e.column === col.key)}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onReorder={handleReorder}
            compact={compact}
          />
        ))}
      </div>

      {capacityDialog && (
        <CapacityDialog
          open={capacityDialog.open}
          onClose={() => setCapacityDialog(null)}
          column={capacityDialog.col}
          entries={entries.filter((e) => e.column === capacityDialog.col.key)}
          pendingName={capacityDialog.pendingName}
          pendingNote={capacityDialog.pendingNote}
          onDropAndAdd={handleDropAndAdd}
        />
      )}
    </>
  );
}

export default function SketchboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white text-lg">✏️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Sketchboard</h1>
            <p className="text-sm text-gray-500">
              Your personal daily scratchpad — not a CRM replacement. Keep it focused.
            </p>
          </div>
        </div>
      </div>
      <SketchboardBoard />
    </div>
  );
}
