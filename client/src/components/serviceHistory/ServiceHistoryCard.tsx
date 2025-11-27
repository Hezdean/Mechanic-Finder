import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  Download,
  Shield,
  Wrench
} from "lucide-react";
import { format } from "date-fns";

interface ServiceRecord {
  id: number;
  serviceType: string;
  description: string;
  mechanicName: string;
  partsUsed: string[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  invoiceUrl?: string;
  warrantyExpiry?: string;
  createdAt: string;
}

interface ServiceHistoryCardProps {
  record: ServiceRecord;
}

export default function ServiceHistoryCard({ record }: ServiceHistoryCardProps) {
  const hasActiveWarranty = record.warrantyExpiry && new Date(record.warrantyExpiry) > new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{record.serviceType}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-neutral-600">
              <Calendar className="h-4 w-4" />
              {format(new Date(record.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              MK {record.totalCost.toFixed(2)}
            </div>
            {hasActiveWarranty && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                <Shield className="h-3 w-3 mr-1" />
                Under Warranty
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-neutral-700">{record.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-neutral-500" />
          <span className="font-medium">Mechanic:</span>
          <span>{record.mechanicName}</span>
        </div>

        {record.partsUsed && record.partsUsed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Wrench className="h-4 w-4 text-neutral-500" />
              Parts Used:
            </div>
            <div className="flex flex-wrap gap-1">
              {record.partsUsed.map((part, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {part}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
          <div className="text-sm">
            <span className="text-neutral-500">Labor:</span>
            <span className="ml-2 font-medium">MK {record.laborCost.toFixed(2)}</span>
          </div>
          <div className="text-sm">
            <span className="text-neutral-500">Parts:</span>
            <span className="ml-2 font-medium">MK {record.partsCost.toFixed(2)}</span>
          </div>
        </div>

        {record.warrantyExpiry && (
          <div className="text-sm">
            <span className="text-neutral-500">Warranty until:</span>
            <span className="ml-2 font-medium">
              {format(new Date(record.warrantyExpiry), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {record.invoiceUrl && (
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}