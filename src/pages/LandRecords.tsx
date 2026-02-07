import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download, Plus, Loader2, Eye, MoreHorizontal, Edit, Trash2, MapPin, FileDown, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLandRecords, useDeleteLandRecord, LandRecord } from "@/hooks/useLandRecords";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const statusStyles = {
  verified: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  disputed: "bg-destructive/10 text-destructive border-destructive/20",
};

const LandRecords = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [landTypeFilter, setLandTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<LandRecord | null>(null);

  // Export Dialog State
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportStep, setExportStep] = useState<1 | 2>(1);
  const [exportSelection, setExportSelection] = useState<"selected" | "all">("selected");

  const { data: records, isLoading } = useLandRecords({
    status: statusFilter,
    search: searchTerm,
  });

  const deleteRecord = useDeleteLandRecord();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced to 5 to demonstrate pagination

  // Derived filters
  const filteredRecords = (records || []).filter((record) => {
    if (landTypeFilter !== "all" && record.land_type?.toLowerCase() !== landTypeFilter.toLowerCase()) return false;
    if (districtFilter !== "all" && record.district?.toLowerCase() !== districtFilter.toLowerCase()) return false;
    return true;
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, landTypeFilter, districtFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueDistricts = Array.from(new Set(records?.map(r => r.district).filter(Boolean) || [])).sort();

  const toggleRecord = (id: string) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleAllPage = () => {
    const pageIds = paginatedRecords.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedRecords.includes(id));

    if (allSelected) {
      setSelectedRecords((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedRecords((prev) => {
        const newSelected = new Set([...prev, ...pageIds]);
        return Array.from(newSelected);
      });
    }
  };

  const handleDeleteClick = (record: LandRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteRecord.mutate(recordToDelete.id);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleExportClick = () => {
    setExportStep(1);
    setExportSelection(selectedRecords.length > 0 ? "selected" : "all");
    setExportDialogOpen(true);
  };

  const getRecordsToExport = () => {
    if (exportSelection === "selected" && selectedRecords.length > 0) {
      return filteredRecords.filter(r => selectedRecords.includes(r.id));
    }
    return filteredRecords;
  };

  const handleExportAction = (formatType: 'csv' | 'pdf') => {
    const recordsToExport = getRecordsToExport();

    if (formatType === 'csv') {
      const headers = ["Survey No", "Owner", "Village", "Taluka", "District", "Area (Acres)", "Land Type", "Status", "Updated At"];
      const csvContent = [
        headers.join(","),
        ...recordsToExport.map(r => [
          r.survey_number,
          `"${r.owner_name}"`,
          r.village,
          r.taluka,
          r.district,
          r.area_acres,
          r.land_type,
          r.status,
          format(new Date(r.updated_at), "yyyy-MM-dd")
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `land_records_${format(new Date(), "yyyyMMdd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF Export
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Land Records Export", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30);
      doc.text(`Total Records: ${recordsToExport.length}`, 14, 36);

      const tableColumn = ["Survey No", "Owner", "Location", "Area", "Type", "Status"];
      const tableRows = recordsToExport.map(r => [
        r.survey_number,
        r.owner_name,
        `${r.village}, ${r.district}`,
        `${r.area_acres} ac`,
        r.land_type || "-",
        r.status
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      });

      doc.save(`land_records_${format(new Date(), "yyyyMMdd")}.pdf`);
    }

    setExportDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Land Records
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all land ownership records
          </p>
        </div>
        <Button className="glow" onClick={() => navigate("/register")}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Record
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 card-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by owner, survey number, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter Records</h4>
                  <p className="text-sm text-muted-foreground">
                    Refine your search with additional criteria.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="landType">Land Type</Label>
                    <Select value={landTypeFilter} onValueChange={setLandTypeFilter}>
                      <SelectTrigger id="landType" className="col-span-2 h-8">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="district">District</Label>
                    <Select value={districtFilter} onValueChange={setDistrictFilter}>
                      <SelectTrigger id="district" className="col-span-2 h-8">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {uniqueDistricts.map(district => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(landTypeFilter !== "all" || districtFilter !== "all") && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setLandTypeFilter("all");
                      setDistrictFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handleExportClick}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-card rounded-xl card-shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No land records found</p>
            <Button onClick={() => navigate("/register")}>
              <Plus className="w-4 h-4 mr-2" />
              Register First Record
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedRecords.length > 0 &&
                        paginatedRecords.every((r) => selectedRecords.includes(r.id))
                      }
                      onCheckedChange={toggleAllPage}
                    />
                  </TableHead>
                  <TableHead>Survey No.</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Land Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className={`cursor-pointer ${selectedRecords.includes(record.id)
                      ? "bg-primary/5"
                      : "hover:bg-muted/50"
                      }`}
                    onClick={() => navigate(`/records/${record.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={() => toggleRecord(record.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{record.survey_number}</TableCell>
                    <TableCell>{record.owner_name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.district}</div>
                        <div className="text-xs text-muted-foreground">
                          India
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{record.area_acres} acres</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {record.land_type || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[record.status as keyof typeof statusStyles]}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(record.updated_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/records/${record.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/records/${record.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/map")}>
                              <MapPin className="w-4 h-4 mr-2" />
                              View on Map
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(record)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRecords.length)}-
                {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Land Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for "{recordToDelete?.survey_number}" owned by {recordToDelete?.owner_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Records</DialogTitle>
            <DialogDescription>
              {exportStep === 1
                ? "Select which records you would like to export."
                : "Choose a file format for your export."}
            </DialogDescription>
          </DialogHeader>

          {exportStep === 1 ? (
            <div className="grid gap-4 py-4">
              <RadioGroup value={exportSelection} onValueChange={(val) => setExportSelection(val as "selected" | "all")}>
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="selected" id="option-selected" disabled={selectedRecords.length === 0} />
                  <Label htmlFor="option-selected" className={`flex-1 cursor-pointer ${selectedRecords.length === 0 ? "opacity-50" : ""}`}>
                    <span className="font-semibold block">Selected Records</span>
                    <span className="text-sm text-muted-foreground">{selectedRecords.length} records selected</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="all" id="option-all" />
                  <Label htmlFor="option-all" className="flex-1 cursor-pointer">
                    <span className="font-semibold block">All Loaded Records</span>
                    <span className="text-sm text-muted-foreground">{filteredRecords.length} records available</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div
                className="border rounded-md p-4 hover:bg-primary/5 cursor-pointer text-center transition-all hover:border-primary group"
                onClick={() => handleExportAction('csv')}
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">CSV</h3>
                <p className="text-xs text-muted-foreground">Spreadsheet format</p>
              </div>
              <div
                className="border rounded-md p-4 hover:bg-primary/5 cursor-pointer text-center transition-all hover:border-primary group"
                onClick={() => handleExportAction('pdf')}
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <FileDown className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">PDF</h3>
                <p className="text-xs text-muted-foreground">Document format</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {exportStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setExportStep(2)}>Next</Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setExportStep(1)} className="mr-auto">Back</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandRecords;