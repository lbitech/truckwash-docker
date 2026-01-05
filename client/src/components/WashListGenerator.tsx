import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Company, type Wash, type WashType, type WashList } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest, queryClient } from "@/lib/queryClient";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

export default function WashListGenerator() {
  const [dateMode, setDateMode] = useState<"custom" | "month">("custom");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [historyFilterText, setHistoryFilterText] = useState<string>("");
  const [historyFilterStartDate, setHistoryFilterStartDate] = useState<string>("");
  const [historyFilterEndDate, setHistoryFilterEndDate] = useState<string>("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedWashListForInvoice, setSelectedWashListForInvoice] = useState<(WashList & { companyName: string }) | null>(null);
  const [poNumber, setPoNumber] = useState("");
  const { toast } = useToast();

  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: washes = [], isLoading: washesLoading } = useQuery<Wash[]>({
    queryKey: ["/api/washes"],
  });

  const { data: washTypes = [], isLoading: washTypesLoading } = useQuery<WashType[]>({
    queryKey: ["/api/washtypes"],
  });

  const { data: washLists = [] } = useQuery<(WashList & { companyName: string })[]>({
    queryKey: ["/api/wash-lists"],
  });

  const uploadWashListMutation = useMutation({
    mutationFn: async (data: { coId: number; startDate: string; endDate: string; pdfContent: string }) => {
      await apiRequest("POST", "/api/wash-lists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wash-lists"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save wash list",
        description: error.message || "An error occurred while saving the wash list history.",
        variant: "destructive",
      });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: { coId: number; startDate: string; endDate: string; poNumber: string; pdfContent: string }) => {
      await apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice Generated",
        description: "The invoice has been created and saved successfully.",
      });
      setIsInvoiceDialogOpen(false);
      setPoNumber("");
    },
    onError: (error) => {
      toast({
        title: "Failed to save invoice",
        description: error.message || "An error occurred while saving the invoice.",
        variant: "destructive",
      });
    },
  });

  const isLoading = companiesLoading || washesLoading || washTypesLoading;

  const generatePDF = () => {
    if (!selectedCompanyId) {
      toast({
        title: "Company Required",
        description: "Please select a company to generate a wash list for.",
        variant: "destructive",
      });
      return;
    }

    let start: Date;
    let end: Date;

    if (dateMode === "custom") {
      if (!startDate || !endDate) {
        toast({
          title: "Date Range Required",
          description: "Please select both start and end dates.",
          variant: "destructive",
        });
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        toast({
          title: "Invalid Date Range",
          description: "Start date must be before or equal to end date.",
          variant: "destructive",
        });
        return;
      }

      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Month mode
      start = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      start.setHours(0, 0, 0, 0);
      // Last day of month
      end = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    const companyId = parseInt(selectedCompanyId);
    const company = companies.find((c) => c.coId === companyId);

    if (!company) {
      toast({
        title: "Company Not Found",
        description: "Selected company could not be found.",
        variant: "destructive",
      });
      return;
    }

    // start and end are already set above

    const filteredWashes = washes.filter((wash) => {
      const washDate = new Date(wash.washDate);
      return wash.coId === companyId && washDate >= start && washDate <= end;
    });

    if (filteredWashes.length === 0) {
      toast({
        title: "No Washes Found",
        description: "No wash records found for this company in the selected date range.",
        variant: "destructive",
      });
      return;
    }

    const washTypesMap = new Map(washTypes.map((type) => [type.wtid, type]));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("UK Truck Clean", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(16);
    doc.text("WASH LIST REPORT", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Report Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 45);

    doc.setFontSize(12);
    doc.text("Bill To:", 20, 55);
    doc.setFontSize(10);
    doc.text(company.name, 20, 62);
    if (company.transportManager) {
      doc.text(`Attn: ${company.transportManager}`, 20, 68);
    }
    if (company.transportManagerEmail) {
      doc.text(company.transportManagerEmail, 20, 74);
    }
    if (company.transportManagerPhone) {
      doc.text(company.transportManagerPhone, 20, 80);
    }

    doc.text(`Period: ${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString("en-GB")}`, 20, 90);

    const headers = ["Date", "Vehicle", "Location", "Wash Type", "Price (£)"];
    const startY = 100;
    const colWidths = [35, 30, 40, 60, 25];
    let currentY = startY;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let currentX = 20;
    headers.forEach((header, index) => {
      doc.text(header, currentX, currentY);
      currentX += colWidths[index];
    });

    doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    let totalCost = 0;

    filteredWashes.forEach((wash) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      const washType = washTypesMap.get(wash.washType);
      const price = washType?.price || 0;
      totalCost += price;

      const washDate = new Date(wash.washDate);
      const dateStr = washDate.toLocaleDateString("en-GB");
      const washTypeDesc = washType?.description || "Unknown";

      currentX = 20;
      doc.text(dateStr, currentX, currentY);
      currentX += colWidths[0];
      doc.text(wash.vreg, currentX, currentY);
      currentX += colWidths[1];
      doc.text(wash.location.substring(0, 18), currentX, currentY);
      currentX += colWidths[2];
      doc.text(washTypeDesc.substring(0, 28), currentX, currentY);
      currentX += colWidths[3];
      doc.text(price.toFixed(2), currentX, currentY);

      currentY += 7;
    });

    currentY += 5;
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: £${totalCost.toFixed(2)}`, pageWidth - 50, currentY, { align: "right" });

    currentY += 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Washes: ${filteredWashes.length}`, 20, currentY);

    const filename = `wash_list_${company.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    uploadWashListMutation.mutate({
      coId: companyId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      pdfContent: pdfBase64,
    });

    toast({
      title: "Wash List Generated",
      description: `Wash list created successfully with ${filteredWashes.length} washes totaling £${totalCost.toFixed(2)}.`,
    });
  };

  const generateInvoicePDF = (washList: WashList & { companyName: string }, poNum: string) => {
    // Re-filter washes for this list
    const companyId = washList.coId;
    const company = companies.find((c) => c.coId === companyId);
    if (!company) return;

    const start = new Date(washList.startDate);
    const end = new Date(washList.endDate);

    const filteredWashes = washes.filter((wash) => {
      const washDate = new Date(wash.washDate);
      return wash.coId === companyId && washDate >= start && washDate <= end;
    });

    const washTypesMap = new Map(washTypes.map((type) => [type.wtid, type]));
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("UK Truck Clean", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(16);
    doc.text("INVOICE", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString("en-GB")}`, 20, 45);
    if (poNum) {
      doc.text(`PO Number: ${poNum}`, pageWidth - 20, 45, { align: "right" });
    }

    doc.setFontSize(12);
    doc.text("Bill To:", 20, 55);
    doc.setFontSize(10);
    doc.text(company.name, 20, 62);
    if (company.transportManager) doc.text(`Attn: ${company.transportManager}`, 20, 68);

    doc.text(`Period: ${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString("en-GB")}`, 20, 90);

    const headers = ["Date", "Vehicle", "Location", "Wash Type", "Price (£)"];
    const colWidths = [35, 30, 40, 60, 25];
    let currentY = 100;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let currentX = 20;
    headers.forEach((header, index) => {
      doc.text(header, currentX, currentY);
      currentX += colWidths[index];
    });

    doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    let totalCost = 0;

    filteredWashes.forEach((wash) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      const washType = washTypesMap.get(wash.washType);
      const price = washType?.price || 0;
      totalCost += price;

      currentX = 20;
      doc.text(new Date(wash.washDate).toLocaleDateString("en-GB"), currentX, currentY);
      currentX += colWidths[0];
      doc.text(wash.vreg, currentX, currentY);
      currentX += colWidths[1];
      doc.text(wash.location.substring(0, 18), currentX, currentY);
      currentX += colWidths[2];
      doc.text((washType?.description || "Unknown").substring(0, 28), currentX, currentY);
      currentX += colWidths[3];
      doc.text(price.toFixed(2), currentX, currentY);

      currentY += 7;
    });

    currentY += 5;
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: £${totalCost.toFixed(2)}`, pageWidth - 50, currentY, { align: "right" });

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    createInvoiceMutation.mutate({
      coId: companyId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      poNumber: poNum,
      pdfContent: pdfBase64,
    });

    const filename = `invoice_${company.name.replace(/[^a-z0-9]/gi, '_')}_${poNum || 'no_po'}.pdf`;
    doc.save(filename);
  };

  const realCompanies = companies.filter((c) => c.coId !== 999999);

  const filteredHistory = washLists.filter((list) => {
    const matchesText = list.companyName.toLowerCase().includes(historyFilterText.toLowerCase());
    const matchesStartDate = !historyFilterStartDate || new Date(list.startDate) >= new Date(historyFilterStartDate);
    const matchesEndDate = !historyFilterEndDate || new Date(list.endDate) <= new Date(historyFilterEndDate);
    return matchesText && matchesStartDate && matchesEndDate;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Wash List
          </CardTitle>
          <CardDescription>
            Create a PDF wash list report for a company's washes within a date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-select" data-testid="label-company">Company</Label>
              <Select
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
              >
                <SelectTrigger id="company-select" data-testid="select-company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {realCompanies.map((company) => (
                    <SelectItem
                      key={company.coId}
                      value={company.coId.toString()}
                      data-testid={`option-company-${company.coId}`}
                    >
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>

            <div className="space-y-4">
              <RadioGroup
                defaultValue="custom"
                value={dateMode}
                onValueChange={(val) => setDateMode(val as "custom" | "month")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="mode-custom" />
                  <Label htmlFor="mode-custom">Custom Range</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="mode-month" />
                  <Label htmlFor="mode-month">Month/Year</Label>
                </div>
              </RadioGroup>

              {dateMode === "custom" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" data-testid="label-start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      data-testid="input-start-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date" data-testid="label-end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month-select">Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger id="month-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={month} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year-select">Year</Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger id="year-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={generatePDF}
              className="w-full"
              disabled={isLoading}
              data-testid="button-generate-wash-list"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isLoading ? "Loading..." : "Generate PDF Wash List"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Generated Wash List History</CardTitle>
          <CardDescription>
            View and download past wash list reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="history-filter-text">Filter by Company</Label>
              <Input
                id="history-filter-text"
                placeholder="Search company..."
                value={historyFilterText}
                onChange={(e) => setHistoryFilterText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-filter-start">From Date</Label>
              <Input
                id="history-filter-start"
                type="date"
                value={historyFilterStartDate}
                onChange={(e) => setHistoryFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-filter-end">To Date</Label>
              <Input
                id="history-filter-end"
                type="date"
                value={historyFilterEndDate}
                onChange={(e) => setHistoryFilterEndDate(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No wash lists found match your filters</TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((washList) => (
                  <TableRow key={washList.id}>
                    <TableCell>{washList.companyName}</TableCell>
                    <TableCell>{new Date(washList.startDate).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>{new Date(washList.endDate).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>{washList.generatedAt ? new Date(washList.generatedAt).toLocaleString("en-GB") : 'N/A'}</TableCell>
                    <TableCell className="flex gap-2">
                      <a href={`/api/wash-lists/${washList.id}/download`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedWashListForInvoice(washList);
                          setIsInvoiceDialogOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Enter the Purchase Order (PO) number provided by {selectedWashListForInvoice?.companyName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="po-number">PO Number</Label>
              <Input
                id="po-number"
                placeholder="e.g. PO-12345"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedWashListForInvoice && generateInvoicePDF(selectedWashListForInvoice, poNumber)}
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? "Generating..." : "Generate Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
