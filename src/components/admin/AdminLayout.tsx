import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette } from "./CommandPalette";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { 
  LayoutDashboard, Package, Users, Calendar, CreditCard, 
  Settings, LogOut, Menu, X, Shield, UserCheck,
  FileBarChart, BarChart3, Target, KeyRound, BedDouble, Plane, Box,
  Wallet, FileCheck, Building2, DollarSign, Truck, Gift,
  Banknote, Clock, Briefcase, Smartphone,
  HeadphonesIcon, Palette, ShieldCheck, Key, MessageSquare,
  UserCog, BookOpen, MapPin, TrendingUp, FileText, Share2, Search,
  FileType, Star, ExternalLink, ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';

interface NavItem {
  label: string;
  icon: any;
  path: string;
  permissionKey?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Navigation groups with permissionKey per item
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', permissionKey: 'dashboard' },
      { label: 'Analytics', icon: BarChart3, path: '/admin/analytics', permissionKey: 'analytics' },
    ]
  },
  {
    label: 'Sales & CRM',
    items: [
      { label: 'CRM Leads', icon: Target, path: '/admin/leads', permissionKey: 'leads' },
      { label: 'Kupon', icon: Gift, path: '/admin/coupons', permissionKey: 'coupons' },
    ]
  },
  {
    label: 'Produk & Operasional',
    items: [
      { label: 'Paket', icon: Package, path: '/admin/packages', permissionKey: 'packages' },
      { label: 'Keberangkatan', icon: Plane, path: '/admin/departures', permissionKey: 'departures' },
      { label: 'Booking', icon: Calendar, path: '/admin/bookings', permissionKey: 'bookings' },
      { label: 'Perlengkapan', icon: Box, path: '/admin/equipment', permissionKey: 'equipment' },
      { label: 'Template Itinerary', icon: MapPin, path: '/admin/itinerary-templates', permissionKey: 'itinerary_templates' },
      { label: 'Tabungan', icon: Wallet, path: '/admin/savings', permissionKey: 'savings' },
      { label: 'Kamar', icon: BedDouble, path: '/admin/room-assignments', permissionKey: 'room_assignments' },
    ]
  },
  {
    label: 'Keuangan & Akuntansi',
    items: [
      { label: 'Pembayaran', icon: CreditCard, path: '/admin/payments', permissionKey: 'payments' },
      { label: 'Kas & Bank', icon: Wallet, path: '/admin/finance-cash', permissionKey: 'finance_cash' },
      { label: 'Piutang Jamaah', icon: FileText, path: '/admin/finance/ar', permissionKey: 'finance_ar' },
      { label: 'Hutang Vendor', icon: Truck, path: '/admin/finance/ap', permissionKey: 'finance_ap' },
      { label: 'Laporan Laba Rugi', icon: DollarSign, path: '/admin/finance', permissionKey: 'finance_pl' },
    ]
  },
  {
    label: 'Jamaah & Agent',
    items: [
      { label: 'Jamaah', icon: Users, path: '/admin/customers', permissionKey: 'customers' },
      { label: 'Agent', icon: UserCheck, path: '/admin/agents', permissionKey: 'agents' },
      { label: 'Cabang', icon: Building2, path: '/admin/branches', permissionKey: 'branches' },
      { label: 'Loyalty', icon: Gift, path: '/admin/loyalty', permissionKey: 'loyalty' },
      { label: 'Referral', icon: Share2, path: '/admin/referrals', permissionKey: 'referrals' },
      { label: 'Haji', icon: BookOpen, path: '/admin/haji', permissionKey: 'haji' },
      { label: 'Manasik', icon: Calendar, path: '/admin/manasik', permissionKey: 'manasik' },
      { label: 'Visa', icon: FileCheck, path: '/admin/visa', permissionKey: 'visa' },
    ]
  },
  {
    label: 'SDM (HR)',
    items: [
      { label: 'Data Karyawan', icon: UserCog, path: '/admin/hr?tab=employees', permissionKey: 'hr' },
      { label: 'Absensi', icon: Clock, path: '/admin/hr?tab=attendance', permissionKey: 'hr' },
      { label: 'Penggajian / Payroll', icon: Banknote, path: '/admin/hr/payroll', permissionKey: 'payroll' },
      { label: 'Slip Gaji', icon: FileText, path: '/admin/finance-cash?tab=salary', permissionKey: 'payroll' },
      { label: 'Departemen', icon: Building2, path: '/admin/hr?tab=departments', permissionKey: 'hr' },
      { label: 'Posisi', icon: Briefcase, path: '/admin/hr?tab=positions', permissionKey: 'hr' },
      { label: 'Jadwal Kerja', icon: Calendar, path: '/admin/hr?tab=schedules', permissionKey: 'hr' },
      { label: 'Perangkat', icon: Smartphone, path: '/admin/hr?tab=devices', permissionKey: 'hr' },
      { label: 'Pengaturan HR', icon: Settings, path: '/admin/hr?tab=settings', permissionKey: 'hr' },
    ]
  },
  {
    label: 'Support & Komunikasi',
    items: [
      { label: 'Tiket Support', icon: HeadphonesIcon, path: '/admin/support', permissionKey: 'support_tickets' },
      { label: 'WhatsApp', icon: MessageSquare, path: '/admin/whatsapp', permissionKey: 'whatsapp' },
      { label: 'Materi Promosi', icon: FileText, path: '/admin/marketing-materials', permissionKey: 'marketing_materials' },
    ]
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Master Data', icon: Settings, path: '/admin/master-data', permissionKey: 'master_data' },
    ]
  },
  {
    label: 'Dokumen & Surat',
    items: [
      { label: 'Verifikasi Dokumen', icon: FileCheck, path: '/admin/document-verification', permissionKey: 'document_verification' },
      { label: 'Generate Surat', icon: FileText, path: '/admin/documents-generator', permissionKey: 'document_generator' },
      { label: 'Konten Offline', icon: BookOpen, path: '/admin/offline-content', permissionKey: 'offline_content' },
    ]
  },
  {
    label: 'Laporan',
    items: [
      { label: 'Laporan', icon: FileBarChart, path: '/admin/reports', permissionKey: 'reports' },
      { label: 'Laporan Lanjutan', icon: TrendingUp, path: '/admin/advanced-reports', permissionKey: 'reports' },
      { label: 'Laporan Terjadwal', icon: Calendar, path: '/admin/scheduled-reports', permissionKey: 'reports' },
    ]
  },
  {
    label: 'Pengaturan',
    items: [
      { label: 'Users', icon: Shield, path: '/admin/users', permissionKey: 'users' },
      { label: 'Hak Akses', icon: KeyRound, path: '/admin/permissions', permissionKey: 'users' },
      { label: 'Security Audit', icon: ShieldCheck, path: '/admin/security', permissionKey: 'security_audit' },
      { label: '2FA Settings', icon: Key, path: '/admin/2fa', permissionKey: '2fa' },
      { label: 'Tampilan', icon: Palette, path: '/admin/appearance', permissionKey: 'appearance' },
      { label: 'Halaman Statis', icon: FileType, path: '/admin/static-pages', permissionKey: 'static_pages' },
      { label: 'Testimoni', icon: Star, path: '/admin/testimonials', permissionKey: 'testimonials' },
      { label: 'Pengaturan', icon: Settings, path: '/admin/settings', permissionKey: 'settings' },
    ]
  },
];

function AdminLayout() {
  const { user, profile, signOut, roles, isLoading, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Overview', 'Sales & CRM', 'Produk & Operasional']));
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useAdminNotifications();

  const isStaff = roles.some(r => ['super_admin', 'owner', 'branch_manager', 'finance', 'sales', 'marketing', 'operational', 'equipment'].includes(r));

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setIsDesktop(isLargeScreen);
      if (!isLargeScreen) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupExpanded = (groupLabel: string) => {
    return expandedGroups.has(groupLabel);
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || 
      (path !== '/admin' && location.pathname.startsWith(path));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat Navigasi...</p>
        </div>
      </div>
    );
  }

  if (!user || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-muted-foreground mb-4">
            Anda tidak memiliki akses ke halaman admin.
          </p>
          <Button asChild>
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter nav groups: show group only if user has permission to at least 1 item
  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.permissionKey || hasPermission(item.permissionKey)),
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <CommandPalette />

      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-background border-b z-40 flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <Link to="/admin" className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm flex-shrink-0">
              U
            </div>
            <span className="font-semibold hidden xs:inline text-sm sm:text-base truncate">UmrohTravel</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
              document.dispatchEvent(event);
            }}
            title="Cari halaman (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </Button>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
          />
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="hidden md:flex text-xs sm:text-sm"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">Website</span>
            </a>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      <aside className={cn(
        "fixed top-14 sm:top-16 left-0 bottom-0 w-56 sm:w-64 bg-background border-r z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-3 sm:p-4 space-y-2">
            {filteredGroups.map((group) => {
              const isExpanded = isGroupExpanded(group.label);
              const hasActiveItem = group.items.some(item => isPathActive(item.path));
              
              return (
                <div key={group.label} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-semibold",
                      hasActiveItem 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="uppercase tracking-wider text-xs truncate">{group.label}</span>
                    <ChevronDown 
                      className={cn(
                        "h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 flex-shrink-0"
                      )}
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 pl-2 sm:pl-3 border-l border-muted ml-2 sm:ml-3">
                      {group.items.map((item) => {
                        const isActive = isPathActive(item.path);
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                              if (!isDesktop) {
                                setSidebarOpen(false);
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm",
                              isActive 
                                ? "bg-primary text-primary-foreground" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <item.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 sm:p-4 border-t space-y-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-xs sm:text-sm">
                  {profile?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-xs sm:text-sm">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 top-14 sm:top-16" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={cn(
        "pt-14 sm:pt-16 min-h-screen transition-all duration-300",
        sidebarOpen && isDesktop ? "pl-56 sm:pl-64" : "pl-0"
      )}>
        <div className="p-3 sm:p-4 md:p-6">
          <AdminBreadcrumb />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
