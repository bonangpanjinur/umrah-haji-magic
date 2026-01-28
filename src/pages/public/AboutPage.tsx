import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { DynamicPublicLayout } from '@/components/layout/DynamicPublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, Users, Award, Target, Heart, Shield, 
  MapPin, Phone, Mail, Clock, Star, CheckCircle2 
} from 'lucide-react';

export default function AboutPage() {
  const { data: settings, isLoading } = useWebsiteSettings();

  if (isLoading) {
    return (
      <DynamicPublicLayout>
        <div className="container mx-auto px-4 py-16 space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DynamicPublicLayout>
    );
  }

  const companyName = settings?.company_name || 'UmrohTravel';
  const tagline = settings?.tagline || 'Perjalanan Suci Anda';
  const phone = settings?.footer_phone || '+62 21 1234 5678';
  const email = settings?.footer_email || 'info@umrohtravel.com';
  const address = settings?.footer_address || 'Jakarta, Indonesia';

  const values = [
    {
      icon: Heart,
      title: 'Amanah',
      description: 'Kami menjalankan setiap perjalanan dengan penuh tanggung jawab dan kejujuran.'
    },
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Puluhan tahun pengalaman melayani jamaah dengan standar kualitas terbaik.'
    },
    {
      icon: Users,
      title: 'Profesional',
      description: 'Tim berpengalaman yang siap melayani dengan sepenuh hati.'
    },
    {
      icon: Star,
      title: 'Berkualitas',
      description: 'Layanan premium dengan fasilitas terbaik untuk kenyamanan ibadah Anda.'
    },
  ];

  const stats = [
    { value: '15+', label: 'Tahun Pengalaman' },
    { value: '50.000+', label: 'Jamaah Terlayani' },
    { value: '100+', label: 'Keberangkatan/Tahun' },
    { value: '4.9/5', label: 'Rating Kepuasan' },
  ];

  const milestones = [
    { year: '2009', event: 'Didirikan sebagai biro perjalanan umroh' },
    { year: '2012', event: 'Mendapatkan izin resmi Kemenag RI' },
    { year: '2015', event: 'Melayani 10.000 jamaah pertama' },
    { year: '2018', event: 'Ekspansi ke 10 cabang di seluruh Indonesia' },
    { year: '2021', event: 'Meluncurkan sistem digital booking' },
    { year: '2024', event: 'Mencapai 50.000+ jamaah terlayani' },
  ];

  return (
    <DynamicPublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Building2 className="h-3 w-3 mr-1" />
              Tentang Kami
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {companyName}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {tagline}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kami adalah biro perjalanan umroh dan haji terpercaya yang berkomitmen 
              memberikan layanan terbaik untuk perjalanan ibadah Anda ke Tanah Suci.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Visi</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Menjadi biro perjalanan umroh dan haji terdepan di Indonesia yang 
                  memberikan pelayanan terbaik dengan standar internasional, serta 
                  menjadi mitra terpercaya umat Islam dalam menunaikan ibadah ke Tanah Suci.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Misi</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    Memberikan layanan umroh dan haji berkualitas tinggi
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    Menyediakan pembimbing ibadah yang kompeten
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    Mengutamakan kenyamanan dan keamanan jamaah
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    Inovasi teknologi untuk kemudahan jamaah
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prinsip yang menjadi fondasi setiap layanan yang kami berikan
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Perjalanan Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Milestone penting dalam sejarah {companyName}
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2" />
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`relative flex items-center gap-4 mb-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-12 md:pl-0`}>
                    <Card>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{milestone.year}</Badge>
                        <p className="text-sm text-muted-foreground">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary transform md:-translate-x-1/2 z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tim kami siap membantu Anda merencanakan perjalanan ibadah
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Alamat</h3>
                <p className="text-sm text-muted-foreground">{address}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Telepon</h3>
                <p className="text-sm text-muted-foreground">{phone}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Jam Operasional</h3>
                <p className="text-sm text-muted-foreground">Senin - Sabtu<br />08:00 - 17:00 WIB</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </DynamicPublicLayout>
  );
}