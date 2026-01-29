import { DashboardShell } from "@/components/dashboard-shell";
import { TransactionFeed } from "@/components/transaction-feed";

export default function HomePage() {
  return (
    <DashboardShell>
      <TransactionFeed />
    </DashboardShell>
  );
}
