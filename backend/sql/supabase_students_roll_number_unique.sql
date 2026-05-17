-- Roll numbers are unique per (school + class), not per whole school.
-- Class 1 may have roll 2 and class 5 may also have roll 2.
-- Run in Supabase → SQL Editor (backup first).
--
-- Removes legacy unique-on-roll-only rules, then enforces (school_id, class, roll_number).

ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_roll_number_key;

DROP INDEX IF EXISTS public.students_school_id_roll_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS students_school_class_roll_number_key
  ON public.students (school_id, class, roll_number);
