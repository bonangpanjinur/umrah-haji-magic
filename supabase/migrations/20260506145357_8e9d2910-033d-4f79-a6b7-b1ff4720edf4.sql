
-- ============ menu_items ============
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(150) NOT NULL,
  path VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  group_name VARCHAR(100) NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  required_permission VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_items readable by authenticated" ON public.menu_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "menu_items manage by super_admin" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'owner'));

CREATE TRIGGER trg_menu_items_updated
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ package_types ============
CREATE TABLE IF NOT EXISTS public.package_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.package_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "package_types public read" ON public.package_types
  FOR SELECT USING (true);
CREATE POLICY "package_types manage by admin" ON public.package_types
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_package_types_updated
  BEFORE UPDATE ON public.package_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ company_features ============
CREATE TABLE IF NOT EXISTS public.company_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_features public read" ON public.company_features
  FOR SELECT USING (true);
CREATE POLICY "company_features manage by admin" ON public.company_features
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_company_features_updated
  BEFORE UPDATE ON public.company_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
