import { DashboardShell } from "@/components/dashboard-shell";
import { TransactionManager } from "@/components/transaction-manager";

export default function ManagerPage() {
  return (
    <DashboardShell>
      <TransactionManager />
    </DashboardShell>
  );
}
