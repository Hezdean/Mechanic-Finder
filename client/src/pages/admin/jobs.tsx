import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Briefcase, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  MapPin,
  User,
  Calendar,
  Eye,
  Ban,
  PlayCircle,
  PauseCircle
} from "lucide-react";

interface Job {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: string;
  budget: number;
  location: string;
  urgency: string;
  createdAt: string;
  assignedMechanicId?: number;
  completedAt?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
  };
}

export default function JobManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch jobs data
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs'],
    refetchInterval: 30000,
  });

  // Fetch users for job assignment
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: user?.role === 'admin',
  });

  // Fetch mechanics for assignment
  const { data: mechanics = [] } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
    enabled: user?.role === 'admin',
  });

  // Filter jobs
  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || job.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<Job> }) =>
      apiRequest(`/api/jobs/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setIsEditDialogOpen(false);
      setEditingJob(null);
      toast({
        title: "Job updated",
        description: "Job has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update job.",
        variant: "destructive",
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: number) =>
      apiRequest(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);
      toast({
        title: "Job deleted",
        description: "Job has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete job.",
        variant: "destructive",
      });
    },
  });

  // Admin action mutations
  const adminActionMutation = useMutation({
    mutationFn: (data: { jobId: number; action: string; mechanicId?: number }) =>
      apiRequest(`/api/admin/jobs/${data.jobId}/${data.action}`, {
        method: 'POST',
        body: JSON.stringify({ mechanicId: data.mechanicId })
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Action completed",
        description: `Job ${variables.action} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Action failed",
        description: error.message || "Failed to perform action.",
        variant: "destructive",
      });
    },
  });

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsEditDialogOpen(true);
  };

  const handleViewJob = (job: Job) => {
    setViewingJob(job);
    setIsViewDialogOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateJob = () => {
    if (!editingJob) return;
    
    updateJobMutation.mutate({
      id: editingJob.id,
      updates: {
        title: editingJob.title,
        description: editingJob.description,
        status: editingJob.status,
        budget: editingJob.budget,
        location: editingJob.location,
        urgency: editingJob.urgency,
        assignedMechanicId: editingJob.assignedMechanicId,
      }
    });
  };

  const handleAdminAction = (jobId: number, action: string, mechanicId?: number) => {
    adminActionMutation.mutate({ jobId, action, mechanicId });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJobStats = () => {
    const total = jobs.length;
    const open = jobs.filter((job: Job) => job.status === 'open').length;
    const inProgress = jobs.filter((job: Job) => job.status === 'in_progress').length;
    const completed = jobs.filter((job: Job) => job.status === 'completed').length;
    const cancelled = jobs.filter((job: Job) => job.status === 'cancelled').length;
    const totalValue = jobs.reduce((sum: number, job: Job) => sum + (job.budget || 0), 0);
    
    return { total, open, inProgress, completed, cancelled, totalValue };
  };

  const stats = getJobStats();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Job Management - Admin Dashboard</title>
        <meta name="description" content="Manage platform jobs, assignments, and oversight" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Management</h1>
          <p className="text-muted-foreground">Oversee all platform jobs and assignments</p>
        </div>

        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.open}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">${stats.totalValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Directory
            </CardTitle>
            <CardDescription>
              Search, filter, and manage all platform jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jobs Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job: Job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {job.description}
                            </div>
                            {job.vehicleInfo && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {job.vehicleInfo.year} {job.vehicleInfo.make} {job.vehicleInfo.model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.budget?.toLocaleString() || 'Not set'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUrgencyBadgeColor(job.urgency)}>
                            {job.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewJob(job)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditJob(job)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {job.status === 'open' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdminAction(job.id, 'suspend')}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <PauseCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Job Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>
                Complete job information and management options
              </DialogDescription>
            </DialogHeader>
            {viewingJob && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusBadgeColor(viewingJob.status)}>
                        {viewingJob.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Urgency</label>
                    <div className="mt-1">
                      <Badge className={getUrgencyBadgeColor(viewingJob.urgency)}>
                        {viewingJob.urgency}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <div className="mt-1 font-medium">{viewingJob.title}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="mt-1 text-sm">{viewingJob.description}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget</label>
                    <div className="mt-1 font-medium">${viewingJob.budget?.toLocaleString() || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <div className="mt-1">{viewingJob.location}</div>
                  </div>
                </div>

                {viewingJob.vehicleInfo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                    <div className="mt-1">
                      {viewingJob.vehicleInfo.year} {viewingJob.vehicleInfo.make} {viewingJob.vehicleInfo.model}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="mt-1">{new Date(viewingJob.createdAt).toLocaleString()}</div>
                  </div>
                  {viewingJob.completedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completed</label>
                      <div className="mt-1">{new Date(viewingJob.completedAt).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Admin Actions</label>
                  <div className="flex gap-2 mt-2">
                    {viewingJob.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdminAction(viewingJob.id, 'suspend')}
                      >
                        <PauseCircle className="h-3 w-3 mr-1" />
                        Suspend
                      </Button>
                    )}
                    {viewingJob.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdminAction(viewingJob.id, 'activate')}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Activate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAdminAction(viewingJob.id, 'priority')}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Mark Priority
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (viewingJob) handleEditJob(viewingJob);
              }}>
                Edit Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update job details and assignment
              </DialogDescription>
            </DialogHeader>
            {editingJob && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editingJob.title}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, title: e.target.value })
                    }
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingJob.description}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={editingJob.status}
                      onValueChange={(value) =>
                        setEditingJob({ ...editingJob, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Urgency</label>
                    <Select
                      value={editingJob.urgency}
                      onValueChange={(value) =>
                        setEditingJob({ ...editingJob, urgency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Budget</label>
                    <Input
                      type="number"
                      value={editingJob.budget || ''}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, budget: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={editingJob.location}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Assigned Mechanic</label>
                  <Select
                    value={editingJob.assignedMechanicId?.toString() || ""}
                    onValueChange={(value) =>
                      setEditingJob({ 
                        ...editingJob, 
                        assignedMechanicId: value ? parseInt(value) : undefined 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mechanic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {mechanics.map((mechanic: any) => (
                        <SelectItem key={mechanic.userId} value={mechanic.userId.toString()}>
                          Mechanic #{mechanic.userId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateJob}
                disabled={updateJobMutation.isPending}
              >
                {updateJobMutation.isPending ? "Updating..." : "Update Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Job Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{jobToDelete?.title}"? 
                This action cannot be undone and will permanently remove all job data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => jobToDelete && deleteJobMutation.mutate(jobToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending ? "Deleting..." : "Delete Job"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}