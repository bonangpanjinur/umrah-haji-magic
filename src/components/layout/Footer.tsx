import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const footerLinks = {
  layanan: [
    { href: '/packages', label: 'Paket Umroh' },
    { href: '/packages?type=haji', label: 'Paket Haji' },
    { href: '/departures', label: 'Jadwal Keberangkatan' },
    { href: '/visa', label: 'Layanan Visa' },
  ],
  informasi: [
    { href: '/about', label: 'Tentang Kami' },
    { href: '/faq', label: 'FAQ' },
    { href: '/terms', label: 'Syarat & Ketentuan' },
    { href: '/privacy', label: 'Kebijakan Privasi' },
  ],
  panduan: [
    { href: '/manasik', label: 'Panduan Manasik' },
    { href: '/checklist', label: 'Checklist Perlengkapan' },
    { href: '/tips', label: 'Tips Perjalanan' },
    { href: '/blog', label: 'Blog & Artikel' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="font-display text-xl font-bold">ع</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">UmrohTravel</h2>
                <p className="text-xs text-sidebar-foreground/70">Perjalanan Suci Anda</p>
              </div>
            </Link>
            <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
              Melayani perjalanan ibadah Umroh dan Haji sejak 2010. Kami berkomitmen memberikan 
              pengalaman ibadah yang nyaman, aman, dan penuh kekhusyukan.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <a 
                href="tel:+628001234567" 
                className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-primary"
              >
                <Phone className="h-4 w-4" />
                0800-123-4567
              </a>
              <a 
                href="mailto:info@umrohtravel.com" 
                className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-primary"
              >
                <Mail className="h-4 w-4" />
                info@umrohtravel.com
              </a>
              <div className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Jl. Masjid Raya No. 123, Jakarta Pusat 10110
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 flex gap-4">
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground transition-colors hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground transition-colors hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground transition-colors hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold">Layanan</h3>
            <ul className="space-y-2">
              {footerLinks.layanan.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Informasi</h3>
            <ul className="space-y-2">
              {footerLinks.informasi.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Panduan</h3>
            <ul className="space-y-2">
              {footerLinks.panduan.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-sidebar-foreground/70 md:flex-row md:text-left">
            <p>© 2024 UmrohTravel. Semua hak dilindungi.</p>
            <p>Izin Resmi Kemenag RI: D/123/2024</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
