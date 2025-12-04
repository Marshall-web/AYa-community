import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, User, LayoutDashboard, Utensils, Waves, Calendar,
  Radio, DollarSign, Users, Settings, LogOut, Eye, Edit,
  Trash2, Plus, TrendingUp, TrendingDown, ShoppingBag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
            Demo: username "admin" / password "admin123"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState("overview");
  // State for various sections
  const [bookings, setBookings] = useState([
    { id: "BK-201", type: "Restaurant", guest: "Kwame Mensah", date: "Today, 7PM", status: "Confirmed" },
    { id: "BK-202", type: "Pool", guest: "Akosua Boateng", date: "Today, 10AM", status: "Completed" },
    { id: "BK-203", type: "Event Hall", guest: "Yaw Owusu", date: "Dec 15", status: "Pending" },
    { id: "BK-204", type: "Restaurant", guest: "Ama Serwaa", date: "Today, 8PM", status: "Confirmed" },
  ]);

  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Jollof Rice Supreme", category: "Main Course", price: 35, status: "Available" },
    { id: 2, name: "Light Soup", category: "Starters", price: 25, status: "Available" },
    { id: 3, name: "Kebab Platter", category: "Grills", price: 40, status: "Low Stock" },
    { id: 4, name: "Fufu & Goat Soup", category: "Main Course", price: 45, status: "Available" },
  ]);

  const [adRequests, setAdRequests] = useState([
    { id: "AD-201", business: "Accra Motors", slot: "Morning Prime", status: "Pending", cost: 750 },
    { id: "AD-202", business: "Kumasi Fashion", slot: "Evening Prime", status: "Active", cost: 600 },
    { id: "AD-203", business: "Tech Store GH", slot: "Midday", status: "Completed", cost: 400 },
  ]);

  const [users, setUsers] = useState([
    { id: "USR-001", name: "Kwame Mensah", email: "kwame@example.com", role: "User", status: "Active" },
    { id: "USR-002", name: "Akosua Boateng", email: "akosua@example.com", role: "User", status: "Active" },
    { id: "USR-003", name: "Yaw Owusu", email: "yaw@example.com", role: "User", status: "Suspended" },
  ]);

  const [settings, setSettings] = useState({
    siteName: "Community Hub Connect",
    maintenanceMode: false,
    emailNotifications: true,
  });

  const { toast } = useToast();

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
    { label: "Today's Revenue", value: "₵2,850", change: "+12%", trend: "up", icon: DollarSign },
    { label: "Total Bookings", value: bookings.length.toString(), change: "+8%", trend: "up", icon: Calendar },
    { label: "Food Orders", value: "12", change: "-3%", trend: "down", icon: ShoppingBag },
    { label: "Active Users", value: users.length.toString(), change: "+5%", trend: "up", icon: Users },
  ];



  // Handlers
  const updateBookingStatus = (id: string, status: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    toast({ title: "Booking Updated", description: `Booking ${id} marked as ${status}` });
  };

  const deleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
    toast({ title: "Booking Deleted", description: "Booking has been removed" });
  };

  const updateAdStatus = (id: string, status: string) => {
    setAdRequests(adRequests.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: "Ad Updated", description: `Ad request ${id} marked as ${status}` });
  };

  const deleteMenuItem = (id: number) => {
    setMenuItems(menuItems.filter(m => m.id !== id));
    toast({ title: "Menu Item Deleted", description: "Item removed from menu" });
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
    toast({ title: "User Updated", description: "User status changed" });
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Settings Updated", description: `${key} has been toggled` });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
      case "active":
      case "available":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
      case "low stock":
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
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 hidden lg:block">
        <div className="flex items-center gap-3 mb-8 p-2">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-display font-bold">CC</span>
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

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-8 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
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
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => { }}>
              <LayoutDashboard className="w-4 h-4" />
            </Button>
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
                  {bookings.slice(0, 4).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <div className="font-medium">{booking.guest}</div>
                        <div className="text-sm text-muted-foreground">{booking.type} • {booking.date}</div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                  ))}
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
                  {adRequests.slice(0, 3).map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <div className="font-medium">{ad.business}</div>
                        <div className="text-sm text-muted-foreground">{ad.slot} • ₵{ad.cost.toLocaleString()}</div>
                      </div>
                      <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                    </div>
                  ))}
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
                {bookings.map((booking) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "menu" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Button variant="gold" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuItems.map((item) => (
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
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMenuItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "radio" && (
          <Card>
            <CardHeader>
              <CardTitle>Radio Ad Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adRequests.map((ad) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "settings" && (
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
        )}

        {/* Fallback for other sections */}
        {["payments", "pool", "events"].includes(activeSection) && (
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
        )}
      </main>
    </div>
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
