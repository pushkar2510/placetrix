-- Revert central associated_institute_id from profiles and add it to role tables
-- Add institute_id back to candidate_profiles if it was removed
ALTER TABLE public.candidate_profiles ADD COLUMN IF NOT EXISTS institute_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Migrate data from profiles back to candidate_profiles before dropping
UPDATE public.candidate_profiles cp
SET institute_id = p.associated_institute_id
FROM public.profiles p
WHERE cp.profile_id = p.id
  AND p.associated_institute_id IS NOT NULL
  AND cp.institute_id IS NULL;

-- Create staff_profiles
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  institute_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure institute_id exists if the table was already created without it
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS institute_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create tpo_profiles
CREATE TABLE IF NOT EXISTS public.tpo_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  institute_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure institute_id exists if the table was already created without it
ALTER TABLE public.tpo_profiles ADD COLUMN IF NOT EXISTS institute_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate staff data
INSERT INTO public.staff_profiles (profile_id, institute_id)
SELECT id, associated_institute_id FROM public.profiles 
WHERE account_type = 'institute' AND account_subtype = 'staff' AND associated_institute_id IS NOT NULL
ON CONFLICT (profile_id) DO UPDATE SET institute_id = EXCLUDED.institute_id;

-- Migrate tpo data
INSERT INTO public.tpo_profiles (profile_id, institute_id)
SELECT id, associated_institute_id FROM public.profiles 
WHERE account_type = 'institute' AND account_subtype = 'tpo' AND associated_institute_id IS NOT NULL
ON CONFLICT (profile_id) DO UPDATE SET institute_id = EXCLUDED.institute_id;

-- Now drop associated_institute_id from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS associated_institute_id;

-- Update placement_management_view to use candidate_profiles.institute_id
DROP VIEW IF EXISTS public.placement_management_view;
CREATE OR REPLACE VIEW public.placement_management_view AS
 SELECT cp.profile_id,
    cp.institute_id,
    p.display_name,
    cp.course_name,
    cp.passout_year,
    pt.company_name,
    pt.ctc
   FROM candidate_profiles cp
     JOIN profiles p ON p.id = cp.profile_id
     LEFT JOIN pt_mt_info pt ON pt.candidate_uuid = cp.profile_id;
