import { DashboardShell } from "@/components/dashboard-shell";
import { PeopleCRM } from "@/components/people-crm";

export default function PeoplePage() {
  return (
    <DashboardShell>
      <PeopleCRM />
    </DashboardShell>
  );
}
