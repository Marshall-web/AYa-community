import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User, Utensils, Waves, Calendar, Radio,
  Clock, MapPin, CreditCard, Settings, LogOut,
  ShoppingBag, Eye, Edit
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const mockOrders = [
  { id: "ORD-001", date: "Nov 28, 2024", items: "Jollof Rice, Kebab Platter", status: "Delivered", total: 75 },
  { id: "ORD-002", date: "Nov 25, 2024", items: "Fufu & Goat Soup, Fried Plantain", status: "Delivered", total: 55 },
  { id: "ORD-003", date: "Nov 20, 2024", items: "Light Soup x2", status: "Delivered", total: 50 },
];

const mockBookings = [
  { id: "BK-001", type: "Restaurant", date: "Dec 5, 2024", time: "7:00 PM", guests: 4, status: "Confirmed" },
  { id: "BK-002", type: "Swimming Pool", date: "Dec 3, 2024", time: "10:00 AM", guests: 2, status: "Confirmed" },
  { id: "BK-003", type: "Event Hall", date: "Dec 25, 2024", time: "All Day", guests: 150, status: "Pending" },
];

const mockAds = [
  { id: "AD-001", business: "Accra Store", slot: "Morning Prime", spots: 5, status: "Active", cost: 750 },
  { id: "AD-002", business: "Kumasi Store", slot: "Evening Prime", spots: 3, status: "Pending Review", cost: 360 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "confirmed":
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
      case "pending review":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "restaurant":
        return Utensils;
      case "swimming pool":
        return Waves;
      case "event hall":
        return Calendar;
      default:
        return Calendar;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || "User"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg">Food Orders</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg">Bookings</TabsTrigger>
            <TabsTrigger value="ads" className="rounded-lg">Radio Ads</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: "12", icon: ShoppingBag, color: "bg-accent" },
                { label: "Upcoming Bookings", value: "3", icon: Calendar, color: "bg-terracotta" },
                { label: "Active Ads", value: "1", icon: Radio, color: "bg-gold" },
                { label: "Total Spent", value: "₵1,250", icon: CreditCard, color: "bg-primary" },
              ].map((stat, i) => (
                <Card key={i} className="hover:shadow-medium transition-all">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-6 h-6 text-card" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Order Food", link: "/restaurant", icon: Utensils },
                { label: "Book Pool", link: "/pool", icon: Waves },
                { label: "Book Event", link: "/events", icon: Calendar },
                { label: "Place Ad", link: "/radio", icon: Radio },
              ].map((action, i) => (
                <Link key={i} to={action.link}>
                  <Card className="hover:shadow-medium hover:-translate-y-1 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <action.icon className="w-8 h-8 mx-auto mb-2 text-accent" />
                      <span className="font-semibold">{action.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <div className="font-medium">{order.id}</div>
                          <div className="text-sm text-muted-foreground">{order.items}</div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <div className="text-sm font-semibold mt-1">₵{order.total.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockBookings.slice(0, 3).map((booking) => {
                      const Icon = getTypeIcon(booking.type);
                      return (
                        <div key={booking.id} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Icon className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{booking.type}</div>
                            <div className="text-sm text-muted-foreground">{booking.date} at {booking.time}</div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Food Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-soft transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">{order.id}</div>
                          <div className="text-sm text-muted-foreground">{order.items}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {order.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <div className="text-lg font-bold mt-1">₵{order.total.toLocaleString()}</div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <Eye className="w-4 h-4 mr-1" /> Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBookings.map((booking) => {
                    const Icon = getTypeIcon(booking.type);
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-soft transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold">{booking.type}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> {booking.date}
                              <Clock className="w-3 h-3 ml-2" /> {booking.time}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="w-3 h-3" /> {booking.guests} guests
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <div className="mt-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" /> Modify
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Radio Advertisement Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAds.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-soft transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center">
                          <Radio className="w-6 h-6 text-brown-900" />
                        </div>
                        <div>
                          <div className="font-semibold">{ad.id}</div>
                          <div className="text-sm text-muted-foreground">{ad.slot} - {ad.spots} spots</div>
                          <div className="text-sm text-muted-foreground">{ad.business}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                        <div className="text-lg font-bold mt-1">₵{ad.cost.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <Input defaultValue={user?.name?.split(" ")[0] || ""} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input defaultValue={user?.name?.split(" ").slice(1).join(" ") || ""} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" defaultValue={user?.email || ""} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input defaultValue="+233 20 123 4567" />
                  </div>
                  <Button variant="gold">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">•••• •••• •••• 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/25</div>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
