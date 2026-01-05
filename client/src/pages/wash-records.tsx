import WashDataTable from "@/components/WashDataTable";

export default function WashRecords() {
  return (
    <div className="space-y-6">
      <div className="px-6 pt-8 max-w-7xl mx-auto">
        {/* Wash List Generator moved to /manage-wash */}
      </div>
      <WashDataTable />
    </div>
  );
}
