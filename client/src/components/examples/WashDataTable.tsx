import WashDataTable from "../WashDataTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockWashes = [
  {
    washId: 1,
    vehicle: "TRK001",
    washType: "Full Wash",
    date: new Date("2025-01-15T09:30:00"),
    driver: "John Smith",
    company: "Express Logistics Ltd",
    location: "Manchester Depot",
  },
  {
    washId: 2,
    vehicle: "TRK045",
    washType: "Exterior Only",
    date: new Date("2025-01-15T10:15:00"),
    driver: "Sarah Jones",
    company: "Swift Transport",
    location: "Birmingham Hub",
  },
  {
    washId: 3,
    vehicle: "VAN223",
    washType: "Full Wash",
    date: new Date("2025-01-15T11:00:00"),
    driver: null,
    company: "Express Logistics Ltd",
    location: "London Terminal",
  },
  {
    washId: 4,
    vehicle: "TRK078",
    washType: "Basic Clean",
    date: new Date("2025-01-16T08:45:00"),
    driver: "Michael Brown",
    company: "National Freight",
    location: "Manchester Depot",
  },
  {
    washId: 5,
    vehicle: "TRK092",
    washType: "Full Wash",
    date: new Date("2025-01-16T14:20:00"),
    driver: "Emma Wilson",
    company: "Swift Transport",
    location: "Leeds Service Center",
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async () => mockWashes,
      retry: false,
    },
  },
});

export default function WashDataTableExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <WashDataTable />
    </QueryClientProvider>
  );
}
