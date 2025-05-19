import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ServicesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ServicesInput({ value = [], onChange }: ServicesInputProps) {
  const [newService, setNewService] = useState("");

  const addService = () => {
    if (newService.trim() && !value.includes(newService.trim())) {
      const updated = [...value, newService.trim()];
      onChange(updated);
      setNewService("");
    }
  };

  const removeService = (serviceToRemove: string) => {
    const updated = value.filter(service => service !== serviceToRemove);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addService();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          placeholder="Oil Change, Tire Rotation, Brake Repair, etc."
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={addService}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((service, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {service}
            <button
              type="button"
              onClick={() => removeService(service)}
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