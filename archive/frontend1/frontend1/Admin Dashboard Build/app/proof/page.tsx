import { DashboardShell } from "@/components/dashboard-shell";
import { ProofGallery } from "@/components/proof-gallery";

export default function ProofPage() {
  return (
    <DashboardShell>
      <div className="container py-8">
        <ProofGallery />
      </div>
    </DashboardShell>
  );
}
