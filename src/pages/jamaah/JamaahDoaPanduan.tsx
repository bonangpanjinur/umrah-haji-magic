import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import {
  Book, BookOpen, ChevronDown, ChevronLeft, 
  Search, Volume2, Star, Languages
} from "lucide-react";

interface OfflineContent {
  id: string;
  category: string;
  title: string;
  arabic_text?: string;
  latin_text?: string;
  translation?: string;
  content?: string;
  audio_url?: string;
  sort_order: number;
}

export default function JamaahDoaPanduan() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("doa");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorite-doa");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch content
  const { data: contents, isLoading } = useQuery({
    queryKey: ["jamaah-offline-content", activeCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offline_content" as any)
        .select("*")
        .eq("category", activeCategory)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as OfflineContent[];
    },
  });

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("favorite-doa", JSON.stringify(newFavorites));
  };

  const filteredContents = contents?.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/jamaah")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Doa & Panduan</h1>
            <p className="text-xs opacity-80">Tersedia offline</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari doa atau panduan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="doa" className="text-xs">
              <Book className="h-4 w-4 mr-1" />
              Doa
            </TabsTrigger>
            <TabsTrigger value="panduan" className="text-xs">
              <BookOpen className="h-4 w-4 mr-1" />
              Panduan
            </TabsTrigger>
            <TabsTrigger value="manasik" className="text-xs">
              <Languages className="h-4 w-4 mr-1" />
              Manasik
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs">
              <Book className="h-4 w-4 mr-1" />
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat konten...
              </div>
            ) : !filteredContents?.length ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {searchTerm ? "Tidak ditemukan" : "Belum ada konten"}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredContents.map((item) => (
                  <Collapsible
                    key={item.id}
                    open={expandedId === item.id}
                    onOpenChange={(open) => setExpandedId(open ? item.id : null)}
                  >
                    <Card>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-left">
                              <CardTitle className="text-base">{item.title}</CardTitle>
                              {favorites.includes(item.id) && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <ChevronDown
                              className={`h-5 w-5 text-muted-foreground transition-transform ${
                                expandedId === item.id ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 px-4 space-y-4">
                          {/* Arabic Text */}
                          {item.arabic_text && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p
                                className="text-xl leading-loose text-right font-arabic"
                                dir="rtl"
                              >
                                {item.arabic_text}
                              </p>
                            </div>
                          )}

                          {/* Latin Text */}
                          {item.latin_text && (
                            <div>
                              <Badge variant="outline" className="mb-2">
                                Latin
                              </Badge>
                              <p className="text-sm italic text-muted-foreground">
                                {item.latin_text}
                              </p>
                            </div>
                          )}

                          {/* Translation */}
                          {item.translation && (
                            <div>
                              <Badge variant="outline" className="mb-2">
                                Arti
                              </Badge>
                              <p className="text-sm">{item.translation}</p>
                            </div>
                          )}

                          {/* Content (for panduan/tips) */}
                          {item.content && (
                            <div className="prose prose-sm max-w-none">
                              {item.content.split("\n").map((line, i) => (
                                <p key={i} className="text-sm mb-2">
                                  {line}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            {item.audio_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => playAudio(item.audio_url!)}
                              >
                                <Volume2 className="h-4 w-4 mr-1" />
                                Dengar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Star
                                className={`h-4 w-4 mr-1 ${
                                  favorites.includes(item.id)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : ""
                                }`}
                              />
                              {favorites.includes(item.id) ? "Hapus" : "Favorit"}
                            </Button>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}