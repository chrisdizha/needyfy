
-- Create the equipment_documents table to store document metadata
CREATE TABLE public.equipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  date_uploaded TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date DATE,
  file_name TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.equipment_documents ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own documents
CREATE POLICY "Providers can view their documents" 
  ON public.equipment_documents 
  FOR SELECT 
  USING (uploaded_by = auth.uid());

-- Allow users to add their own documents
CREATE POLICY "Providers can insert their documents" 
  ON public.equipment_documents 
  FOR INSERT 
  WITH CHECK (uploaded_by = auth.uid());

-- Allow users to delete their own documents
CREATE POLICY "Providers can delete their documents"
  ON public.equipment_documents
  FOR DELETE
  USING (uploaded_by = auth.uid());

-- Allow users to update their own documents
CREATE POLICY "Providers can update their documents"
  ON public.equipment_documents
  FOR UPDATE
  USING (uploaded_by = auth.uid());

-- (Admin access can be added later as needed)

-- Create a new private storage bucket for equipment documents
insert into storage.buckets (id, name, public)
values ('equipment-documents', 'equipment-documents', false);

