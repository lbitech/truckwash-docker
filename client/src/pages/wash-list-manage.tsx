import WashListGenerator from "@/components/WashListGenerator";

export default function WashListManage() {
    return (
        <div className="space-y-6">
            <div className="px-6 pt-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">Manage Wash</h1>
                <WashListGenerator />
            </div>
        </div>
    );
}
