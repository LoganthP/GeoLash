-- Consolidated Schema for GeoLash
-- Includes all previous migrations and fixes as of 2026-02-07

-- 0. CLEANUP (Ensures script is re-runnable)
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();
    DROP FUNCTION IF EXISTS public.log_role_change();
    DROP FUNCTION IF EXISTS public.update_updated_at_column();
    
    DROP TABLE IF EXISTS public.notifications;
    DROP TABLE IF EXISTS public.role_audit_log;
    DROP TABLE IF EXISTS public.disputes;
    DROP TABLE IF EXISTS public.documents;
    DROP TABLE IF EXISTS public.ownership_history;
    DROP TABLE IF EXISTS public.land_records;
    DROP TABLE IF EXISTS public.user_roles;
    DROP TABLE IF EXISTS public.profiles;
    
    -- Drop type if exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        DROP TYPE public.app_role;
    END IF;
END $$;

-- 1. ENUMS (Updated to include all roles)
CREATE TYPE public.app_role AS ENUM ('admin', 'officer', 'citizen', 'manager', 'employee');

-- 2. TABLES

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  UNIQUE (user_id, role)
);

-- Land Records
CREATE TABLE public.land_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_number TEXT NOT NULL UNIQUE,
  khasra_number TEXT,
  owner_name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  father_name TEXT,
  area_acres NUMERIC(10, 4) NOT NULL,
  area_hectares NUMERIC(10, 4),
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  land_type TEXT DEFAULT 'agricultural',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'disputed')),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  polygon_coordinates JSONB,
  registration_date DATE DEFAULT CURRENT_DATE,
  market_value NUMERIC(15, 2),
  government_value NUMERIC(15, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Ownership History
CREATE TABLE public.ownership_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  land_record_id UUID REFERENCES public.land_records(id) ON DELETE CASCADE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('purchase', 'inheritance', 'gift', 'partition', 'government_allotment')),
  transfer_date DATE NOT NULL,
  document_number TEXT,
  consideration_amount NUMERIC(15, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  land_record_id UUID REFERENCES public.land_records(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('sale_deed', 'mutation', 'registry', 'title_deed', 'encumbrance', 'map', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disputes
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  land_record_id UUID REFERENCES public.land_records(id) ON DELETE CASCADE NOT NULL,
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('boundary', 'ownership', 'inheritance', 'encroachment', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  filed_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  filed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resolution_date DATE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit Log
CREATE TABLE public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_role app_role,
  new_role app_role,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


-- 3. STORAGE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'land-documents',
  'land-documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);


-- 4. RLS POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins and officers can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer'));

-- User Roles Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins and officers can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role));

-- Land Records Policies
CREATE POLICY "Anyone can view verified land records" ON public.land_records FOR SELECT USING (status = 'verified' OR auth.uid() = owner_id OR auth.uid() = created_by);
CREATE POLICY "Authenticated users can view all land records" ON public.land_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Officers and admins can insert land records" ON public.land_records FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer') OR auth.uid() IS NOT NULL);
CREATE POLICY "Officers and admins can update land records" ON public.land_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer') OR auth.uid() = created_by);
CREATE POLICY "Officers and admins can delete land records" ON public.land_records FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role) OR (auth.uid() = created_by));

-- Ownership History Policies
CREATE POLICY "Anyone can view ownership history" ON public.ownership_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Officers and admins can manage ownership history" ON public.ownership_history FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer'));

-- Documents Policies
CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upload documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Officers and admins can verify documents" ON public.documents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer'));
CREATE POLICY "Officers and admins can delete documents" ON public.documents FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role) OR auth.uid() = uploaded_by);

-- Disputes Policies
CREATE POLICY "Users can view their own disputes" ON public.disputes FOR SELECT TO authenticated USING (auth.uid() = filed_by OR auth.uid() = assigned_to OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer'));
CREATE POLICY "Authenticated users can file disputes" ON public.disputes FOR INSERT TO authenticated WITH CHECK (auth.uid() = filed_by);
CREATE POLICY "Officers and admins can update disputes" ON public.disputes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'officer') OR auth.uid() = filed_by);

-- Audit Log Policies
CREATE POLICY "Admins and officers can view audit logs" ON public.role_audit_log FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role));

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Authorized users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role));

-- Storage Policies
CREATE POLICY "Anyone can view land documents" ON storage.objects FOR SELECT USING (bucket_id = 'land-documents');
CREATE POLICY "Authenticated users can upload land documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'land-documents');
CREATE POLICY "Users can update their own uploads" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'land-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'land-documents' AND auth.uid()::text = (storage.foldername(name))[1]);


-- 5. FUNCTIONS & TRIGGERS

-- Updated At Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Updated At Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_land_records_updated_at BEFORE UPDATE ON public.land_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Role Change Logging Function (Final Version)
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role, action)
    VALUES (NEW.user_id, COALESCE(auth.uid(), NEW.user_id), NULL, NEW.role, 'INSERT');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role, action)
    VALUES (NEW.user_id, COALESCE(auth.uid(), NEW.user_id), OLD.role, NEW.role, 'UPDATE');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit_log (user_id, changed_by, old_role, new_role, action)
    VALUES (OLD.user_id, COALESCE(auth.uid(), OLD.user_id), OLD.role, NULL, 'DELETE');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Role Change Trigger
CREATE TRIGGER role_change_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- New User Handler Function (Final Version with Dynamic Admin fix)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role public.app_role;
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Check for requested role in metadata, default to citizen
  BEGIN
    requested_role := (NEW.raw_user_meta_data->>'app_role')::public.app_role;
  EXCEPTION WHEN OTHERS THEN
    requested_role := 'citizen'::public.app_role;
  END;
  
  -- Defensive check
  IF requested_role IS NULL THEN
    requested_role := 'citizen';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth User Created Trigger
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. INDEXES
CREATE INDEX idx_land_records_survey ON public.land_records(survey_number);
CREATE INDEX idx_land_records_owner ON public.land_records(owner_name);
CREATE INDEX idx_land_records_district ON public.land_records(district);
CREATE INDEX idx_land_records_status ON public.land_records(status);
CREATE INDEX idx_disputes_case_number ON public.disputes(case_number);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;
