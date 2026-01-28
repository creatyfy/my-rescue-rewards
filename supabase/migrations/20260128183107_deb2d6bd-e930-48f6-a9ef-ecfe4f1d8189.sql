-- Add missing columns to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS tipo text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS arquivada boolean DEFAULT false;