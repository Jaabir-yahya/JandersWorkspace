import { useAppStore } from "./store";
import { BottomNav } from "./components/common/BottomNav";
import { Dashboard } from "./components/dashboard/Dashboard";
import { TransactionList } from "./components/transactions/TransactionList";
import { QuickAdd } from "./components/transactions/QuickAdd";
import { PeopleList } from "./components/people/PeopleList";
import "./index.css";

function App() {
  const { currentScreen, setCurrentScreen } = useAppStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <TransactionList />;
      case "add-transaction":
        return <QuickAdd />;
      case "people":
        return <PeopleList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="safe-top">{renderScreen()}</main>

      {/* Bottom Navigation */}
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </div>
  );
}

export default App;
