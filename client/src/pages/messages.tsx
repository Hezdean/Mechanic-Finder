import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, MessageSquare, User } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  jobId?: number;
  isEmergencyAlert?: boolean;
  sender?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  job?: {
    id: number;
    title: string;
    location: string;
    isEmergency: boolean;
    urgencyLevel: string;
  };
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <p className="text-muted-foreground mb-8">Please log in to view your messages.</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Loading your messages...</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const emergencyMessages = messages.filter((msg: Message) => msg.isEmergencyAlert);
  const regularMessages = messages.filter((msg: Message) => !msg.isEmergencyAlert);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">View your conversations and emergency alerts</p>
        </div>

        {/* Emergency Alerts Section */}
        {emergencyMessages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground">Emergency Alerts</h2>
              <Badge variant="destructive">{emergencyMessages.length}</Badge>
            </div>
            <div className="space-y-4">
              {emergencyMessages.map((message: Message) => (
                <Card key={message.id} className="border-destructive/50 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">EMERGENCY ALERT</span>
                        {!message.isRead && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{message.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{message.sender?.firstName} {message.sender?.lastName}</span>
                        </div>
                        {message.job && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{message.job.location}</span>
                          </div>
                        )}
                      </div>
                      {message.jobId && (
                        <Link href={`/jobs/${message.jobId}`}>
                          <Button size="sm" variant="destructive">
                            View Emergency Job
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Messages Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Messages</h2>
            {regularMessages.length > 0 && (
              <Badge variant="secondary">{regularMessages.length}</Badge>
            )}
          </div>
          
          {regularMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Messages from mechanics and job-related communications will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {regularMessages.map((message: Message) => (
                <Card key={message.id} className={!message.isRead ? "border-primary/50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {message.sender?.firstName} {message.sender?.lastName}
                          </span>
                        </div>
                        {!message.isRead && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{message.content}</p>
                    
                    {message.job && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          Related to: {message.job.title}
                        </div>
                        <Link href={`/jobs/${message.jobId}`}>
                          <Button size="sm" variant="outline">
                            View Job
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {messages.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Emergency alerts and messages from mechanics will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}