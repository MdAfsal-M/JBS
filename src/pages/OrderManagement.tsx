import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  AlertTriangle,
  Star,
  User,
  Building,
  ArrowLeft
} from "lucide-react";

interface Order {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  shipByDate: string;
  status: 'pending' | 'unshipped' | 'cancelled' | 'sent';
  amount: number;
  quantity: number;
  priority: 'normal' | 'prime' | 'business';
  isLate: boolean;
  isVergeOfCancellation: boolean;
  productImage?: string;
}

const OrderManagement = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'unshipped' | 'cancelled' | 'sent'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('shipByDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayLimit, setDisplayLimit] = useState(15);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock order data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      productName: "Wireless Earbuds Pro",
      customerName: "Rahul Sharma",
      customerEmail: "rahul@email.com",
      orderDate: "2024-01-15",
      shipByDate: "2024-01-18",
      status: "pending",
      amount: 2999,
      quantity: 1,
      priority: "normal",
      isLate: false,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400"
    },
    {
      id: "ORD-002",
      productName: "LED Study Desk Lamp",
      customerName: "Priya Patel",
      customerEmail: "priya@email.com",
      orderDate: "2024-01-14",
      shipByDate: "2024-01-17",
      status: "unshipped",
      amount: 1299,
      quantity: 2,
      priority: "prime",
      isLate: true,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    {
      id: "ORD-003",
      productName: "Premium Laptop Backpack",
      customerName: "Amit Kumar",
      customerEmail: "amit@email.com",
      orderDate: "2024-01-13",
      shipByDate: "2024-01-16",
      status: "cancelled",
      amount: 1999,
      quantity: 1,
      priority: "business",
      isLate: false,
      isVergeOfCancellation: true,
      productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
    },
    {
      id: "ORD-004",
      productName: "Smart Fitness Watch",
      customerName: "Sneha Singh",
      customerEmail: "sneha@email.com",
      orderDate: "2024-01-12",
      shipByDate: "2024-01-15",
      status: "sent",
      amount: 3999,
      quantity: 1,
      priority: "prime",
      isLate: false,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
    },
    {
      id: "ORD-005",
      productName: "Bluetooth Keyboard",
      customerName: "Ravi Mehta",
      customerEmail: "ravi@email.com",
      orderDate: "2024-01-11",
      shipByDate: "2024-01-14",
      status: "unshipped",
      amount: 1799,
      quantity: 1,
      priority: "normal",
      isLate: true,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"
    },
    {
      id: "ORD-006",
      productName: "Study Chair Cushion",
      customerName: "Kavya Reddy",
      customerEmail: "kavya@email.com",
      orderDate: "2024-01-10",
      shipByDate: "2024-01-13",
      status: "pending",
      amount: 899,
      quantity: 3,
      priority: "business",
      isLate: false,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
    },
    {
      id: "ORD-007",
      productName: "Wireless Mouse",
      customerName: "Neha Sharma",
      customerEmail: "neha@email.com",
      orderDate: "2024-01-09",
      shipByDate: "2024-01-12",
      status: "sent",
      amount: 1199,
      quantity: 1,
      priority: "normal",
      isLate: false,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"
    },
    {
      id: "ORD-008",
      productName: "USB-C Hub",
      customerName: "Rajesh Verma",
      customerEmail: "rajesh@email.com",
      orderDate: "2024-01-08",
      shipByDate: "2024-01-11",
      status: "unshipped",
      amount: 2299,
      quantity: 1,
      priority: "prime",
      isLate: true,
      isVergeOfCancellation: false,
      productImage: "https://images.unsplash.com/photo-1589739900243-493d3a434c77?w=400"
    }
  ]);

  // Get filtered and sorted orders
  const getFilteredOrders = () => {
    let filtered = orders.filter(order => order.status === activeTab);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const today = new Date();
      const daysAgo = dateRange === '7' ? 7 : 30;
      const cutoffDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= cutoffDate;
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'shipByDate':
          aValue = new Date(a.shipByDate);
          bValue = new Date(b.shipByDate);
          break;
        case 'orderDate':
          aValue = new Date(a.orderDate);
          bValue = new Date(b.orderDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered.slice(0, displayLimit);
  };

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      pending: orders.filter(o => o.status === 'pending').length,
      unshipped: orders.filter(o => o.status === 'unshipped').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      sent: orders.filter(o => o.status === 'sent').length
    };
    return counts;
  };

  // Get quick filter counts
  const getQuickFilterCounts = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      shipByToday: orders.filter(o => o.shipByDate === today && o.status !== 'sent' && o.status !== 'cancelled').length,
      primeUnshipped: orders.filter(o => o.status === 'unshipped' && o.priority === 'prime').length,
      businessUnshipped: orders.filter(o => o.status === 'unshipped' && o.priority === 'business').length,
      vergeOfLate: orders.filter(o => o.isLate && o.status !== 'sent' && o.status !== 'cancelled').length,
      vergeOfCancellation: orders.filter(o => o.isVergeOfCancellation && o.status !== 'cancelled').length
    };
  };

  // Action handlers
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast({
      title: "Status Updated",
      description: `Order ${orderId} status changed to ${newStatus}`,
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'unshipped': return 'outline';
      case 'cancelled': return 'destructive';
      case 'sent': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'unshipped': return <Package className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: Order['priority']) => {
    switch (priority) {
      case 'prime': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'business': return <Building className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const statusCounts = getStatusCounts();
  const quickFilterCounts = getQuickFilterCounts();
  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Order Management</h1>
              <p className="text-muted-foreground">Manage and track all your orders efficiently</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button className="bg-gradient-primary">
              <Package className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b border-border">
              {[
                { key: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
                { key: 'unshipped', label: 'Unshipped', icon: <Package className="h-4 w-4" /> },
                { key: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-4 w-4" /> },
                { key: 'sent', label: 'Sent', icon: <Truck className="h-4 w-4" /> }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200 ${
                    activeTab === key
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {icon}
                  <span className="font-medium">{statusCounts[key as keyof typeof statusCounts]} {label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by Order ID, Product Name, or Customer Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dateRange === '7' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(dateRange === '7' ? 'all' : '7')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Last 7 Days
                </Button>
                <Button
                  variant={dateRange === '30' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(dateRange === '30' ? 'all' : '30')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Last 30 Days
                </Button>
                {quickFilterCounts.shipByToday > 0 && (
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-200">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Ship by Today ({quickFilterCounts.shipByToday})
                  </Button>
                )}
                {quickFilterCounts.primeUnshipped > 0 && (
                  <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200">
                    <Star className="h-4 w-4 mr-1" />
                    Prime Unshipped ({quickFilterCounts.primeUnshipped})
                  </Button>
                )}
                {quickFilterCounts.businessUnshipped > 0 && (
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    <Building className="h-4 w-4 mr-1" />
                    Business Unshipped ({quickFilterCounts.businessUnshipped})
                  </Button>
                )}
                {quickFilterCounts.vergeOfLate > 0 && (
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <Clock className="h-4 w-4 mr-1" />
                    Verge of Late ({quickFilterCounts.vergeOfLate})
                  </Button>
                )}
                {quickFilterCounts.vergeOfCancellation > 0 && (
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <XCircle className="h-4 w-4 mr-1" />
                    Verge of Cancellation ({quickFilterCounts.vergeOfCancellation})
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipByDate">Ship By Date</SelectItem>
                        <SelectItem value="orderDate">Order Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="customerName">Customer Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort Order</label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Limit</label>
                    <Select value={displayLimit.toString()} onValueChange={(value) => setDisplayLimit(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Show 15</SelectItem>
                        <SelectItem value="30">Show 30</SelectItem>
                        <SelectItem value="50">Show 50</SelectItem>
                        <SelectItem value="100">Show 100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7">Last 7 Days</SelectItem>
                        <SelectItem value="30">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {filteredOrders.length} Orders ({activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <SortAsc className="h-4 w-4 mr-1" />
                  Sort
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Ship By Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className={order.isLate ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={order.productImage} 
                          alt={order.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{order.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{order.orderDate}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        {order.shipByDate}
                        {order.isLate && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹{order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(order.priority)}
                        <span className="text-xs capitalize">{order.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Product Information</h4>
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={order.productImage} 
                                      alt={order.productName}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                      <p className="font-medium">{order.productName}</p>
                                      <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                                      <p className="text-sm text-muted-foreground">Amount: ₹{order.amount.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Customer Information</h4>
                                  <p className="text-sm"><strong>Name:</strong> {order.customerName}</p>
                                  <p className="text-sm"><strong>Email:</strong> {order.customerEmail}</p>
                                  <p className="text-sm"><strong>Priority:</strong> {order.priority}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Order Information</h4>
                                  <p className="text-sm"><strong>Order Date:</strong> {order.orderDate}</p>
                                  <p className="text-sm"><strong>Ship By Date:</strong> {order.shipByDate}</p>
                                  <p className="text-sm"><strong>Status:</strong> {order.status}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Actions</h4>
                                  <div className="space-y-2">
                                    {order.status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleStatusChange(order.id, 'unshipped')}
                                        className="w-full"
                                      >
                                        Mark as Unshipped
                                      </Button>
                                    )}
                                    {order.status === 'unshipped' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleStatusChange(order.id, 'sent')}
                                        className="w-full"
                                      >
                                        Mark as Sent
                                      </Button>
                                    )}
                                    {order.status !== 'cancelled' && order.status !== 'sent' && (
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                                        className="w-full"
                                      >
                                        Cancel Order
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderManagement; 