import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHotels from "./AdminHotels";
import AdminAirlines from "./AdminAirlines";

export default function AdminMasterData() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Master Data</h1>
        <p className="text-muted-foreground">Kelola data hotel, maskapai, bandara, dan muthawif</p>
      </div>

      <Tabs defaultValue="hotels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hotels">Hotel</TabsTrigger>
          <TabsTrigger value="airlines">Maskapai</TabsTrigger>
        </TabsList>
        <TabsContent value="hotels"><AdminHotels /></TabsContent>
        <TabsContent value="airlines"><AdminAirlines /></TabsContent>
      </Tabs>
    </div>
  );
}
