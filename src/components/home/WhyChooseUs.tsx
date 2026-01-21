import { Shield, Award, Clock, HeartHandshake, Building2, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Izin Resmi Kemenag',
    description: 'Terdaftar dan berizin resmi dari Kementerian Agama RI dengan nomor PPIU yang valid.',
  },
  {
    icon: Award,
    title: 'Pengalaman 15+ Tahun',
    description: 'Lebih dari 15 tahun pengalaman memberangkatkan jamaah umroh dan haji dengan aman.',
  },
  {
    icon: Building2,
    title: 'Hotel Bintang 5',
    description: 'Akomodasi terbaik dengan hotel bintang 5 dekat Masjidil Haram dan Masjid Nabawi.',
  },
  {
    icon: HeartHandshake,
    title: 'Muthawif Berpengalaman',
    description: 'Pembimbing ibadah profesional yang akan mendampingi selama perjalanan.',
  },
  {
    icon: Clock,
    title: 'Jadwal Fleksibel',
    description: 'Berbagai pilihan jadwal keberangkatan yang bisa disesuaikan dengan waktu Anda.',
  },
  {
    icon: Headphones,
    title: 'Layanan 24/7',
    description: 'Tim customer service siap membantu Anda kapan saja sebelum dan selama perjalanan.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Mengapa Memilih Kami
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Keunggulan Layanan Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kami berkomitmen memberikan pelayanan terbaik untuk perjalanan ibadah Anda
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
