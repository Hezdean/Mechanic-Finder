import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  User,
  Clock,
  MessageCircle,
  ChevronRight,
  Car,
  Info,
} from "lucide-react";
import { getFullName, getTimeAgo } from "@/lib/utils";

interface Conversation {
  userId: number;
  name: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  role: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  jobId?: number | null;
  sender?: any;
  receiver?: any;
}

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [jobContext, setJobContext] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [location] = useLocation();
  // Parse URL params for pre-selecting a conversation
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const conversationUserId = searchParams.get('conversation');
  const jobId = searchParams.get('jobId');

  // Set initial selected conversation from URL params
  useEffect(() => {
    if (conversationUserId) {
      setSelectedConversation(parseInt(conversationUserId));
    }
    
    if (jobId) {
      setJobContext(parseInt(jobId));
    }
  }, [conversationUserId, jobId]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  // Fetch messages for the current user
  const { data: userMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/messages?userId=${user?.id}`],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch job details if we have a job context
  const { data: jobDetails } = useQuery({
    queryKey: [`/api/jobs/${jobContext}`],
    enabled: !!jobContext,
  });

  // Fetch current conversation messages
  const { data: conversationMessages, isLoading: isLoadingConversation } = useQuery({
    queryKey: [`/api/messages?conversation=${selectedConversation}`],
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/messages', data),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages?conversation=${selectedConversation}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/messages?userId=${user?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => apiRequest('PUT', `/api/messages/${messageId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages?userId=${user?.id}`] });
    },
  });

  // Process messages into conversations
  const conversations: Conversation[] = [];
  const processedUserIds = new Set<number>();

  if (userMessages?.length) {
    userMessages.forEach((msg: Message) => {
      const otherUserId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
      
      // Skip if we've already processed this user
      if (processedUserIds.has(otherUserId)) return;
      processedUserIds.add(otherUserId);
      
      const otherUser = msg.senderId === user?.id ? msg.receiver : msg.sender;
      if (!otherUser) return;

      const unreadMessages = userMessages.filter(
        (m: Message) => m.senderId === otherUserId && m.receiverId === user?.id && !m.isRead
      );

      // Find the latest message with this user
      const latestMessage = userMessages
        .filter((m: Message) => 
          (m.senderId === user?.id && m.receiverId === otherUserId) || 
          (m.senderId === otherUserId && m.receiverId === user?.id)
        )
        .sort((a: Message, b: Message) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      conversations.push({
        userId: otherUserId,
        name: getFullName(otherUser.firstName, otherUser.lastName),
        profilePicture: otherUser.profilePicture,
        lastMessage: latestMessage?.content,
        lastMessageTime: latestMessage?.createdAt,
        unreadCount: unreadMessages.length,
        role: otherUser.role,
      });
    });
  }

  // Sort conversations by latest message
  conversations.sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedConversation && conversationMessages?.length) {
      conversationMessages.forEach((msg: Message) => {
        if (msg.senderId === selectedConversation && msg.receiverId === user?.id && !msg.isRead) {
          markAsReadMutation.mutate(msg.id);
        }
      });
    }
  }, [selectedConversation, conversationMessages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;
    
    const messageData = {
      senderId: user!.id,
      receiverId: selectedConversation,
      content: message.trim(),
      jobId: jobContext,
    };
    
    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Generate Avatar fallback
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2);
  };

  // Get conversation partner details for selected conversation
  const selectedConversationDetails = conversations.find(
    c => c.userId === selectedConversation
  );

  return (
    <>
      <Helmet>
        <title>Messages - Same-Shit Auto Repairs</title>
        <meta name="description" content="Communicate with mechanics or car owners about your auto repair needs." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with mechanics and car owners about repairs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-primary-500" />
                  Conversations
                </CardTitle>
                <CardDescription>
                  Your message threads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {isLoadingMessages ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center p-3 animate-pulse">
                          <div className="w-10 h-10 bg-neutral-200 rounded-full mr-3" />
                          <div className="flex-1">
                            <div className="h-4 bg-neutral-200 rounded w-24 mb-2" />
                            <div className="h-3 bg-neutral-200 rounded w-40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-1">
                      {conversations.map((conversation) => (
                        <button
                          key={conversation.userId}
                          className={`w-full text-left p-3 rounded-lg flex items-center hover:bg-neutral-100 transition-colors ${
                            selectedConversation === conversation.userId ? 'bg-neutral-100' : ''
                          }`}
                          onClick={() => setSelectedConversation(conversation.userId)}
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage 
                              src={conversation.profilePicture} 
                              alt={conversation.name} 
                            />
                            <AvatarFallback className={
                              conversation.role === 'mechanic' 
                                ? 'bg-primary-100 text-primary-800'
                                : conversation.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }>
                              {getInitials(conversation.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">
                                {conversation.name}
                              </h3>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-neutral-500">
                                  {getTimeAgo(conversation.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-500 truncate">
                                {conversation.lastMessage || "No messages yet"}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="ml-2 bg-primary-500">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-400 ml-2" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto h-12 w-12 text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">No conversations yet</h3>
                      <p className="mt-2 text-neutral-500">
                        Your message threads will appear here.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Conversation */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                {selectedConversationDetails ? (
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage 
                        src={selectedConversationDetails.profilePicture} 
                        alt={selectedConversationDetails.name} 
                      />
                      <AvatarFallback className={
                        selectedConversationDetails.role === 'mechanic' 
                          ? 'bg-primary-100 text-primary-800'
                          : selectedConversationDetails.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }>
                        {getInitials(selectedConversationDetails.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedConversationDetails.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {selectedConversationDetails.role}
                      </CardDescription>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      Select a conversation to start messaging
                    </CardDescription>
                  </>
                )}
              </CardHeader>

              {jobContext && jobDetails && (
                <div className="px-6 py-3 bg-blue-50 border-y border-blue-100 flex items-center">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-700">
                      Messaging about job: <span className="font-semibold">{jobDetails.title}</span>
                    </p>
                  </div>
                  <Link to={`/jobs/${jobContext}`}>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                      <Car className="h-4 w-4 mr-1" />
                      View Job
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="flex-1 overflow-hidden">
                {selectedConversation ? (
                  <ScrollArea className="h-[400px] px-6">
                    {isLoadingConversation ? (
                      <div className="py-8 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}
                          >
                            <div className={`${i % 2 === 0 ? 'bg-primary-100' : 'bg-neutral-100'} rounded-lg p-3 max-w-[80%] animate-pulse`}>
                              <div className="h-4 bg-neutral-200 rounded w-40 mb-2" />
                              <div className="h-3 bg-neutral-200 rounded w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : conversationMessages?.length ? (
                      <div className="py-8 space-y-4">
                        {conversationMessages.map((msg: Message) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : ''}`}
                          >
                            <div 
                              className={`${
                                msg.senderId === user?.id 
                                  ? 'bg-primary-100 text-primary-900' 
                                  : 'bg-neutral-100'
                              } rounded-lg p-3 max-w-[80%]`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className="flex items-center mt-1 text-xs text-neutral-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {getTimeAgo(msg.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center py-8">
                        <div className="text-center">
                          <MessageCircle className="mx-auto h-12 w-12 text-neutral-400" />
                          <h3 className="mt-4 text-lg font-medium">No messages yet</h3>
                          <p className="mt-2 text-neutral-500">
                            Start a conversation with {selectedConversationDetails?.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6">
                      <User className="mx-auto h-12 w-12 text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">Select a conversation</h3>
                      <p className="mt-2 text-neutral-500">
                        Choose a conversation from the list to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedConversation && (
                <div className="p-4 border-t">
                  <div className="flex">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="mr-2"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
