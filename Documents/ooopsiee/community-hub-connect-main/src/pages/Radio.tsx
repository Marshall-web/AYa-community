import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, Mic, Clock, Calendar, Play, Volume2, 
  MessageSquare, DollarSign, User, Check 
} from "lucide-react";
import radioImg from "@/assets/radio-station.jpg";

const schedule = {
  weekday: [
    { time: "6:00 AM", show: "Morning Devotion", host: "Pastor James", type: "Religious" },
    { time: "7:00 AM", show: "Wake Up Show", host: "DJ Mike", type: "Music" },
    { time: "9:00 AM", show: "Community News", host: "Sarah Obi", type: "News" },
    { time: "11:00 AM", show: "Business Hour", host: "Chidi Emmanuel", type: "Talk" },
    { time: "1:00 PM", show: "Afternoon Vibes", host: "DJ Kemi", type: "Music" },
    { time: "4:00 PM", show: "Youth Connect", host: "Tunde & Ada", type: "Talk" },
    { time: "6:00 PM", show: "Evening News", host: "Sarah Obi", type: "News" },
    { time: "8:00 PM", show: "Night Grooves", host: "DJ Smooth", type: "Music" },
  ],
  weekend: [
    { time: "7:00 AM", show: "Weekend Praise", host: "Gospel Choir", type: "Religious" },
    { time: "10:00 AM", show: "Community Voices", host: "Various", type: "Talk" },
    { time: "12:00 PM", show: "Sports Central", host: "Emeka Sports", type: "Sports" },
    { time: "3:00 PM", show: "Weekend Party Mix", host: "DJ Thunder", type: "Music" },
    { time: "7:00 PM", show: "Cultural Hour", host: "Chief Okonkwo", type: "Culture" },
    { time: "9:00 PM", show: "Late Night Jazz", host: "DJ Smooth", type: "Music" },
  ],
};

const adSlots = [
  { name: "Morning Prime", time: "6AM - 9AM", price: 150, description: "Peak morning audience" },
  { name: "Midday", time: "11AM - 2PM", price: 100, description: "Lunch hour listeners" },
  { name: "Afternoon", time: "2PM - 5PM", price: 80, description: "Afternoon audience" },
  { name: "Evening Prime", time: "5PM - 9PM", price: 120, description: "Evening commuters" },
  { name: "Night Owl", time: "9PM - 12AM", price: 50, description: "Late night audience" },
];

const presenters = [
  { name: "DJ Mike", role: "Morning Show Host", speciality: "Afrobeats & Pop" },
  { name: "Sarah Obi", role: "News Anchor", speciality: "Current Affairs" },
  { name: "DJ Smooth", role: "Evening Host", speciality: "R&B & Jazz" },
  { name: "Chidi Emmanuel", role: "Business Analyst", speciality: "Finance & Economy" },
];

export default function RadioStation() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={radioImg} alt="Radio Station" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-4">
              Community FM 98.5
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Radio Station</h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto mb-6">
              Your voice in the community. Tune in, advertise, and stay connected.
            </p>
            <Button variant="hero" size="lg">
              <Play className="w-5 h-5 mr-2" />
              Listen Live
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Live Now Banner */}
        <Card className="bg-accent/10 border-accent/30 mb-12 overflow-hidden">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center animate-pulse-glow">
              <Volume2 className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <Badge className="bg-destructive mb-2">LIVE NOW</Badge>
              <h3 className="font-display text-xl font-bold">Morning Wake Up Show with DJ Mike</h3>
              <p className="text-muted-foreground">Playing the best Afrobeats to start your day!</p>
            </div>
            <Button variant="gold">
              <Play className="w-4 h-4 mr-2" />
              Tune In
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="schedule" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-secondary p-1 rounded-xl">
            <TabsTrigger value="schedule" className="rounded-lg">Schedule</TabsTrigger>
            <TabsTrigger value="advertise" className="rounded-lg">Advertise</TabsTrigger>
            <TabsTrigger value="presenters" className="rounded-lg">Presenters</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekday Schedule */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Weekday Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.weekday.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                        <div className="w-20 text-sm font-medium text-muted-foreground">{item.time}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{item.show}</div>
                          <div className="text-sm text-muted-foreground">with {item.host}</div>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekend Schedule */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Weekend Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.weekend.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                        <div className="w-20 text-sm font-medium text-muted-foreground">{item.time}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{item.show}</div>
                          <div className="text-sm text-muted-foreground">with {item.host}</div>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advertise Tab */}
          <TabsContent value="advertise" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ad Slots */}
              <div>
                <h3 className="font-display text-2xl font-bold mb-6">Advertising Slots</h3>
                <div className="space-y-3">
                  {adSlots.map((slot) => (
                    <button
                      key={slot.name}
                      onClick={() => setSelectedSlot(slot.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSlot === slot.name
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <div className="font-semibold">{slot.name}</div>
                          <div className="text-sm text-muted-foreground">{slot.time}</div>
                          <div className="text-xs text-muted-foreground">{slot.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₵{slot.price.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">per 30 sec</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submission Form */}
              <div>
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-accent" />
                      Submit Advertisement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name</label>
                      <Input placeholder="Your business name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Person</label>
                      <Input placeholder="Full name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input placeholder="+233 20 000 0000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input type="email" placeholder="email@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Selected Slot</label>
                      <div className="flex flex-wrap gap-2">
                        {adSlots.map(slot => (
                          <Button
                            key={slot.name}
                            variant={selectedSlot === slot.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSlot(slot.name)}
                          >
                            {slot.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Spots</label>
                      <select className="w-full h-11 px-3 rounded-lg border border-input bg-background">
                        {[1, 2, 3, 5, 10, 20].map(n => (
                          <option key={n} value={n}>{n} spot{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Advertisement Script</label>
                      <Textarea placeholder="Write your advertisement script here..." rows={4} />
                    </div>
                    <div className="bg-secondary rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Estimated Cost</span>
                        <span className="font-bold text-xl">
                          ₵{selectedSlot ? (adSlots.find(s => s.name === selectedSlot)?.price || 0).toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full" size="lg" variant="gold">
                      Submit Advertisement Request
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Presenters Tab */}
          <TabsContent value="presenters" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {presenters.map((presenter, i) => (
                <Card key={presenter.name} className="text-center overflow-hidden hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-40 bg-gradient-to-br from-primary to-brown-600 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-bold mb-1">{presenter.name}</h3>
                    <Badge variant="secondary" className="mb-3">{presenter.role}</Badge>
                    <p className="text-sm text-muted-foreground">{presenter.speciality}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Station Info */}
            <Card className="mt-8 bg-primary text-primary-foreground">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-display text-xl font-bold mb-4">About Community FM</h4>
                    <p className="text-primary-foreground/80">
                      Broadcasting since 2005, Community FM 98.5 is your trusted source for local news, 
                      entertainment, and community engagement. We serve over 500,000 listeners daily.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold mb-4">Frequency</h4>
                    <div className="text-4xl font-bold text-accent">98.5 FM</div>
                    <p className="text-primary-foreground/80 mt-2">Available across the region</p>
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold mb-4">Contact Studio</h4>
                    <p className="text-primary-foreground/80 mb-2">Request songs, dedications, or share your story:</p>
                    <p className="font-semibold">+233 20 985 0985</p>
                    <p className="text-sm text-primary-foreground/60">studio@communityfm.ng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
