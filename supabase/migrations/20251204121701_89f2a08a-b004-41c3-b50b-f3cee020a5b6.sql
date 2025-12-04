-- Add security question fields to swap_requests table
ALTER TABLE public.swap_requests 
ADD COLUMN security_question text,
ADD COLUMN security_answer text;