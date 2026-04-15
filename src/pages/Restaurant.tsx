import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Clock, Users, ShoppingBag, Plus, Minus,
  Phone, MapPin, ChefHat, Star, Truck, Search, X
} from "lucide-react";
import diningSpaceImg from "@/assets/Dinning-Space.jpg";
import diningTableImg from "@/assets/Dinning-Table.jpg";
import kitchenImg from "@/assets/Kitchen.jpg";
import tableImg from "@/assets/table.jpg";
import table2Img from "@/assets/table2.jpg";
import api from "@/lib/api";
import { menuImages } from "@/data/menuImages";


const restaurantSlides = [
  { src: diningSpaceImg, alt: "Dining Space" },
  { src: diningTableImg, alt: "Dining Table" },
  { src: kitchenImg, alt: "Our Kitchen" },
  { src: tableImg, alt: "Restaurant Table" },
  { src: table2Img, alt: "Intimate Dining" },
];

const menuCategories = ["All", "Starters", "Main Course", "Grills", "Sides", "Desserts", "Drinks", "Spirits"];

// Helper to construct full image URL
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  // If it's a full URL, data URL, or a Vite/local asset path, return as is
  if (
    imagePath.startsWith('http') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('/src/') ||
    imagePath.includes('assets/') ||
    imagePath.includes('/static/')
  ) {
    return imagePath;
  }
  // If it's a relative path (starts with /), prepend backend URL
  if (imagePath.startsWith('/')) {
    return `http://${window.location.hostname}:8000${imagePath}`;
  }
  return imagePath;
};

// Interface for Menu Item
interface MenuItem {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  rating?: number;
  status?: string;
}

// Subcomponent for Grid View (Food)
function MenuCard({ item, index, addToCart, removeFromCart, getItemQuantity }: {
  item: MenuItem;
  index: number;
  addToCart: (id: string | number) => void;
  removeFromCart: (id: string | number) => void;
  getItemQuantity: (id: string | number) => number;
}) {
  const [imgError, setImgError] = useState(false);

  const getFallbackEmoji = (category: string) => {
    switch (category) {
      case 'Starters': return '🥗';
      case 'Main Course': return '🍛';
      case 'Grills': return '🍗';
      case 'Sides': return '🍟';
      case 'Desserts': return '🍰';
      case 'Drinks': return '🥤';
      case 'Spirits': return '🍾';
      default: return '🍽️';
    }
  };

  return (
    <Card
      className="overflow-hidden border border-border/50 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 group bg-card rounded-3xl"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative aspect-square md:aspect-[5/4] bg-secondary overflow-hidden">
        {item.image && (typeof item.image !== 'string' || item.image.length > 3) && !imgError ? (
          <img
            src={getImageUrl(item.image) || ""}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/5 pattern-dots">
            <span className="text-5xl md:text-6xl opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">
              {getFallbackEmoji(item.category)}
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {item.rating && item.rating > 4.7 && (
            <Badge className="bg-orange-500 text-white border-none text-[10px] font-black py-1 px-2.5 shadow-lg uppercase tracking-wider" >
              Best Seller
            </Badge>
          )}
          {item.status && item.status !== 'Available' && (
            <Badge variant="destructive" className="text-[10px] font-black py-1 px-2.5 shadow-lg uppercase tracking-wider">
              {item.status}
            </Badge>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex items-center gap-1.5 text-white/90">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-bold">{item.rating || 4.5}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-display font-bold text-foreground text-base md:text-lg line-clamp-1 group-hover:text-accent transition-colors">
              {item.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[3em] leading-relaxed opacity-80">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <span className="font-display font-black text-accent text-lg">₵{item.price.toLocaleString()}</span>

          <div className="flex items-center gap-2">
            {getItemQuantity(item.id) > 0 ? (
              <div className="flex items-center bg-secondary/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-xl hover:bg-background transition-colors"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Minus className="w-4 h-4 text-primary" />
                </Button>
                <span className="w-8 text-center text-sm font-black">{getItemQuantity(item.id)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-xl hover:bg-background transition-colors"
                  onClick={() => addToCart(item.id)}
                >
                  <Plus className="w-4 h-4 text-primary" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="rounded-2xl bg-primary hover:bg-accent text-primary-foreground transition-all duration-300 h-10 px-6 font-black text-xs uppercase tracking-widest hover:shadow-glow"
                onClick={() => addToCart(item.id)}
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Subcomponent for List View (Drinks & Spirits)
function MenuListItem({ item, addToCart, removeFromCart, getItemQuantity }: {
  item: MenuItem;
  addToCart: (id: string | number) => void;
  removeFromCart: (id: string | number) => void;
  getItemQuantity: (id: string | number) => number;
}) {
  return (
    <div className="group py-5 flex items-center gap-6 hover:bg-white/40 dark:hover:bg-black/20 rounded-2xl px-4 transition-all duration-300 border-b border-border/20 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-1">
          <h3 className="font-display font-bold text-foreground text-base md:text-xl truncate group-hover:text-accent transition-colors relative">
            {item.name}
          </h3>
          <div className="flex-1 border-b-2 border-dotted border-muted-foreground/20 mb-1.5" />
          <span className="font-display font-black text-accent text-base md:text-xl">₵{item.price.toLocaleString()}</span>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground/60 truncate italic max-w-md">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {getItemQuantity(item.id) > 0 ? (
          <div className="flex items-center bg-secondary/60 rounded-2xl p-1 shadow-inner border border-border/30">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 md:h-10 md:w-10 rounded-xl hover:bg-background"
              onClick={() => removeFromCart(item.id)}
            >
              <Minus className="w-3 h-3 md:w-5 md:h-5 text-primary" />
            </Button>
            <span className="w-6 md:w-10 text-center text-xs md:text-lg font-black">{getItemQuantity(item.id)}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 md:h-10 md:w-10 rounded-xl hover:bg-background"
              onClick={() => addToCart(item.id)}
            >
              <Plus className="w-3 h-3 md:w-5 md:h-5 text-primary" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="secondary"
            className="rounded-2xl hover:bg-accent hover:text-accent-foreground h-10 w-10 md:h-12 md:w-12 p-0 shadow-sm hover:shadow-glow transition-all active:scale-90"
            onClick={() => addToCart(item.id)}
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}



export default function Restaurant() {
  const [activeTab, setActiveTab] = useState("menu");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % restaurantSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [cart, setCart] = useState<{ id: string | number; quantity: number }[]>([]);
  const [date, setDate] = useState<Date>();
  const [guests, setGuests] = useState(2);

  // Dynamic Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Form state
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingTime, setBookingTime] = useState("12:00 PM");
  const [specialRequests, setSpecialRequests] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Loading and message state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Fetch Menu Items
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);

        // Fetch all menu items (drinks are now included in the database)
        const menuResponse = await api.get('/menu-items/');

        const allItems = menuResponse.data;


        const mappedItems = allItems.map((item: any) => {
          // Normalize name: remove spaces, dots, and common suffixes
          const name = item.name || "";
          const normalizedItemName = name
            .toLowerCase()
            .replace(/\(.*\)/g, '') // remove anything in parentheses like (deluxe)
            .replace(/\band\b|\bwith\b/g, '') // remove words "and", "with"
            .replace(/[^a-z0-9]/g, '')
            .replace(/ls$|mini$|pet$|can$|bottle$|sachet$|ss$|bs$/g, '');

          let matchedLocalImage = null;

          // 1. Try exact match first (normalized)
          for (const [key, img] of Object.entries(menuImages)) {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedItemName === normalizedKey) {
              matchedLocalImage = img;
              break;
            }
          }

          // 2. Try partial match if no exact match found
          if (!matchedLocalImage) {
            // Sort keys by length descending to match more specific labels first
            const sortedKeys = Object.entries(menuImages).sort((a, b) => b[0].length - a[0].length);

            for (const [key, img] of sortedKeys) {
              const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

              if (normalizedKey.length > 3) {
                if (normalizedItemName.includes(normalizedKey) || normalizedKey.includes(normalizedItemName)) {
                  // If name contains 'soup', don't match it with a non-soup key
                  if (normalizedItemName.includes('soup') && !normalizedKey.includes('soup')) continue;
                  // Vice-versa: if name is grill/plain, don't match with soup tag
                  if (!normalizedItemName.includes('soup') && normalizedKey.includes('soup')) continue;

                  // Avoid matching generic tags too loosely
                  if (normalizedKey === 'star' && normalizedItemName !== 'star') continue;
                  if (normalizedKey === 'jollof' && normalizedItemName.includes('assorted')) continue;

                  matchedLocalImage = img;
                  break;
                }
              }
            }
          }

          return {
            ...item,
            image: matchedLocalImage || item.image || getCategoryImage(item.category),
            description: item.description || (item.category === 'Desserts' ? "Sweet and delightful treat" : (item.category === 'Drinks' || item.category === 'Spirits' ? `Refreshing ${item.name}` : "Delicious freshly prepared dish")),
            rating: item.rating || 4.5
          };
        });

        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
        setMessage({ type: 'error', text: "Failed to load menu items." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Helper to get default emoji/image based on category
  const getCategoryImage = (category: string) => {
    switch (category) {
      case "Starters": return "🍲";
      case "Main Course": return "🥘";
      case "Grills": return "🥩";
      case "Sides": return "🍟";
      case "Desserts": return "🧁";
      case "Drinks": return "🍹";
      case "Spirits": return "🥃";
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



  const filteredMenu = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group items by category for the "All" view
  const groupedMenu = menuCategories.filter(cat => cat !== "All").map(category => ({
    category,
    items: filteredMenu.filter(item => item.category === category)
  })).filter(group => group.items.length > 0);

  const cartTotal = cart.reduce((total, cartItem) => {
    const item = menuItems.find(m => m.id === cartItem.id);
    return total + (item?.price || 0) * cartItem.quantity;
  }, 0);



  const addToCart = (id: string | number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const getItemQuantity = (id: string | number) => cart.find(item => item.id === id)?.quantity || 0;

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

  const handleDeliveryOrder = () => {
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

    // Prepare order items for payment page
    const orderItems = cart.map(cartItem => {
      const item = menuItems.find(m => m.id === cartItem.id);
      if (!item) return null;
      return {
        id: item.id,
        name: item.name,
        quantity: cartItem.quantity,
        price: item.price
      };
    }).filter((item): item is { id: number; name: string; quantity: number; price: number } => item !== null);

    // Navigate to payment page with order data
    navigate("/payment", {
      state: {
        orderType: "delivery",
        items: orderItems,
        total: cartTotal,
        customerName: user?.first_name || user?.username || "",
        deliveryAddress,
        deliveryPhone,
        deliveryInstructions
      }
    });
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

    const bookingType = "Restaurant Table Booking";
    const bookingDate = format(date, "PPP");

    // Check availability before proceeding to payment
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/bookings/check_availability/', {
        booking_type: bookingType,
        date: `${bookingDate} at ${bookingTime}`,
      });

      if (!response.data.available) {
        setMessage({
          type: 'error',
          text: response.data.message || 'This table slot is already booked. Please select a different date/time.'
        });
        setIsLoading(false);
        return;
      }

      // For table booking, we still need items if they ordered food
      // If no items in cart, create a dummy item for the booking fee
      const orderItems = cart.length > 0
        ? cart.map(cartItem => {
          const item = menuItems.find(m => m.id === cartItem.id);
          if (!item) return null;
          return {
            id: item.id,
            name: item.name,
            quantity: cartItem.quantity,
            price: item.price
          };
        }).filter((item): item is { id: number; name: string; quantity: number; price: number } => item !== null)
        : [{
          id: 0,
          name: "Table Reservation",
          quantity: 1,
          price: 0 // Free reservation, or set a booking fee if needed
        }];

      // Navigate to payment page with booking data
      navigate("/payment", {
        state: {
          orderType: "booking",
          bookingType: bookingType,
          items: orderItems,
          total: cartTotal,
          bookingName,
          bookingPhone,
          bookingDate: bookingDate,
          bookingTime,
          guests,
          specialRequests
        }
      });
    } catch (error: any) {
      console.error('Availability check error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to check availability. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[65vh] overflow-hidden">
        {restaurantSlides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-[2000ms] ease-in-out transform",
              currentSlide === index ? "opacity-100 scale-105" : "opacity-0 scale-100"
            )}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover brightness-[0.7]"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-md rounded-full text-accent font-bold text-[10px] md:text-sm mb-6 uppercase tracking-[0.2em] animate-fade-in">
              <Star className="w-3 h-3 fill-accent" />
              Nzema's Finest Dining
              <Star className="w-3 h-3 fill-accent" />
            </div>
            <h1 className="font-display text-4xl md:text-8xl font-black mb-4 tracking-tight text-white drop-shadow-2xl">
              Trip Bar <span className="text-accent underline decoration-accent/30 underline-offset-8 italic">Restaurant</span>
            </h1>
            <p className="text-sm md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg">
              Savor the art of authentic Ghanaian cuisine reimagined with a modern flair.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-accent rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Success/Error Message */}
        {message && (
          <div className={`fixed top-20 right-4 z-[100] p-4 rounded-2xl shadow-glow animate-scale-in border border-white/20 backdrop-blur-md ${message.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {message.type === 'success' ? '✓' : '!'}
              </div>
              <span className="font-bold">{message.text}</span>
            </div>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="grid w-fit mx-auto grid-cols-3 bg-secondary/30 backdrop-blur-sm p-1.5 rounded-2xl border border-border/50">
            <TabsTrigger value="menu" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold">Menu</TabsTrigger>
            <TabsTrigger value="delivery" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold tracking-tight">Delivery</TabsTrigger>
            <TabsTrigger value="booking" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold">Reservation</TabsTrigger>
          </TabsList>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-12 animate-fade-in">
            {/* Search and Filter Area - Premium Sticky Look */}
            <div className="sticky top-20 z-40 -mx-4 px-4 py-6">
              <div className="max-w-5xl mx-auto p-4 glass rounded-3xl shadow-soft">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input
                      placeholder="Search for your favorite dishes..."
                      className="pl-12 h-14 bg-background/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-accent text-base font-medium shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex overflow-x-auto w-full md:w-auto pb-1 scrollbar-none gap-2 px-1">
                    {menuCategories.map(cat => (
                      <Button
                        key={cat}
                        variant={activeCategory === cat ? "default" : "secondary"}
                        size="lg"
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "rounded-2xl whitespace-nowrap px-6 h-12 transition-all font-bold",
                          activeCategory === cat ? "bg-accent text-accent-foreground shadow-glow scale-105" : "hover:bg-accent/10 hover:text-accent"
                        )}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Content */}
            <div className="max-w-7xl mx-auto py-4">
              {activeCategory === "All" && !searchQuery ? (
                <div className="space-y-12">
                  {groupedMenu.map((group) => {
                    const isListView = ["Drinks", "Spirits", "Sides", "Desserts"].includes(group.category);

                    return (
                      <div key={group.category} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <h2 className="font-display text-2xl font-bold text-foreground">{group.category}</h2>
                          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                        </div>

                        {isListView ? (
                          <div className="max-w-3xl mx-auto bg-card/30 rounded-2xl p-4 md:p-6 border border-border/50 shadow-inner">
                            <div className="divide-y divide-border/30">
                              {group.items.map((item) => (
                                <MenuListItem key={item.id} item={item} addToCart={addToCart} removeFromCart={removeFromCart} getItemQuantity={getItemQuantity} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {group.items.map((item, index) => (
                              <MenuCard key={item.id} item={item} index={index} addToCart={addToCart} removeFromCart={removeFromCart} getItemQuantity={getItemQuantity} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {["Drinks", "Spirits", "Sides", "Desserts"].includes(activeCategory) ? (
                    <div className="max-w-3xl mx-auto bg-card/30 rounded-2xl p-4 md:p-6 border border-border/50 shadow-inner">
                      <div className="divide-y divide-border/30">
                        {filteredMenu.map((item) => (
                          <MenuListItem key={item.id} item={item} addToCart={addToCart} removeFromCart={removeFromCart} getItemQuantity={getItemQuantity} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {filteredMenu.map((item, index) => {
                        const isListItem = ["Drinks", "Spirits", "Sides", "Desserts"].includes(item.category);
                        return isListItem ? (
                          <div key={item.id} className="col-span-2 lg:col-span-2">
                            <MenuListItem item={item} addToCart={addToCart} removeFromCart={removeFromCart} getItemQuantity={getItemQuantity} />
                          </div>
                        ) : (
                          <MenuCard key={item.id} item={item} index={index} addToCart={addToCart} removeFromCart={removeFromCart} getItemQuantity={getItemQuantity} />
                        );
                      })}
                    </div>
                  )}
                </>
              )}


              {filteredMenu.length === 0 && (
                <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No items found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or category filter</p>
                  <Button variant="link" className="text-accent mt-2" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
                    Show all items
                  </Button>
                </div>
              )}
            </div>
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
                      {isLoading ? 'Processing...' : 'Proceed to Payment'}
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
                            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="pointer-events-auto" />
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
                      {isLoading ? 'Processing...' : 'Proceed to Payment'}
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

        {/* Floating Cart Summary - Always visible when items in cart */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(calc(100%-2rem),500px)] group animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full h-16 md:h-20 rounded-[2rem] bg-primary text-primary-foreground shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between px-2 md:px-3 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border border-white/10 overflow-hidden relative"
            >
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

              <div className="flex items-center gap-2 md:gap-4 pl-4">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground shadow-2xl group-hover:rotate-[10deg] transition-transform duration-500">
                  <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-accent/80">Order Summary</span>
                  <span className="font-display font-black text-sm md:text-xl leading-none">
                    {cart.reduce((t, i) => t + i.quantity, 0)} Items
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 h-full px-6 md:px-8 rounded-r-[1.8rem] backdrop-blur-sm group-hover:bg-accent/20 transition-colors">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold opacity-60">Total Bill</span>
                  <span className="text-lg md:text-2xl font-black text-accent drop-shadow-sm leading-none">₵{cartTotal.toLocaleString()}</span>
                </div>
                <div className="hidden md:flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                    <Plus className="w-5 h-5 text-accent rotate-45" />
                  </div>
                </div>
              </div>
            </Button>

            {/* Mobile Touch Helper */}
            <div className="mt-2 text-center md:hidden">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">Tap to Finalize</span>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
