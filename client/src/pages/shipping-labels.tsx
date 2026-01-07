import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Printer, 
  Package, 
  Truck, 
  MapPin, 
  FileText, 
  Calendar,
  Scale, 
  Box, 
  Settings2,
  History,
  RotateCcw,
  Trash2,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Barcode from "react-barcode";
import logoPath from "@assets/4s_logo_Clean_120x_1764801255491.png";

const palletSchema = z.object({
  weight: z.coerce.number().min(0, "Weight must be positive"),
  dimensions: z.string().min(1, "Dimensions are required"),
});

const labelSchema = z.object({
  shipFrom: z.string().min(1, "Ship From address is required"),
  companyName: z.string().optional(),
  shipTo: z.string().min(1, "Ship To address is required"),
  invoiceNumber: z.string().min(1, "Invoice Number is required"),
  invoiceDate: z.string().optional(),
  clientPO: z.string().optional(),
  palletCount: z.coerce.number().min(1, "At least 1 pallet is required"),
  pallets: z.array(palletSchema),
  format: z.enum(["thermal", "thermal4x8", "laser", "localTransport"]),
  shipVia: z.string().optional(),
  customerDetails: z.string().optional(),
  showCustomerDetails: z.boolean().optional(),
});

type LabelFormValues = z.infer<typeof labelSchema>;

type Shipment = {
  id: number;
  shipFrom: string;
  companyName: string | null;
  shipTo: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  clientPO: string | null;
  palletCount: number;
  pallets: Array<{ weight: number; dimensions: string }>;
  format: string;
  shipVia: string | null;
  createdAt: string;
};

type ShippingCompany = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  createdAt: string;
};

type SavedRecipient = {
  id: number;
  companyName: string;
  address: string;
  createdAt: string;
};

const DEFAULT_VALUES: LabelFormValues = {
  shipFrom: "4S GRAPHICS, Inc.\n764 NW 57th Court, Fort Lauderdale, FL 33309\nPhone: (954) 493.6484 | eMail: orders@4sgraphics.com",
  companyName: "",
  shipTo: "",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().split('T')[0],
  clientPO: "",
  palletCount: 1,
  pallets: [{ weight: 0, dimensions: "48x40x50" }],
  format: "thermal",
  shipVia: "",
  customerDetails: "",
  showCustomerDetails: false,
};

// Translations for form labels (English/Spanish)
const translations = {
  en: {
    labelFormat: "Label Format",
    shipVia: "Ship Via (Carrier)",
    shipFrom: "Ship From",
    loadSavedRecipient: "Load Saved Recipient",
    recipientCompanyName: "Recipient Company Name",
    shipTo: "Ship To",
    invoiceNumber: "Invoice Number",
    invoiceDate: "Invoice Date",
    clientPO: "Client PO #",
    numberOfPallets: "Number of Pallets",
    showCustomerDetails: "Show Customer Details on Label",
    customerDetails: "Customer Details",
    weight: "Weight (lbs)",
    dimensions: "Dims (LxWxH)",
    livePreview: "Live Preview",
    palletOf: "Pallet {n} of {total}",
  },
  es: {
    labelFormat: "Formato de Etiqueta",
    shipVia: "Enviar Vía (Transportista)",
    shipFrom: "Enviar Desde",
    loadSavedRecipient: "Cargar Destinatario Guardado",
    recipientCompanyName: "Nombre de Empresa Destinataria",
    shipTo: "Enviar A",
    invoiceNumber: "Número de Factura",
    invoiceDate: "Fecha de Factura",
    clientPO: "Orden de Compra #",
    numberOfPallets: "Número de Pallets",
    showCustomerDetails: "Mostrar Detalles del Cliente en Etiqueta",
    customerDetails: "Detalles del Cliente",
    weight: "Peso (lbs)",
    dimensions: "Dims (LxWxH)",
    livePreview: "Vista Previa",
    palletOf: "Pallet {n} de {total}",
  }
};

type Language = 'en' | 'es';

export default function ShippingLabels() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  
  const t = translations[language];

  const { data: shipments = [] } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  const { data: shippingCompanies = [] } = useQuery<ShippingCompany[]>({
    queryKey: ["/api/shipping-companies"],
  });

  const { data: savedRecipients = [] } = useQuery<SavedRecipient[]>({
    queryKey: ["/api/saved-recipients"],
  });

  const saveRecipientMutation = useMutation({
    mutationFn: async (data: { companyName: string; address: string }) => {
      const response = await apiRequest("POST", "/api/saved-recipients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-recipients"] });
      toast({ title: "Recipient saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save recipient", variant: "destructive" });
    },
  });

  const createShippingCompanyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/shipping-companies", { name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-companies"] });
      toast({ title: "Shipping company saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save shipping company", variant: "destructive" });
    },
  });

  const createShipmentMutation = useMutation({
    mutationFn: async (data: LabelFormValues) => {
      const response = await apiRequest("POST", "/api/shipments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({ title: "Shipment saved successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to save shipment", variant: "destructive" });
    },
  });

  const deleteShipmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/shipments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({ title: "Shipment deleted!" });
    },
    onError: () => {
      toast({ title: "Failed to delete shipment", variant: "destructive" });
    },
  });

  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pallets",
  });

  const formValues = form.watch();

  useEffect(() => {
    const count = Math.max(1, formValues.palletCount || 1);
    if (fields.length !== count) {
      if (fields.length < count) {
        const toAdd = count - fields.length;
        for (let i = 0; i < toAdd; i++) {
          append({ weight: 0, dimensions: "48x40x50" });
        }
      } else if (fields.length > 1) {
        const toRemove = fields.length - count;
        for (let i = 0; i < toRemove; i++) {
          remove(fields.length - 1 - i);
        }
      }
    }
  }, [formValues.palletCount, append, remove, fields.length]);

  const handleSaveShipment = async () => {
    try {
      await createShipmentMutation.mutateAsync(formValues);
      if (formValues.companyName && formValues.shipTo) {
        await saveRecipientMutation.mutateAsync({
          companyName: formValues.companyName,
          address: formValues.shipTo,
        });
      }
      return true;
    } catch {
      return false;
    }
  };

  const handlePrint = async () => {
    const saved = await handleSaveShipment();
    if (!saved) {
      toast({ title: "Save failed. Print canceled.", variant: "destructive" });
      return;
    }
    window.print();
  };

  const handlePrintOnly = () => {
    window.print();
  };

  const handleSaveRecipient = () => {
    if (formValues.companyName && formValues.shipTo) {
      saveRecipientMutation.mutate({
        companyName: formValues.companyName,
        address: formValues.shipTo,
      });
    } else {
      toast({ title: "Enter company name and address to save recipient", variant: "destructive" });
    }
  };

  const loadFromHistory = (item: Shipment) => {
    form.reset({
      shipFrom: item.shipFrom,
      companyName: item.companyName || "",
      shipTo: item.shipTo || "",
      invoiceNumber: item.invoiceNumber || "",
      invoiceDate: item.invoiceDate || "",
      clientPO: item.clientPO || "",
      palletCount: item.palletCount,
      pallets: item.pallets,
      format: item.format as any,
      shipVia: item.shipVia || "",
    });
  };

  const clearHistory = async () => {
    if (confirm("Are you sure you want to clear your shipment history?")) {
      for (const shipment of shipments) {
        await deleteShipmentMutation.mutateAsync(shipment.id);
      }
    }
  };

  const validateAddress = (address: string) => {
    if (!address || address.trim().length === 0) {
      setAddressValidation({ isValid: false, message: "Address is required" });
      return;
    }
    const lines = address.split('\n').filter(line => line.trim().length > 0);
    const hasStreet = lines.length >= 1;
    const hasCityStateZip = lines.length >= 2;
    const lastLine = lines[lines.length - 1] || "";
    const stateZipPattern = /[A-Z]{2}\s+\d{5}|[A-Za-z]+\s+\d{5}/;
    const hasStateZip = stateZipPattern.test(lastLine);

    if (hasStreet && hasCityStateZip && hasStateZip) {
      setAddressValidation({ isValid: true, message: "Address format looks good" });
    } else {
      setAddressValidation({ isValid: false, message: "Address should include street, city, state, and ZIP code" });
    }
  };

  const openInGoogleMaps = () => {
    const address = formValues.shipTo;
    if (address) {
      const encodedAddress = encodeURIComponent(address.replace(/\n/g, ' '));
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  return (
    <>
      <div className="hidden print:block print:w-full print:h-full">
        <PrintLayout data={formValues} />
      </div>

      <div className="print:hidden space-y-6">
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t shadow-lg p-4 z-50 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => form.reset(DEFAULT_VALUES)}
            data-testid="button-reset"
            size="lg"
            className="glass-btn"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              toast({ title: "Select 'Save as PDF' in the print dialog" });
              window.print();
            }}
            data-testid="button-download-pdf"
            size="lg"
            className="glass-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            onClick={handlePrint} 
            className="gap-2 glass-btn-primary"
            disabled={createShipmentMutation.isPending}
            data-testid="button-print"
            size="lg"
          >
            <Printer className="h-4 w-4" />
            {createShipmentMutation.isPending ? "Saving..." : "Print Labels"}
          </Button>
        </div>

        <div className="flex justify-end mb-4">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-32" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Shipment Details</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the shipment information below to generate your label.
              </p>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.labelFormat}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-format">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="thermal">4x6 Thermal Label</SelectItem>
                            <SelectItem value="thermal4x8">4x8 Thermal Label</SelectItem>
                            <SelectItem value="laser">8.5x11 Laser Sheet (2-up)</SelectItem>
                            <SelectItem value="localTransport">Local Transport Form (8.5x11 2-up)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {formValues.format === 'localTransport' && (
                    <FormField
                      control={form.control}
                      name="shipVia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-400" />
                            {t.shipVia}
                          </FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                placeholder="Enter carrier name..." 
                                list="shipping-companies-list"
                                {...field}
                                data-testid="input-ship-via"
                                onBlur={(e) => {
                                  field.onBlur();
                                  const value = e.target.value.trim();
                                  if (value && !shippingCompanies.some(c => c.name === value)) {
                                    createShippingCompanyMutation.mutate(value);
                                  }
                                }}
                              />
                            </FormControl>
                            <datalist id="shipping-companies-list">
                              {shippingCompanies.map((company) => (
                                <option key={company.id} value={company.name} />
                              ))}
                            </datalist>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="shipFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {t.shipFrom}
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            className="resize-none font-mono text-sm min-h-[100px]" 
                            placeholder="Enter sender address..."
                            data-testid="textarea-ship-from"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {savedRecipients.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <History className="h-4 w-4 text-gray-400" />
                        {t.loadSavedRecipient}
                      </label>
                      <Select 
                        onValueChange={(value) => {
                          const recipient = savedRecipients.find(r => r.id.toString() === value);
                          if (recipient) {
                            form.setValue("companyName", recipient.companyName);
                            form.setValue("shipTo", recipient.address);
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-saved-recipient">
                          <SelectValue placeholder="Select a saved recipient..." />
                        </SelectTrigger>
                        <SelectContent>
                          {savedRecipients.map((recipient) => (
                            <SelectItem key={recipient.id} value={recipient.id.toString()}>
                              {recipient.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          {t.recipientCompanyName}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Company name..." data-testid="input-company-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {t.shipTo}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={openInGoogleMaps}
                            disabled={!formValues.shipTo}
                            className="h-6 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Maps
                          </Button>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            className="resize-none font-mono text-sm min-h-[100px]" 
                            placeholder="Enter recipient address..."
                            data-testid="textarea-ship-to"
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                              validateAddress(e.target.value);
                            }}
                          />
                        </FormControl>
                        {addressValidation && (
                          <div className={`flex items-center gap-1 text-xs ${addressValidation.isValid ? 'text-green-600' : 'text-amber-600'}`}>
                            {addressValidation.isValid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {addressValidation.message}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {t.invoiceNumber}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="INV-12345" data-testid="input-invoice" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {t.invoiceDate}
                          </FormLabel>
                          <FormControl>
                            <Input type="date" data-testid="input-date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="clientPO"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.clientPO}</FormLabel>
                        <FormControl>
                          <Input placeholder="PO-12345" data-testid="input-client-po" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="palletCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-gray-400" />
                          {t.numberOfPallets}/Boxes
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="99" data-testid="input-pallet-count" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-3">
                    <FormField
                      control={form.control}
                      name="showCustomerDetails"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-show-customer-details"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium cursor-pointer">
                            Print Booking Details on Label
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          Booking Details
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Booking Number, Reference, etc..." data-testid="input-customer-details" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-500">Pallet Details</div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border">
                        <div className="col-span-2 text-xs font-semibold text-gray-500 flex items-center gap-2">
                          <Box className="h-3 w-3" />
                          Pallet #{index + 1}
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`pallets.${index}.weight`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">{t.weight}</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" className="h-8" data-testid={`input-weight-${index}`} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`pallets.${index}.dimensions`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">{t.dimensions}</FormLabel>
                              <FormControl>
                                <Input className="h-8 font-mono" data-testid={`input-dims-${index}`} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </form>
              </Form>
            </div>

            {shipments.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <History className="h-5 w-5 text-gray-500" />
                      Recent Shipments
                    </h3>
                    <p className="text-xs text-muted-foreground">Click to reuse details</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearHistory} 
                    className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={deleteShipmentMutation.isPending}
                    data-testid="button-clear-history"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-[250px] pr-4">
                  <div className="space-y-3">
                    {shipments.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative flex flex-col gap-2 p-3 rounded-lg border bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => loadFromHistory(item)}
                        data-testid={`card-shipment-${item.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {item.invoiceNumber || "No Invoice #"}
                            <Badge variant="secondary" className="text-[10px] h-5">
                              {item.palletCount} plts
                            </Badge>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground font-mono bg-white/50 p-1.5 rounded border border-dashed truncate">
                          {item.shipTo?.split('\n')[0] || "No Recipient"}
                        </div>
                        
                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">{t.livePreview}</h2>
              <span className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm">
                {formValues.format === 'thermal' ? '4" x 6" Thermal' : formValues.format === 'thermal4x8' ? '4" x 8" Thermal' : '8.5" x 11" Laser (2-up)'}
              </span>
            </div>
            
            <div className="bg-gray-200/50 p-4 rounded-xl border-2 border-dashed border-gray-300 flex items-start justify-center min-h-[600px] overflow-auto">
              <div 
                className="bg-white shadow-2xl transition-all duration-300 ease-in-out origin-top"
                style={{
                  transform: (formValues.format === 'laser' || formValues.format === 'localTransport') ? 'scale(0.55)' : 'scale(0.9)',
                  transformOrigin: 'top center'
                }}
              >
                <div className="grid gap-8">
                  {Array.from({ length: Math.max(1, formValues.palletCount || 1) }).map((_, i) => (
                    <LabelPreview key={i} data={formValues} palletIndex={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PrintLayout({ data }: { data: LabelFormValues }) {
  const pallets = data.pallets || Array.from({ length: Math.max(1, data.palletCount) }, () => ({ weight: 0, dimensions: "" }));
  const isLaser = data.format === 'laser' || data.format === 'localTransport';
  const pageSize = data.format === 'thermal' ? '4in 6in' : data.format === 'thermal4x8' ? '4in 8in' : '8.5in 11in';

  if (isLaser) {
    return (
      <>
        <style>{`
          @media print {
            @page { size: ${pageSize}; margin: 0; }
            body { background: white; }
            .print-page-break { break-after: page; }
          }
        `}</style>
        
        {pallets.map((_, index) => (
          <div key={index} className="print-page-break" style={{ 
            width: '8.5in', height: '11in', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ height: '5.3in', width: '8.5in', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LabelDesign data={data} currentPallet={index + 1} />
            </div>
            <div style={{ width: '100%', height: '0.4in', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ borderTop: '1px dashed #999', width: '100%', position: 'absolute' }} />
              <span style={{ backgroundColor: 'white', padding: '0 8px', fontSize: '8px', color: '#999' }}>CUT HERE</span>
            </div>
            <div style={{ height: '5.3in', width: '8.5in', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LabelDesign data={data} currentPallet={index + 1} />
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: ${pageSize}; margin: 0; }
          body { background: white; }
          .print-page-break { break-after: page; }
        }
      `}</style>
      
      {pallets.map((_, index) => (
        <div key={index} className="print-page-break">
          <LabelDesign data={data} currentPallet={index + 1} />
        </div>
      ))}
    </>
  );
}

function LabelPreview({ data, palletIndex }: { data: LabelFormValues, palletIndex: number }) {
  return <LabelDesign data={data} currentPallet={palletIndex + 1} previewMode />;
}

function LabelDesign({ data, currentPallet, previewMode = false }: { data: LabelFormValues; currentPallet: number; previewMode?: boolean }) {
  const isThermal = data.format === 'thermal' || data.format === 'thermal4x8';
  const is4x8 = data.format === 'thermal4x8';
  const isLocalTransport = data.format === 'localTransport';
  const palletData = data.pallets?.[currentPallet - 1] || { weight: 0, dimensions: "---" };

  const containerStyle = data.format === 'thermal' 
    ? { width: '4in', height: '6in' } 
    : data.format === 'thermal4x8'
    ? { width: '4in', height: '8in' }
    : { width: '8.5in', height: '5in', boxSizing: 'border-box' as const };

  const isLaser = data.format === 'laser' || data.format === 'localTransport';
  
  return (
    <div style={containerStyle} className={`bg-white relative overflow-hidden flex flex-col ${previewMode ? 'pointer-events-none select-none' : ''}`}>
      <div className={`flex-1 flex flex-col ${isLaser ? 'p-3' : 'p-4 border-4 border-black m-1'}`}>
        
        {isLocalTransport && data.shipVia && (
          <div className="text-center border-b border-black pb-0.5 mb-1">
            <div className="text-[8px] uppercase font-bold tracking-wider text-gray-500">Ship Via</div>
            <div className="text-xl font-black uppercase tracking-wide leading-tight">{data.shipVia}</div>
          </div>
        )}

        <div className={`flex justify-between items-start border-b-2 border-black ${isThermal ? (is4x8 ? 'pb-3 mb-3' : 'pb-2 mb-2') : (isLocalTransport ? 'pb-2 mb-2' : 'pb-4 mb-4')}`}>
          <div className="flex items-start gap-3">
            {data.format === 'laser' && (
              <img src={logoPath} alt="4S Graphics" className="h-10 w-auto object-contain" />
            )}
            <div className="flex flex-col">
              <div className={`uppercase font-bold tracking-wider text-gray-600 shrink-0 ${isThermal ? (is4x8 ? 'text-xs' : 'text-[8px]') : 'text-xs'}`}>Ship From:</div>
              {data.invoiceNumber && (
                <div className={`mt-1 ${isThermal ? '' : 'mt-2'}`}>
                  <Barcode 
                    value={data.invoiceNumber || "000000"} 
                    format="CODE128"
                    width={isThermal ? 1 : 1.5}
                    height={isThermal ? (is4x8 ? 30 : 25) : (isLocalTransport ? 25 : 40)}
                    displayValue={false}
                    margin={0}
                    background="transparent"
                  />
                </div>
              )}
            </div>
          </div>
          <div className={`text-right ${isThermal ? (is4x8 ? 'text-[10px] leading-relaxed' : 'text-[7px] leading-tight') : 'text-sm'}`}>
            {(() => {
              const lines = (data.shipFrom || "Sender Address").split('\n');
              const companyName = lines[0];
              const addressLine = lines[1] || '';
              const contactLine = lines[2] || '';
              return (
                <>
                  <div className={`font-black ${isThermal ? (is4x8 ? 'text-xl' : 'text-sm') : 'text-lg'}`}>{companyName}</div>
                  <div className="font-medium">{addressLine}</div>
                  {contactLine && (
                    <div className={`font-medium ${isThermal ? (is4x8 ? 'text-[8px]' : 'text-[6px]') : 'text-xs'}`}>{contactLine}</div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <div className={`flex-1 overflow-hidden ${is4x8 ? 'mb-6' : (isLocalTransport ? 'mb-2' : 'mb-4')}`}>
          <div className="flex justify-between items-start">
            <div className={`uppercase font-bold tracking-wider text-gray-600 ${is4x8 ? 'text-sm mb-2' : 'text-xs mb-1'}`}>Ship To:</div>
          </div>
          {data.companyName && (
            <div className={`font-bold uppercase mb-1 tracking-tight ${isThermal ? (is4x8 ? 'text-xl' : 'text-sm') : 'text-lg'}`} style={{
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {data.companyName}
            </div>
          )}
          <div className={`font-bold ${isThermal ? (is4x8 ? 'text-2xl leading-relaxed' : 'text-base leading-snug') : 'text-xl leading-snug'}`} style={{
            display: '-webkit-box', WebkitLineClamp: isThermal ? (is4x8 ? 8 : 5) : 7, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-line'
          }}>
            {data.shipTo || "Recipient Address"}
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-0 border-2 border-black ${is4x8 ? 'border-4' : ''}`}>
          <div className={`border-r-2 border-b-2 border-black overflow-hidden ${is4x8 ? 'p-3 border-r-4 border-b-4' : 'p-2'}`}>
            <div className={`uppercase font-bold text-gray-500 truncate ${is4x8 ? 'text-xs' : 'text-[10px]'}`}>4SG Invoice#</div>
            <div className={`font-mono font-bold truncate ${isThermal ? (is4x8 ? 'text-xl' : 'text-base') : 'text-xl'}`}>{data.invoiceNumber || "---"}</div>
          </div>

          <div className={`border-b-2 border-black overflow-hidden ${is4x8 ? 'p-3 border-b-4' : 'p-2'}`}>
            <div className={`uppercase font-bold text-gray-500 truncate ${is4x8 ? 'text-xs' : 'text-[10px]'}`}>Date</div>
            <div className={`font-mono font-bold truncate ${isThermal ? 'text-base' : 'text-xl'}`}>{data.invoiceDate || "---"}</div>
          </div>

          <div className={`border-r-2 border-b-2 border-black overflow-hidden ${is4x8 ? 'p-3 border-r-4 border-b-4' : 'p-2'}`}>
            <div className={`uppercase font-bold text-gray-500 truncate ${is4x8 ? 'text-xs' : 'text-[10px]'}`}>PO# / Booking Ref</div>
            <div className={`font-mono font-bold truncate ${isThermal ? (is4x8 ? 'text-xl' : 'text-base') : 'text-xl'}`}>{data.clientPO || "---"}</div>
          </div>
          
          <div className={`border-b-2 border-black bg-black text-white overflow-hidden ${is4x8 ? 'p-3 border-b-4' : 'p-2'}`}>
            <div className={`uppercase font-bold text-gray-300 ${is4x8 ? 'text-sm' : 'text-xs'}`}>Pallet/Box</div>
            <div className={`font-mono truncate ${isThermal ? (is4x8 ? 'text-2xl' : 'text-xl') : 'text-2xl'}`}>
              <span className="font-black">{currentPallet}</span> <span className={`font-normal text-gray-400 ${isThermal ? (is4x8 ? 'text-base' : 'text-sm') : 'text-base'}`}>of</span> <span className="font-black">{data.palletCount}</span>
            </div>
          </div>

          <div className={`border-r-2 border-b-2 border-black overflow-hidden ${is4x8 ? 'p-3 border-r-4 border-b-4' : 'p-2'}`}>
            <div className={`uppercase font-bold text-gray-500 ${is4x8 ? 'text-xs' : 'text-[10px]'}`}>Weight</div>
            <div className={`font-mono font-bold truncate ${isThermal ? (is4x8 ? 'text-lg' : 'text-sm') : 'text-lg'}`}>{palletData.weight} <span className={`${is4x8 ? 'text-sm' : 'text-xs'}`}>lbs</span></div>
          </div>

          <div className={`border-b-2 border-black overflow-hidden ${is4x8 ? 'p-3 border-b-4' : 'p-2'}`}>
            <div className={`uppercase font-bold text-gray-500 ${is4x8 ? 'text-xs' : 'text-[10px]'}`}>Dimensions</div>
            <div className={`font-mono font-bold truncate ${isThermal ? (is4x8 ? 'text-lg' : 'text-sm') : 'text-lg'}`}>{palletData.dimensions}</div>
          </div>

          {data.showCustomerDetails && data.customerDetails && (
            <div className={`col-span-2 overflow-hidden ${is4x8 ? 'p-3' : 'p-2'}`}>
              <div className={`uppercase font-bold text-gray-500 ${is4x8 ? 'text-xs' : 'text-[10px]'}`}>Booking Details</div>
              <div className={`font-bold truncate ${isThermal ? (is4x8 ? 'text-lg' : 'text-sm') : 'text-lg'}`}>{data.customerDetails}</div>
            </div>
          )}
        </div>

        <div className={`mt-auto flex justify-between items-end ${is4x8 ? 'pt-6' : (isLocalTransport ? 'pt-0' : 'pt-4')}`}>
          <div className={`text-gray-600 font-mono ${isThermal ? (is4x8 ? 'text-xs' : 'text-[9px]') : 'text-[10px]'}`}>
            <span className="font-bold">Printed:</span> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </div>
          {isThermal && (
            <div className={`flex items-center justify-center border-2 border-black ${is4x8 ? 'px-3 py-2 border-4' : 'px-2 py-1'}`} style={{ fontWeight: 900 }}>
              <span className={`font-black tracking-tight ${is4x8 ? 'text-2xl' : 'text-lg'}`}>4SG</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
