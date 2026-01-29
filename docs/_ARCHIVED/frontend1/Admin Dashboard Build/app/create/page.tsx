import { DashboardShell } from "@/components/dashboard-shell";
import { CreateTransactionForm } from "@/components/create-transaction-form";

export default function CreatePage() {
  return (
    <DashboardShell>
      <CreateTransactionForm />
    </DashboardShell>
  );
}
