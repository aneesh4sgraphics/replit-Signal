import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Loader2, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface ExtractedContact {
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
}

const EMPTY_FORM: ExtractedContact = {
  name: null, company: null, jobTitle: null, email: null, phone: null,
  street: null, street2: null, city: null, state: null, zip: null,
  country: null, notes: null,
};

interface ScreenshotImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSaveAs?: 'lead' | 'contact';
}

export default function ScreenshotImportModal({ isOpen, onClose, defaultSaveAs = 'lead' }: ScreenshotImportModalProps) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<'upload' | 'review'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveAs, setSaveAs] = useState<'lead' | 'contact'>(defaultSaveAs);
  const [form, setForm] = useState<ExtractedContact>(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file (PNG, JPG)', variant: 'destructive' });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsExtracting(true);
    setPhase('upload');

    try {
      const formData = new FormData();
      formData.append('screenshot', file);

      const response = await fetch('/api/screenshot/extract', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Extraction failed');
      }

      const { data } = await response.json();
      setForm({
        name: data.name || null,
        company: data.company || null,
        jobTitle: data.jobTitle || null,
        email: data.email || null,
        phone: data.phone || null,
        street: data.street || null,
        street2: data.street2 || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        country: data.country || null,
        notes: data.notes || null,
      });
      setPhase('review');
    } catch (error: any) {
      toast({ title: 'Extraction failed', description: error.message, variant: 'destructive' });
      setPreviewUrl(null);
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (saveAs === 'lead') {
        const leadData = {
          name: form.name || form.company || 'Unknown',
          email: form.email || undefined,
          phone: form.phone || undefined,
          company: form.company || undefined,
          jobTitle: form.jobTitle || undefined,
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zip: form.zip || undefined,
          country: form.country || undefined,
          description: form.notes || undefined,
          sourceType: 'manual',
        };
        await apiRequest('POST', '/api/leads', leadData);
        queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        toast({ title: 'Lead added', description: `${leadData.name} has been added as a lead` });
      } else {
        const customerId = crypto.randomUUID();
        const nameParts = (form.name || '').trim().split(' ');
        const customerData = {
          id: customerId,
          firstName: nameParts[0] || undefined,
          lastName: nameParts.slice(1).join(' ') || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          company: form.company || undefined,
          address1: form.street || undefined,
          address2: form.street2 || undefined,
          city: form.city || undefined,
          province: form.state || undefined,
          zip: form.zip || undefined,
          country: form.country || undefined,
          note: [form.jobTitle, form.notes].filter(Boolean).join('\n') || undefined,
          isCompany: false,
          contactType: 'contact',
        };
        await apiRequest('POST', '/api/customers', customerData);
        queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
        toast({ title: 'Contact added', description: `${form.name || form.company} has been added to Contacts` });
      }
      handleClose();
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message || 'Could not save the contact', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setPhase('upload');
    setPreviewUrl(null);
    setForm(EMPTY_FORM);
    setIsExtracting(false);
    onClose();
  };

  const field = (key: keyof ExtractedContact, label: string) => (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      <Input
        value={form[key] || ''}
        onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value || null }))}
        placeholder={label}
        className="mt-1 h-8 text-sm"
      />
    </div>
  );

  const canSave = !!(form.name || form.email || form.company);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            Import from Screenshot
          </DialogTitle>
          <DialogDescription>
            Upload a screenshot and AI will extract the contact details for you to review before saving.
          </DialogDescription>
        </DialogHeader>

        {phase === 'upload' && (
          <div className="space-y-4 py-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isExtracting && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              } ${isExtracting ? 'opacity-60 cursor-wait' : ''}`}
            >
              {isExtracting ? (
                <div className="space-y-4">
                  {previewUrl && (
                    <img src={previewUrl} alt="Uploading" className="max-h-36 mx-auto rounded-lg object-contain shadow-sm" />
                  )}
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-500" />
                  <p className="text-sm text-gray-500 font-medium">Extracting contact info with AI...</p>
                  <p className="text-xs text-gray-400">This takes a few seconds</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 mx-auto text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-700">Drop a screenshot here</p>
                    <p className="text-sm text-gray-400 mt-1">or click to choose a file</p>
                    <p className="text-xs text-gray-300 mt-3">PNG, JPG · up to 10 MB</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-400 text-center">
              Works great with LinkedIn profiles, business card photos, and CRM screenshots
            </p>
          </div>
        )}

        {phase === 'review' && (
          <div className="space-y-5 py-2">
            <div className="flex gap-4 items-start">
              {previewUrl && (
                <img src={previewUrl} alt="Screenshot" className="w-28 h-20 object-cover rounded-lg border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Review and edit the extracted info</p>
                <p className="text-xs text-gray-400 mt-1">AI may miss some fields — correct anything before saving</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-purple-600 h-7 px-2 hover:bg-purple-50"
                  onClick={() => { setPhase('upload'); setPreviewUrl(null); }}
                >
                  ← Try a different screenshot
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field('name', 'Full Name')}
              {field('company', 'Company')}
              {field('jobTitle', 'Job Title')}
              {field('email', 'Email')}
              {field('phone', 'Phone')}
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Address</p>
              <div className="grid grid-cols-2 gap-3">
                {field('street', 'Street Address')}
                {field('street2', 'Street Line 2 (Suite, Apt)')}
                {field('city', 'City')}
                {field('state', 'State / Province (full name)')}
                {field('zip', 'ZIP / Postal Code')}
                {field('country', 'Country (e.g. United States)')}
              </div>
            </div>

            <div>
              {field('notes', 'Notes')}
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Save as</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveAs('lead')}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    saveAs === 'lead' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`w-4 h-4 flex-shrink-0 ${saveAs === 'lead' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${saveAs === 'lead' ? 'text-purple-700' : 'text-gray-700'}`}>Lead</p>
                    <p className="text-xs text-gray-400">New prospect in your pipeline</p>
                  </div>
                </button>
                <button
                  onClick={() => setSaveAs('contact')}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    saveAs === 'contact' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className={`w-4 h-4 flex-shrink-0 ${saveAs === 'contact' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${saveAs === 'contact' ? 'text-blue-700' : 'text-gray-700'}`}>Contact</p>
                    <p className="text-xs text-gray-400">Add to Contacts (Admin only)</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !canSave}
                className={saveAs === 'lead' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save as {saveAs === 'lead' ? 'Lead' : 'Contact'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
