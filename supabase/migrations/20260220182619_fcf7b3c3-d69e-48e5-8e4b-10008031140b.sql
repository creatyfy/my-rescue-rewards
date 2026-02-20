
-- Create campaigns table
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  store_id uuid REFERENCES public.establishments(id) ON DELETE SET NULL,
  admin_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'disparada'
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Only admins can select campaigns
CREATE POLICY "Campaigns: admins select"
  ON public.campaigns
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert campaigns
CREATE POLICY "Campaigns: admins insert"
  ON public.campaigns
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete campaigns
CREATE POLICY "Campaigns: admins delete"
  ON public.campaigns
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
