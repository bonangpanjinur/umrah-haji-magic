import { useState } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PackageSearchProps {
  onSearch: (searchTerm: string, packageType: string) => void;
}

export function PackageSearch({ onSearch }: PackageSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [packageType, setPackageType] = useState('all');

  const handleSearch = () => {
    onSearch(searchTerm, packageType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-lg md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Search Input */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Cari Paket
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nama paket atau tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
        </div>

        {/* Package Type */}
        <div className="w-full md:w-48">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Jenis Paket
          </label>
          <Select value={packageType} onValueChange={setPackageType}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="umroh">Umroh</SelectItem>
              <SelectItem value="umroh_plus">Umroh Plus</SelectItem>
              <SelectItem value="haji">Haji Reguler</SelectItem>
              <SelectItem value="haji_plus">Haji Plus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} size="lg" className="gap-2">
          <Search className="h-4 w-4" />
          Cari Paket
        </Button>
      </div>
    </div>
  );
}
