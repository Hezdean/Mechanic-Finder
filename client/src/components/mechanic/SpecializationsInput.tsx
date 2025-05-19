import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SpecializationsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SpecializationsInput({ value = [], onChange }: SpecializationsInputProps) {
  const [newSpecialization, setNewSpecialization] = useState("");

  const addSpecialization = () => {
    if (newSpecialization.trim() && !value.includes(newSpecialization.trim())) {
      const updated = [...value, newSpecialization.trim()];
      onChange(updated);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (specToRemove: string) => {
    const updated = value.filter(spec => spec !== specToRemove);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSpecialization();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newSpecialization}
          onChange={(e) => setNewSpecialization(e.target.value)}
          placeholder="Engine Repair, Brake Systems, Electrical Systems, etc."
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={addSpecialization}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((spec, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {spec}
            <button
              type="button"
              onClick={() => removeSpecialization(spec)}
              className="ml-1 rounded-full hover:bg-neutral-200 focus:outline-none p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}