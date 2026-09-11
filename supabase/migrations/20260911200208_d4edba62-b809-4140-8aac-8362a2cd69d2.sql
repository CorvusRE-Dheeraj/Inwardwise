ALTER TABLE public.avatar_dimensions
  ADD COLUMN sharing_classification text NOT NULL DEFAULT 'internal_only',
  ADD COLUMN external_share_acknowledged boolean NOT NULL DEFAULT false,
  ADD COLUMN external_share_acknowledged_at timestamp with time zone;

ALTER TABLE public.avatar_dimensions
  ADD CONSTRAINT avatar_dimensions_sharing_classification_check
  CHECK (sharing_classification IN ('internal_only', 'external_approved'));

COMMENT ON COLUMN public.avatar_dimensions.sharing_classification IS
  'User-controlled factor sharing classification. Defaults to internal_only.';
COMMENT ON COLUMN public.avatar_dimensions.external_share_acknowledged IS
  'True only after the user explicitly confirms sharing despite the recommendation.';
COMMENT ON COLUMN public.avatar_dimensions.external_share_acknowledged_at IS
  'Time the user explicitly confirmed external sharing despite the recommendation.';