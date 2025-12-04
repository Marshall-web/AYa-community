import { useState } from "react";
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

const menuCategories = ["All", "Starters", "Main Course", "Grills", "Desserts", "Drinks"];

const menuItems = [
  { id: 1, name: "Jollof Rice Supreme", category: "Main Course", price: 35, image: "🍚", description: "Smoky party jollof with grilled chicken", rating: 4.9 },
  { id: 2, name: "Light Soup", category: "Starters", price: 25, image: "🍲", description: "Spicy goat light soup", rating: 4.8 },
  { id: 3, name: "Kebab Platter", category: "Grills", price: 40, image: "🥩", description: "Traditional grilled beef skewers", rating: 4.9 },
  { id: 4, name: "Fried Plantain", category: "Starters", price: 10, image: "🍌", description: "Sweet ripe plantains fried golden", rating: 4.7 },
  { id: 5, name: "Fufu & Goat Soup", category: "Main Course", price: 45, image: "🥘", description: "Fufu with goat meat soup", rating: 4.8 },
  { id: 6, name: "Grilled Fish", category: "Grills", price: 55, image: "🐟", description: "Whole tilapia with pepper sauce", rating: 4.9 },
  { id: 7, name: "Sobolo", category: "Drinks", price: 15, image: "🍹", description: "Ghanaian hibiscus drink", rating: 4.6 },
  { id: 8, name: "Bofrot", category: "Desserts", price: 8, image: "🧁", description: "Sweet fried dough balls", rating: 4.5 },
];

export default function Restaurant() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{id: number; quantity: number}[]>([]);
  const [date, setDate] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [orderType, setOrderType] = useState<"dine" | "delivery">("dine");

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
        <Tabs defaultValue="menu" className="space-y-8">
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
                  <div className="h-40 bg-secondary flex items-center justify-center text-6xl">
                    {item.image}
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
                <Button variant="hero" size="sm">Checkout</Button>
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
                      <Input placeholder="Enter your full address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input placeholder="+233 20 000 0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Special Instructions</label>
                      <Input placeholder="Any special requests..." />
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

                    <Button className="w-full" size="lg" variant="gold" disabled={cart.length === 0}>
                      Place Delivery Order
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
                        <select className="w-full h-11 px-3 rounded-lg border border-input bg-background">
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
                      <Input placeholder="Birthday celebration, window seat, etc." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Name</label>
                        <Input placeholder="Kwame Mensah" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input placeholder="+233 20 000 0000" />
                      </div>
                    </div>

                    <Button className="w-full" size="lg" variant="gold">
                      Confirm Reservation
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
