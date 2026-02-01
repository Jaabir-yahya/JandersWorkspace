import { usePeopleStore } from "../../store";
import { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { User, Phone, Plus, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PersonType } from "../../types";

export function PeopleList() {
  const { people, addPerson, searchPeople } = usePeopleStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("");
  const [newPersonType, setNewPersonType] = useState<PersonType>("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPeople = searchQuery ? searchPeople(searchQuery) : people;

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPersonName.trim()) return;

    setIsSubmitting(true);

    try {
      addPerson({
        name: newPersonName.trim(),
        phone: newPersonPhone.trim() || undefined,
        type: newPersonType,
      });

      // Reset form
      setNewPersonName("");
      setNewPersonPhone("");
      setNewPersonType("customer");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add person:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getTypeColor = (type: PersonType) => {
    const colors: Record<PersonType, string> = {
      customer: "bg-blue-100 text-blue-700",
      supplier: "bg-purple-100 text-purple-700",
      employee: "bg-orange-100 text-orange-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[type];
  };

  const getTypeLabel = (type: PersonType) => {
    const labels: Record<PersonType, string> = {
      customer: "Customer",
      supplier: "Supplier",
      employee: "Employee",
      other: "Other",
    };
    return labels[type];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        {!showAddForm && (
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Person
          </Button>
        )}
      </div>

      {/* Add Person Form */}
      {showAddForm && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Add New Person</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-green-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddPerson} className="space-y-4">
            <Input
              label="Name *"
              value={newPersonName}
              onChange={setNewPersonName}
              placeholder="Enter full name"
            />

            <Input
              label="Phone"
              value={newPersonPhone}
              onChange={setNewPersonPhone}
              placeholder="e.g., 0712 345 678"
              type="tel"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  ["customer", "supplier", "employee", "other"] as PersonType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewPersonType(type)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors min-h-[48px]",
                      newPersonType === type
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300",
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!newPersonName.trim() || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]"
        />
      </div>

      {/* People List */}
      {filteredPeople.length === 0 ? (
        <Card className="py-12 text-center">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">
            {searchQuery ? "No people found" : "No people yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery
              ? "Try a different search term"
              : "Add your first customer, supplier, or employee"}
          </p>
          {!showAddForm && !searchQuery && (
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPeople.map((person) => (
            <Card
              key={person.id}
              className="flex items-start gap-3"
              onClick={() => {}}
            >
              <div className="shrink-0">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {person.name}
                    </p>
                    {person.phone && (
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        {person.phone}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 text-xs font-medium rounded-full",
                        getTypeColor(person.type),
                      )}
                    >
                      {getTypeLabel(person.type)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-500">
                      {person.transactionCount} transaction
                      {person.transactionCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  {person.creditBalance !== 0 && (
                    <div
                      className={cn(
                        "text-sm font-medium",
                        person.creditBalance > 0
                          ? "text-red-600"
                          : "text-green-600",
                      )}
                    >
                      {person.creditBalance > 0 ? "Owes " : "Credit "}
                      {formatCurrency(Math.abs(person.creditBalance))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
