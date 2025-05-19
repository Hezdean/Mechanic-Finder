import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CertificationsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CertificationsInput({ value = [], onChange }: CertificationsInputProps) {
  const [newCertification, setNewCertification] = useState("");

  const addCertification = () => {
    if (newCertification.trim() && !value.includes(newCertification.trim())) {
      const updated = [...value, newCertification.trim()];
      onChange(updated);
      setNewCertification("");
    }
  };

  const removeCertification = (certToRemove: string) => {
    const updated = value.filter(cert => cert !== certToRemove);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCertification();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newCertification}
          onChange={(e) => setNewCertification(e.target.value)}
          placeholder="ASE Master Technician, BMW Certified, etc."
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={addCertification}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((cert, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {cert}
            <button
              type="button"
              onClick={() => removeCertification(cert)}
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