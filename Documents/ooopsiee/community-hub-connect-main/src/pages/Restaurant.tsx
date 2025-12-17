import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Clock, Users, ShoppingBag, Plus, Minus,
  Phone, MapPin, ChefHat, Star, Truck
} from "lucide-react";
import restaurantImg from "@/assets/restaurant.jpg";
import api from "@/lib/api";

const menuCategories = ["All", "Starters", "Main Course", "Grills", "Desserts", "Drinks"];

// Helper to construct full image URL
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  // If it's a relative path (starts with /), prepend backend URL
  if (imagePath.startsWith('/')) {
    return `http://localhost:8000${imagePath}`;
  }
  return imagePath;
};

// Interface for Menu Item
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  rating?: number;
  status?: string;
}

export default function Restaurant() {
  const [activeTab, setActiveTab] = useState("menu");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([]);
  const [date, setDate] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [orderType, setOrderType] = useState<"dine" | "delivery">("dine");

  // Dynamic Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Form state
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingTime, setBookingTime] = useState("12:00 PM");
  const [specialRequests, setSpecialRequests] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Loading and message state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Fetch Menu Items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/menu-items/');
        // Map backend data to frontend interface if needed, or use directly if matches
        // Assuming backend returns list of objects with name, category, price, status
        // We might need to add default images or descriptions if backend doesn't provide them yet
        const mappedItems = response.data.map((item: any) => ({
          ...item,
          image: item.image || getCategoryImage(item.category), // Helper for default images
          description: item.description || "Delicious freshly prepared dish",
          rating: item.rating || 4.5
        }));
        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
        setMessage({ type: 'error', text: "Failed to load menu items." });
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenu();
  }, []);

  // Helper to get default emoji/image based on category
  const getCategoryImage = (category: string) => {
    switch (category) {
      case "Starters": return "🍲";
      case "Main Course": return "🥘";
      case "Grills": return "🥩";
      case "Desserts": return "🧁";
      case "Drinks": return "🍹";
      default: return "🍽️";
    }
  };

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setBookingName(user.first_name || user.username);
      // If user has a phone number in profile, we could pre-fill it here too
    }
  }, [user]);



  const filteredMenu = activeCategory === "All"
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const getItemQuantity = (id: number) => cart.find(item => item.id === id)?.quantity || 0;

  const cartTotal = cart.reduce((total, cartItem) => {
    const item = menuItems.find(m => m.id === cartItem.id);
    return total + (item?.price || 0) * cartItem.quantity;
  }, 0);



  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (cart.length === 0) return;

    // Switch to delivery tab to complete order
    setActiveTab("delivery");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validatePhone = (phone: string) => {
    // Accepts 10 digits (e.g., 0201234567) OR +233 followed by 9 digits (e.g., +233201234567)
    const phoneRegex = /^(\d{10}|\+233\d{9})$/;
    return phoneRegex.test(phone.replace(/\s/g, '')); // Remove spaces before checking
  };

  const handleDeliveryOrder = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (cart.length === 0 || !deliveryAddress || !deliveryPhone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and add items to cart.' });
      return;
    }

    if (!validatePhone(deliveryPhone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const orderItems = cart.map(cartItem => {
        const item = menuItems.find(m => m.id === cartItem.id);
        return `${item?.name} x${cartItem.quantity}`;
      }).join(", ");

      await api.post('/orders/', {
        customer_name: deliveryAddress, // Keeping address as customer identifier for delivery for now, or could combine
        items: `${orderItems} | Phone: ${deliveryPhone} | Instructions: ${deliveryInstructions}`,
        total_price: cartTotal,
        status: "Pending"
      });

      setMessage({ type: 'success', text: 'Delivery order placed successfully!' });
      setCart([]);
      setDeliveryAddress("");
      setDeliveryPhone("");
      setDeliveryInstructions("");
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Delivery order error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to place delivery order.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableBooking = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!date || !bookingName || !bookingPhone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!validatePhone(bookingPhone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await api.post('/bookings/', {
        guest_name: bookingName,
        booking_type: "Restaurant",
        date: `${format(date, "PPP")} at ${bookingTime} | Guests: ${guests} | Requests: ${specialRequests}`,
        status: "Pending"
      });

      setMessage({ type: 'success', text: 'Table reservation confirmed!' });
      setDate(undefined);
      setBookingName("");
      setBookingPhone("");
      setSpecialRequests("");
      setGuests(2);
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to book table.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={restaurantImg} alt="Restaurant" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-4">
              Fine Dining & Delivery
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Our Restaurant</h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto">
              Experience authentic flavors in an elegant setting, or enjoy at home with delivery.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Success/Error Message */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-scale-in ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {message.text}
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-secondary p-1 rounded-xl">
            <TabsTrigger value="menu" className="rounded-lg">Menu</TabsTrigger>
            <TabsTrigger value="delivery" className="rounded-lg">Order Delivery</TabsTrigger>
            <TabsTrigger value="booking" className="rounded-lg">Book Table</TabsTrigger>
          </TabsList>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-8 animate-fade-in">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {menuCategories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMenu.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-medium transition-all hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-40 bg-secondary flex items-center justify-center overflow-hidden">
                    {(item.image?.startsWith('http') || item.image?.startsWith('/')) ? (
                      <img
                        src={getImageUrl(item.image) || ""}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <span className="text-6xl">{item.image}</span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">₵{item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        {getItemQuantity(item.id) > 0 && (
                          <>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-6 text-center font-semibold">{getItemQuantity(item.id)}</span>
                          </>
                        )}
                        <Button size="icon" className="h-8 w-8" onClick={() => addToCart(item.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-medium flex items-center gap-6 animate-scale-in z-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-semibold">{cart.reduce((t, i) => t + i.quantity, 0)} items</span>
                </div>
                <div className="h-6 w-px bg-primary-foreground/20" />
                <span className="font-bold">₵{cartTotal.toLocaleString()}</span>
                <Button variant="hero" size="sm" onClick={handleCheckout} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-medium">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <Truck className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">Order for Delivery</h2>
                      <p className="text-muted-foreground">Fresh food delivered to your door</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Address</label>
                      <Input
                        placeholder="Enter your full address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        placeholder="+233 20 000 0000"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Special Instructions</label>
                      <Input
                        placeholder="Any special requests..."
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                      />
                    </div>

                    <div className="bg-secondary rounded-xl p-4 mt-6">
                      <h4 className="font-semibold mb-2">Your Order</h4>
                      {cart.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Add items from the menu</p>
                      ) : (
                        <div className="space-y-2">
                          {cart.map(cartItem => {
                            const item = menuItems.find(m => m.id === cartItem.id);
                            return item ? (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} x{cartItem.quantity}</span>
                                <span className="font-medium">₵{(item.price * cartItem.quantity).toLocaleString()}</span>
                              </div>
                            ) : null;
                          })}
                          <div className="border-t border-border pt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span>₵{cartTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      variant="gold"
                      disabled={cart.length === 0 || isLoading}
                      onClick={handleDeliveryOrder}
                    >
                      {isLoading ? 'Processing...' : 'Place Delivery Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-medium">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">Book a Table</h2>
                      <p className="text-muted-foreground">Reserve your dining experience</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Time</label>
                        <select
                          className="w-full h-11 px-3 rounded-lg border border-input bg-background"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                        >
                          <option>12:00 PM</option>
                          <option>1:00 PM</option>
                          <option>2:00 PM</option>
                          <option>6:00 PM</option>
                          <option>7:00 PM</option>
                          <option>8:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Guests</label>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-2xl font-bold w-12 text-center">{guests}</span>
                        <Button variant="outline" size="icon" onClick={() => setGuests(Math.min(20, guests + 1))}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Special Requests</label>
                      <Input
                        placeholder="Birthday celebration, window seat, etc."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Name</label>
                        <Input
                          placeholder="Dauda Kwame"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          placeholder="+233 20 000 0000"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      variant="gold"
                      onClick={handleTableBooking}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Confirm Reservation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: Clock, title: "Opening Hours", text: "Mon-Sun: 11AM - 10PM" },
                  { icon: Phone, title: "Reservations", text: "+233 20 123 4567" },
                  { icon: MapPin, title: "Location", text: "123 Community Drive" },
                ].map((info, i) => (
                  <Card key={i} className="text-center p-4">
                    <info.icon className="w-6 h-6 mx-auto mb-2 text-accent" />
                    <h4 className="font-semibold text-sm">{info.title}</h4>
                    <p className="text-muted-foreground text-sm">{info.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
