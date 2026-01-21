import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Haji Ahmad Fauzi',
    location: 'Jakarta',
    package: 'Umroh Reguler 9 Hari',
    rating: 5,
    text: 'Alhamdulillah, perjalanan umroh bersama sangat nyaman. Hotel dekat Masjidil Haram, muthawif sangat baik dalam membimbing ibadah. Terima kasih atas pelayanan terbaiknya.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Ibu Siti Aminah',
    location: 'Surabaya',
    package: 'Umroh Plus Turki 12 Hari',
    rating: 5,
    text: 'MasyaAllah, pengalaman yang luar biasa! Selain beribadah di Tanah Suci, juga bisa mengunjungi Turki. Semua diatur dengan sangat baik dan profesional.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
  {
    name: 'Bapak Ridwan',
    location: 'Bandung',
    package: 'Haji Plus ONH+ 2025',
    rating: 5,
    text: 'Sudah 2 kali berangkat bersama travel ini. Pelayanan konsisten baik, tidak pernah mengecewakan. Sangat direkomendasikan untuk keluarga dan kerabat.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimoni Jamaah
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Cerita Dari Jamaah Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dengarkan pengalaman jamaah yang telah menjalani perjalanan ibadah bersama kami
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location} • {testimonial.package}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
