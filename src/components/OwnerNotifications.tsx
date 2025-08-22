import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Clock,
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { dashboardAPI } from '@/services/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

const OwnerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter, unreadOnly]);

  // Handle escape key to close notification dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedNotification) {
        setShowDetailsDialog(false);
        setSelectedNotification(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedNotification]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (unreadOnly) params.unreadOnly = 'true';

      const response = await dashboardAPI.getOwnerNotifications(params);
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch notifications',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch notifications',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await dashboardAPI.markNotificationAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        ));
        
        toast({
          title: "Success",
          description: "Notification marked as read",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to mark notification as read',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to mark notification as read',
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await dashboardAPI.markAllNotificationsAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        
        toast({
          title: "Success",
          description: response.message || 'All notifications marked as read',
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to mark all notifications as read',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to mark all notifications as read',
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await dashboardAPI.deleteNotification(notificationId);
      
      if (response.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to delete notification',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete notification',
        variant: "destructive"
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="default">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'application':
      case 'job_application':
      case 'internship_application':
      case 'application_received':
        return <Eye className="h-4 w-4" />;
      case 'order':
        return <CheckCircle className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notif => 
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{notifications.length} total</Badge>
          <Badge variant="default">{unreadCount} unread</Badge>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="application">Applications</SelectItem>
              <SelectItem value="job_application">Job Applications</SelectItem>
              <SelectItem value="internship_application">Internship Applications</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={unreadOnly ? 'true' : 'false'} onValueChange={(value) => setUnreadOnly(value === 'true')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">All</SelectItem>
              <SelectItem value="true">Unread Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {notifications.length === 0 ? 'No notifications yet' : 'No notifications found'}
            </h3>
            <p className="text-gray-500 text-center">
              {notifications.length === 0 
                ? 'You\'ll receive notifications here when there are updates about your opportunities, orders, or system events.'
                : 'Try adjusting your search criteria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`p-4 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 ${!notification.isRead ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'}`}
              onClick={() => {
                setSelectedNotification(notification);
                setShowDetailsDialog(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(notification.type)}
                    <span className="font-medium">{notification.title}</span>
                    {getPriorityBadge(notification.priority)}
                    {!notification.isRead && (
                      <Badge variant="default" className="ml-2">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <p className="text-xs text-blue-600 font-medium">Click to view details</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    {notification.readAt && (
                      <span>Read: {format(new Date(notification.readAt), 'MMM dd, yyyy HH:mm')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNotification(notification);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Details Dialog */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowDetailsDialog(false);
            setSelectedNotification(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notification Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDetailsDialog(false);
                  setSelectedNotification(null);
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="font-medium">{selectedNotification.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="text-sm">{selectedNotification.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm capitalize">{selectedNotification.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <div className="mt-1">{getPriorityBadge(selectedNotification.priority)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{format(new Date(selectedNotification.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{selectedNotification.isRead ? 'Read' : 'Unread'}</p>
                </div>
              </div>
              
              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Data</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedNotification.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              {!selectedNotification.isRead && (
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification._id);
                    setShowDetailsDialog(false);
                    setSelectedNotification(null);
                  }}
                  className="flex-1"
                >
                  Mark as Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsDialog(false);
                  setSelectedNotification(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerNotifications;
