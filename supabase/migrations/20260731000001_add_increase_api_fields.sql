-- Add Increase API fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN increase_entity_id TEXT,
  ADD COLUMN increase_account_id TEXT;
