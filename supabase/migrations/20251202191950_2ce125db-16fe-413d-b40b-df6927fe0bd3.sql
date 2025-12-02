-- Create swap_requests table for NYSC Item Swap Platform
CREATE TABLE public.swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  item_type TEXT NOT NULL,
  have_size TEXT NOT NULL,
  want_size TEXT NOT NULL,
  camp TEXT,
  secret_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read swap requests (needed for matching)
CREATE POLICY "Anyone can read swap requests"
ON public.swap_requests
FOR SELECT
USING (true);

-- Policy: Anyone can insert swap requests (no auth required)
CREATE POLICY "Anyone can insert swap requests"
ON public.swap_requests
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can update swap requests (validation via secret_code in app layer)
CREATE POLICY "Anyone can update swap requests"
ON public.swap_requests
FOR UPDATE
USING (true);

-- Policy: Anyone can delete swap requests (validation via secret_code in app layer)
CREATE POLICY "Anyone can delete swap requests"
ON public.swap_requests
FOR DELETE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_swap_requests_phone ON public.swap_requests(phone);
CREATE INDEX idx_swap_requests_item_type ON public.swap_requests(item_type);