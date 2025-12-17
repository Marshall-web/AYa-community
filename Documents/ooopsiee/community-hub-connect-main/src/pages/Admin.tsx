import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Radio, DollarSign, Users, User, Settings, LogOut, Eye, Edit,
  Trash2, Plus, TrendingUp, TrendingDown, ShoppingBag, Home,
  Lock, LayoutDashboard, Calendar, Utensils, Waves
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Admin Login Component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated admin check - replace with real auth
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        onLogin();
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your username and password.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-accent-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Access</CardTitle>
          <p className="text-muted-foreground">Enter your credentials to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-username"
                  placeholder="Enter username"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" variant="gold" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for various sections
  const [bookings, setBookings] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [adRequests, setAdRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    siteName: "Community Hub Connect",
    maintenanceMode: false,
    emailNotifications: true,
  });

  // New Menu Item State
  const [newMenuItem, setNewMenuItem] = useState({ name: "", category: "", price: "", status: "Available" });
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // New Order State
  const [newOrder, setNewOrder] = useState({ customer: "", items: "", total: "", status: "Pending" });
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Edit Menu Item State
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);


  const { toast } = useToast();
  const [todayRevenue, setTodayRevenue] = useState(0);

  useEffect(() => {
    fetchData();

    // Set up polling to refresh data every 15 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, menuRes, ordersRes, adsRes, usersRes, settingsRes, revenueRes] = await Promise.all([
        api.get('bookings/'),
        api.get('menu-items/'),
        api.get('orders/'),
        api.get('ad-requests/'),
        api.get('users/'),
        api.get('settings/'),
        api.get('orders/today_revenue/')
      ]);

      setBookings(bookingsRes.data);
      setMenuItems(menuRes.data);
      setOrders(ordersRes.data);
      setAdRequests(adsRes.data);
      setUsers(usersRes.data);
      setTodayRevenue(revenueRes.data.total);
      if (settingsRes.data.length > 0) {
        const s = settingsRes.data[0];
        setSettings({
          id: s.id,
          siteName: s.site_name,
          maintenanceMode: s.maintenance_mode,
          emailNotifications: s.email_notifications
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to load data from server", variant: "destructive" });
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "menu", label: "Menu & Orders", icon: Utensils },
    { id: "pool", label: "Pool Sessions", icon: Waves },
    { id: "events", label: "Events", icon: Calendar },
    { id: "radio", label: "Radio & Ads", icon: Radio },
    { id: "users", label: "Users", icon: Users },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { label: "Today's Revenue", value: `₵${todayRevenue.toLocaleString()}`, change: "+12%", trend: "up", icon: DollarSign },
    { label: "Total Bookings", value: bookings.length.toString(), change: "+8%", trend: "up", icon: Calendar },
    { label: "Food Orders", value: orders.length.toString(), change: "-3%", trend: "down", icon: ShoppingBag },
    { label: "Active Users", value: users.length.toString(), change: "+5%", trend: "up", icon: Users },
  ];



  // Handlers
  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.patch(`bookings/${id}/`, { status });
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast({ title: "Booking Updated", description: `Booking ${id} marked as ${status}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update booking", variant: "destructive" });
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await api.delete(`bookings/${id}/`);
      setBookings(bookings.filter(b => b.id !== id));
      toast({ title: "Booking Deleted", description: "Booking has been removed" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({ title: "Error", description: "Failed to delete booking", variant: "destructive" });
    }
  };

  const updateAdStatus = async (id: string, status: string) => {
    try {
      await api.patch(`ad-requests/${id}/`, { status });
      setAdRequests(adRequests.map(a => a.id === id ? { ...a, status } : a));
      toast({ title: "Ad Updated", description: `Ad request ${id} marked as ${status}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update ad request", variant: "destructive" });
    }
  };

  const deleteMenuItem = async (id: number) => {
    try {
      await api.delete(`menu-items/${id}/`);
      setMenuItems(menuItems.filter(m => m.id !== id));
      fetchData();
      toast({ title: "Menu Item Deleted", description: "Item removed from menu" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    }
  };

  const [newMenuItemImage, setNewMenuItemImage] = useState<File | null>(null);

  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append('name', newMenuItem.name);
    formData.append('category', newMenuItem.category || "General");
    formData.append('price', newMenuItem.price);
    formData.append('status', newMenuItem.status);
    if (newMenuItemImage) {
      formData.append('image', newMenuItemImage);
    }

    try {
      const response = await api.post('menu-items/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMenuItems([...menuItems, response.data]);
      setNewMenuItem({ name: "", category: "", price: "", status: "Available" });
      setNewMenuItemImage(null);
      setIsAddMenuOpen(false);
      fetchData();
      toast({ title: "Success", description: "Menu item added successfully" });
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast({ title: "Error", description: "Failed to add menu item", variant: "destructive" });
    }
  };

  const handleUpdateMenuItem = async () => {
    if (!editingMenuItem || !editingMenuItem.name || !editingMenuItem.price) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append('name', editingMenuItem.name);
    formData.append('category', editingMenuItem.category);
    formData.append('price', editingMenuItem.price);
    formData.append('status', editingMenuItem.status);
    if (editingMenuItem.image instanceof File) {
      formData.append('image', editingMenuItem.image);
    }

    try {
      console.log("Updating menu item:", editingMenuItem);
      const response = await api.patch(`menu-items/${editingMenuItem.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMenuItems(menuItems.map(m => m.id === editingMenuItem.id ? response.data : m));
      setEditingMenuItem(null);
      setIsEditMenuOpen(false);
      fetchData();
      toast({ title: "Success", description: "Menu item updated successfully" });
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast({ title: "Error", description: "Failed to update menu item", variant: "destructive" });
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.patch(`orders/${id}/`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      toast({ title: "Order Updated", description: `Order ${id} marked as ${status}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await api.delete(`orders/${id}/`);
      setOrders(orders.filter(o => o.id !== id));
      toast({ title: "Order Deleted", description: "Order has been removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" });
    }
  };

  const handleAddOrder = async () => {
    if (!newOrder.customer || !newOrder.items || !newOrder.total) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    try {
      const response = await api.post('orders/', {
        customer_name: newOrder.customer,
        items: newOrder.items,
        total_price: Number(newOrder.total),
        status: newOrder.status
      });
      setOrders([...orders, response.data]);
      setNewOrder({ customer: "", items: "", total: "", status: "Pending" });
      setIsAddOrderOpen(false);
      toast({ title: "Success", description: "Order added successfully" });
    } catch (error) {
      console.error("Error adding order:", error);
      toast({ title: "Error", description: "Failed to add order", variant: "destructive" });
    }
  }


  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    try {
      await api.patch(`users/${id}/`, { status: newStatus });
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      toast({ title: "User Updated", description: "User status changed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
    if (!settings.id) return;
    const newValue = !settings[key];

    let backendKey = key;
    if (key === 'siteName') backendKey = 'site_name';
    if (key === 'maintenanceMode') backendKey = 'maintenance_mode';
    if (key === 'emailNotifications') backendKey = 'email_notifications';

    try {
      await api.patch(`settings/${settings.id}/`, { [backendKey]: newValue });
      setSettings(prev => ({ ...prev, [key]: newValue }));
      toast({ title: "Settings Updated", description: `${String(key)} has been toggled` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
      case "active":
      case "available":
      case "ready":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
      case "low stock":
      case "preparing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
      case "unavailable":
      case "suspended":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 hidden lg:flex lg:flex-col">
        <div className="flex items-center gap-3 mb-8 p-2">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-display font-bold">AYA</span>
          </div>
          <div>
            <div className="font-display font-bold">Admin Panel</div>
            <div className="text-xs text-sidebar-foreground/60">Community Center</div>
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeSection === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => window.location.href = "/"}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-all font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>


          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Administrator</p>
          </div>
          <div className="flex gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <SheetHeader className="mb-6">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-display font-bold">AYA</span>
                    </div>
                    <div>
                      <SheetTitle className="font-display font-bold text-left">Admin Panel</SheetTitle>
                      <div className="text-xs text-muted-foreground">Community Center</div>
                    </div>
                  </div>
                </SheetHeader>

                <nav className="space-y-1 mb-8">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeSection === item.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = "/"}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:bg-accent/50 transition-all font-medium"
                  >
                    <Home className="w-5 h-5" />
                    <span>Back to Home</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:bg-accent/50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content based on active section */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveSection("bookings")}>View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No bookings yet</p>
                      <p className="text-sm">New bookings will appear here</p>
                    </div>
                  ) : (
                    bookings.slice(0, 4).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <div className="font-medium">{booking.guest}</div>
                          <div className="text-sm text-muted-foreground">{booking.type} • {booking.date}</div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ad Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Ad Requests</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveSection("radio")}>Manage</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Radio className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No ad requests</p>
                      <p className="text-sm">Ad requests will appear here</p>
                    </div>
                  ) : (
                    adRequests.slice(0, 3).map((ad) => (
                      <div key={ad.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <div className="font-medium">{ad.business}</div>
                          <div className="text-sm text-muted-foreground">{ad.slot} • ₵{ad.cost.toLocaleString()}</div>
                        </div>
                        <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "bookings" && (
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-semibold text-lg">No Bookings Found</p>
                    <p className="text-sm mt-2">There are currently 0 bookings in the system.</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{booking.guest}</div>
                          <div className="text-sm text-muted-foreground">{booking.type} • {booking.date}</div>
                          <div className="text-xs text-muted-foreground mt-1">ID: {booking.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>

                        {booking.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateBookingStatus(booking.id, "Confirmed")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateBookingStatus(booking.id, "Cancelled")}>
                              Reject
                            </Button>
                          </div>
                        )}

                        <Button variant="ghost" size="icon" onClick={() => deleteBooking(booking.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "menu" && (
          <div className="space-y-6">
            <Tabs defaultValue="menu" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="menu">Menu Items</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Menu Items</CardTitle>
                    <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                      <DialogTrigger asChild>
                        <Button variant="gold" size="sm">
                          <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Menu Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input
                              placeholder="e.g. Jollof Rice"
                              value={newMenuItem.name}
                              onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={newMenuItem.category}
                              onValueChange={(val) => setNewMenuItem({ ...newMenuItem, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Starters">Starters</SelectItem>
                                <SelectItem value="Main Course">Main Course</SelectItem>
                                <SelectItem value="Grills">Grills</SelectItem>
                                <SelectItem value="Drinks">Drinks</SelectItem>
                                <SelectItem value="Desserts">Desserts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Price (₵)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={newMenuItem.price}
                              onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={newMenuItem.status}
                              onValueChange={(val) => setNewMenuItem({ ...newMenuItem, status: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Low Stock">Low Stock</SelectItem>
                                <SelectItem value="Unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Image</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setNewMenuItemImage(e.target.files ? e.target.files[0] : null)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddMenuOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddMenuItem}>Add Item</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Menu Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input
                              placeholder="e.g. Jollof Rice"
                              value={editingMenuItem?.name || ""}
                              onChange={(e) => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={editingMenuItem?.category || ""}
                              onValueChange={(val) => setEditingMenuItem({ ...editingMenuItem, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Starters">Starters</SelectItem>
                                <SelectItem value="Main Course">Main Course</SelectItem>
                                <SelectItem value="Grills">Grills</SelectItem>
                                <SelectItem value="Drinks">Drinks</SelectItem>
                                <SelectItem value="Desserts">Desserts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Price (₵)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={editingMenuItem?.price || ""}
                              onChange={(e) => setEditingMenuItem({ ...editingMenuItem, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={editingMenuItem?.status || "Available"}
                              onValueChange={(val) => setEditingMenuItem({ ...editingMenuItem, status: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Low Stock">Low Stock</SelectItem>
                                <SelectItem value="Unavailable">Unavailable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Image</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditingMenuItem({ ...editingMenuItem, image: e.target.files ? e.target.files[0] : null })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditMenuOpen(false)}>Cancel</Button>
                          <Button onClick={handleUpdateMenuItem}>Update Item</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {menuItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Utensils className="w-16 h-16 mx-auto mb-4 opacity-10" />
                          <p className="font-semibold text-lg">No Menu Items</p>
                          <p className="text-sm mt-2">Click "Add Item" to create your first menu item.</p>
                        </div>
                      ) : (
                        menuItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                                🍽️
                              </div>
                              <div>
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-sm text-muted-foreground">{item.category}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold">₵{item.price.toLocaleString()}</div>
                                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingMenuItem(item); setIsEditMenuOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteMenuItem(item.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Food Orders</CardTitle>
                    <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
                      <DialogTrigger asChild>
                        <Button variant="gold" size="sm">
                          <Plus className="w-4 h-4 mr-2" /> New Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Order</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Customer Name</Label>
                            <Input
                              placeholder="e.g. John Doe"
                              value={newOrder.customer}
                              onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Items</Label>
                            <Input
                              placeholder="e.g. 2x Jollof, 1x Water"
                              value={newOrder.items}
                              onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total Amount (₵)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={newOrder.total}
                              onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddOrderOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddOrder}>Create Order</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-10" />
                          <p className="font-semibold text-lg">No Orders Yet</p>
                          <p className="text-sm mt-2">Food orders will appear here once customers place them.</p>
                        </div>
                      ) : (
                        orders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold">{order.customer}</div>
                                <div className="text-sm text-muted-foreground">{order.items}</div>
                                <div className="text-xs text-muted-foreground mt-1">ID: {order.id} • ₵{order.total}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>

                              <div className="flex gap-1">
                                {order.status === "Pending" && (
                                  <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "Preparing")}>
                                    Start
                                  </Button>
                                )}
                                {order.status === "Preparing" && (
                                  <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "Ready")}>
                                    Ready
                                  </Button>
                                )}
                                {order.status === "Ready" && (
                                  <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateOrderStatus(order.id, "Completed")}>
                                    Complete
                                  </Button>
                                )}

                                <Button variant="ghost" size="icon" onClick={() => deleteOrder(order.id)}>
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )
        }

        {
          activeSection === "users" && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
                      <p className="font-semibold text-lg">No Users Found</p>
                      <p className="text-sm mt-2">User accounts will appear here once registered.</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{user.first_name || user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          <Button
                            variant={user.status === "Active" ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === "Active" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === "radio" && (
            <Card>
              <CardHeader>
                <CardTitle>Radio Ad Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adRequests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Radio className="w-16 h-16 mx-auto mb-4 opacity-10" />
                      <p className="font-semibold text-lg">No Ad Requests</p>
                      <p className="text-sm mt-2">Radio ad requests will be shown here.</p>
                    </div>
                  ) : (
                    adRequests.map((ad) => (
                      <div key={ad.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gold flex items-center justify-center">
                            <Radio className="w-6 h-6 text-brown-900" />
                          </div>
                          <div>
                            <div className="font-semibold">{ad.business}</div>
                            <div className="text-sm text-muted-foreground">{ad.slot}</div>
                            <div className="text-xs text-muted-foreground mt-1">Cost: ₵{ad.cost}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                          {ad.status === "Pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => updateAdStatus(ad.id, "Active")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => updateAdStatus(ad.id, "Rejected")}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )
        }

        {
          activeSection === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <div className="font-semibold">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">Disable public access to the site</div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-primary' : 'bg-muted'}`}
                    onClick={() => toggleSetting('maintenanceMode')}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : ''}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <div className="font-semibold">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive emails for new bookings</div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                    onClick={() => toggleSetting('emailNotifications')}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : ''}`} />
                  </div>
                </div>

                <div className="pt-4">
                  <Label>Site Name</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={settings.siteName} readOnly />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Fallback for other sections */}
        {
          ["payments", "pool", "events"].includes(activeSection) && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  {sidebarItems.find(i => i.id === activeSection)?.label}
                </h3>
                <p className="text-muted-foreground">
                  This section is under construction.
                </p>
              </CardContent>
            </Card>
          )
        }
      </main >
    </div >
  );
}

// Main Admin Page Component
export default function Admin() {
  const { user, logout } = useAuth();

  // Extra check: if not admin, show unauthorized or redirect (though ProtectedRoute handles basic login)
  // For now, we'll just show the dashboard but maybe with a warning if not role='admin'
  // Ideally ProtectedRoute should accept a 'role' prop

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Button onClick={logout}>Logout</Button>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}
