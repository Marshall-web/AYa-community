import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Clock, DollarSign } from 'lucide-react';
import { drinksMenu, Drink, getDrinksByCategory } from '@/data/drinks';
import api from '@/lib/api';

interface ExtendedDrink extends Drink {
  admin_overridden?: boolean;
  last_updated?: string;
}

interface DrinksMenuProps {
  onAddToCart?: (item: Drink, quantity: number) => void;
}

const DrinksMenu: React.FC<DrinksMenuProps> = ({ onAddToCart }) => {
  const [drinks, setDrinks] = useState<ExtendedDrink[]>(drinksMenu);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fetch drinks with admin overrides
  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drinks/');
      setDrinks(response.data);
    } catch (error) {
      console.error('Error fetching drinks:', error);
      // Fallback to hardcoded drinks if API fails
      setDrinks(drinksMenu);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(drinks.map(drink => drink.category)))];
  
  const filteredDrinks = selectedCategory === 'All' 
    ? drinks.filter(drink => drink.available)
    : drinks.filter(drink => drink.category === selectedCategory && drink.available);

  const updateQuantity = (drinkId: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [drinkId]: Math.max(0, (prev[drinkId] || 0) + change)
    }));
  };

  const handleAddToCart = (drink: ExtendedDrink) => {
    const quantity = quantities[drink.id] || 1;
    if (onAddToCart) {
      onAddToCart(drink as Drink, quantity);
    }
    // Reset quantity after adding to cart
    setQuantities(prev => ({ ...prev, [drink.id]: 0 }));
  };

  const formatPrice = (price: number) => {
    return `₵${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Drinks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrinks.map(drink => (
          <Card 
            key={drink.id} 
            className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                    {drink.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(drink.price)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant={drink.isAlcoholic ? 'destructive' : 'secondary'} className="text-xs">
                    {drink.isAlcoholic ? 'Alcoholic' : 'Non-Alcoholic'}
                  </Badge>
                  {drink.admin_overridden && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Custom Price
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {drink.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(drink.id, -1)}
                    disabled={!quantities[drink.id]}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {quantities[drink.id] || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(drink.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={() => handleAddToCart(drink)}
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
              
              {drink.admin_overridden && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last updated: {new Date(drink.last_updated || '').toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrinks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No drinks available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default DrinksMenu;
