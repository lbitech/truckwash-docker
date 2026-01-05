import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Wash, type WashType, type Company } from "@shared/schema";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortField = keyof Wash | null;
type SortDirection = "asc" | "desc";

export default function WashDataTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("washId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: washes, isLoading: washesLoading } = useQuery<Wash[]>({
    queryKey: ["/api/washes"],
  });

  const { data: washTypes = [] } = useQuery<WashType[]>({
    queryKey: ["/api/washtypes"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const washTypesMap = useMemo(() => {
    return new Map(washTypes.map((type) => [type.wtid, type]));
  }, [washTypes]);

  const companiesMap = useMemo(() => {
    return new Map(companies.map((co) => [co.coId, co]));
  }, [companies]);

  const handleSort = (field: keyof Wash) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedWashes = useMemo(() => {
    if (!washes) return [];

    let filtered = washes.filter((wash) => {
      const searchLower = searchTerm.toLowerCase();
      const washType = washTypesMap.get(wash.washType);
      const company = companiesMap.get(wash.coId);
      return (
        wash.vreg.toLowerCase().includes(searchLower) ||
        wash.location.toLowerCase().includes(searchLower) ||
        (company && company.name.toLowerCase().includes(searchLower)) ||
        (wash.driverName && wash.driverName.toLowerCase().includes(searchLower)) ||
        (washType && washType.description.toLowerCase().includes(searchLower))
      );
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime();
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [washes, searchTerm, sortField, sortDirection, washTypesMap]);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: keyof Wash;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 font-medium uppercase tracking-wide text-xs hover-elevate"
      data-testid={`button-sort-${field}`}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle, company, location, or wash type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  <SortButton field="washId">ID</SortButton>
                </TableHead>
                <TableHead className="w-36">
                  <SortButton field="washDate">Date</SortButton>
                </TableHead>
                <TableHead className="w-28">
                  <SortButton field="vreg">Vehicle</SortButton>
                </TableHead>
                <TableHead className="w-36">
                  <SortButton field="driverName">Driver</SortButton>
                </TableHead>
                <TableHead className="w-36">
                  <SortButton field="coId">Company</SortButton>
                </TableHead>
                <TableHead className="w-48">
                  <SortButton field="washType">Wash Type</SortButton>
                </TableHead>
                <TableHead className="w-36">
                  <SortButton field="location">Location</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {washesLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    Loading wash records...
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedWashes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No wash records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedWashes.map((wash) => {
                  const washType = washTypesMap.get(wash.washType);
                  return (
                    <TableRow key={wash.washId} data-testid={`row-wash-${wash.washId}`}>
                      <TableCell className="font-medium" data-testid={`text-washid-${wash.washId}`}>
                        {wash.washId}
                      </TableCell>
                      <TableCell data-testid={`text-date-${wash.washId}`}>
                        {formatDate(wash.washDate)}
                      </TableCell>
                      <TableCell className="font-mono" data-testid={`text-vreg-${wash.washId}`}>
                        {wash.vreg}
                      </TableCell>
                      <TableCell data-testid={`text-driver-${wash.washId}`}>
                        {wash.driverName || "-"}
                      </TableCell>
                      <TableCell data-testid={`text-coid-${wash.washId}`}>
                        {wash.coId === 999999 ? (
                          <span className="text-muted-foreground">TBC</span>
                        ) : (
                          companiesMap.get(wash.coId)?.name || wash.coId
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-washtype-${wash.washId}`}>
                        {washType ? (
                          <div>
                            <div>{washType.description}</div>
                            <div className="text-sm text-muted-foreground">£{washType.price}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-location-${wash.washId}`}>
                        {wash.location}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {!washesLoading && filteredAndSortedWashes.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Showing {filteredAndSortedWashes.length} of {washes?.length || 0} wash records
        </div>
      )}
    </div>
  );
}
