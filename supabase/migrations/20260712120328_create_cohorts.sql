-- ============================================================
-- Migration: create_cohorts
-- Creates cohort system tables and seeds existing data
-- ============================================================

-- 1. COHORTS TABLE
CREATE TABLE IF NOT EXISTS public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_cohort_name_per_institute UNIQUE (institute_id, name)
);

-- 2. COHORT_STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.cohort_students (
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cohort_id, student_id)
);

-- 3. EVENT_COHORTS TABLE
CREATE TABLE IF NOT EXISTS public.event_cohorts (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, cohort_id)
);

-- 4. OPPORTUNITY_COHORTS TABLE
CREATE TABLE IF NOT EXISTS public.opportunity_cohorts (
  opportunity_id uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, cohort_id)
);

-- 5. TEST_COHORTS TABLE
CREATE TABLE IF NOT EXISTS public.test_cohorts (
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  PRIMARY KEY (test_id, cohort_id)
);

-- ============================================================
-- SEED: "PVG STUDENTS" cohort for all existing institutes
-- ============================================================
DO $$
DECLARE
  v_institute_id uuid;
  v_cohort_id uuid;
BEGIN
  FOR v_institute_id IN SELECT id FROM public.institutes LOOP
    INSERT INTO public.cohorts (institute_id, name, description)
    VALUES (
      v_institute_id,
      'PVG STUDENTS',
      'Default cohort containing all existing students of the institute'
    )
    ON CONFLICT (institute_id, name) DO NOTHING
    RETURNING id INTO v_cohort_id;

    IF v_cohort_id IS NULL THEN
      SELECT id INTO v_cohort_id FROM public.cohorts
      WHERE institute_id = v_institute_id AND name = 'PVG STUDENTS';
    END IF;

    INSERT INTO public.cohort_students (cohort_id, student_id)
    SELECT v_cohort_id, id FROM public.profiles
    WHERE institute_id = v_institute_id AND account_type = 'institute_candidate'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.event_cohorts (event_id, cohort_id)
    SELECT id, v_cohort_id FROM public.events WHERE institute_id = v_institute_id
    ON CONFLICT DO NOTHING;

    INSERT INTO public.opportunity_cohorts (opportunity_id, cohort_id)
    SELECT id, v_cohort_id FROM public.opportunities WHERE institute_id = v_institute_id
    ON CONFLICT DO NOTHING;

    INSERT INTO public.test_cohorts (test_id, cohort_id)
    SELECT id, v_cohort_id FROM public.tests WHERE institute_id = v_institute_id
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 6. RPC: GET STUDENTS NOT IN COHORT
CREATE OR REPLACE FUNCTION public.get_students_not_in_cohort(p_cohort_id uuid, p_search text DEFAULT ''::text)
 RETURNS TABLE(student_id uuid, full_name text, email text, avatar_path text, account_type text, course_name text, passout_year integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as student_id,
    p.full_name,
    p.email,
    p.avatar_path,
    p.account_type::text,
    ic.course_name,
    cad.passout_year::integer
  FROM public.profiles p
  LEFT JOIN public.candidate_academic_details cad ON cad.profile_id = p.id
  LEFT JOIN public.institute_courses ic ON ic.id = cad.course_id
  WHERE p.institute_id = (SELECT institute_id FROM public.cohorts WHERE id = p_cohort_id)
    AND p.account_type = 'institute_candidate'
    AND NOT EXISTS (
      SELECT 1 FROM public.cohort_students cs 
      WHERE cs.cohort_id = p_cohort_id AND cs.student_id = p.id
    )
    AND (
      p_search = '' OR 
      p.full_name ILIKE '%' || p_search || '%' OR 
      p.email ILIKE '%' || p_search || '%'
    )
  ORDER BY p.full_name ASC
  LIMIT 50;
END;
$function$;
