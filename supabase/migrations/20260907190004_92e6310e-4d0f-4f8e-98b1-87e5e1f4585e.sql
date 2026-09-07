
CREATE TABLE public.journey_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text,
  license_status text not null default 'approved',
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.journey_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.journey_books(id) on delete cascade,
  number integer not null,
  title text not null,
  sequence integer not null default 0,
  created_at timestamptz not null default now()
);

CREATE TABLE public.journey_sections (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.journey_books(id) on delete cascade,
  chapter_id uuid not null references public.journey_chapters(id) on delete cascade,
  number integer not null,
  title text not null,
  content text not null,
  estimated_minutes integer not null default 5,
  topic text,
  theme text,
  tags text[] not null default '{}',
  sequence integer not null default 0,
  source_locator text,
  has_audio boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX journey_sections_seq_idx ON public.journey_sections(book_id, sequence);

CREATE TABLE public.journey_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  personalization_enabled boolean not null default true,
  frequency text not null default 'every_few_days',
  channels jsonb not null default '{"in_app": true, "email": false, "whatsapp": false}'::jsonb,
  topics text[] not null default '{}',
  paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.journey_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid not null references public.journey_sections(id) on delete cascade,
  state text not null default 'QUEUED',
  reason_codes text[] not null default '{}',
  relevance_note text,
  confidence numeric not null default 0,
  sent_at timestamptz,
  last_reminder_at timestamptz,
  reminder_count integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX journey_items_user_idx ON public.journey_items(user_id, state);
CREATE UNIQUE INDEX journey_items_user_section_idx ON public.journey_items(user_id, section_id);

CREATE TABLE public.journey_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_type text not null,
  signal_key text not null,
  signal_value text,
  confidence numeric not null default 0.5,
  evidence jsonb not null default '[]'::jsonb,
  frequency integer not null default 1,
  status text not null default 'active',
  last_observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE UNIQUE INDEX journey_signals_unique_idx ON public.journey_signals(user_id, signal_type, signal_key);

CREATE TABLE public.journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.journey_items(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
CREATE INDEX journey_events_user_idx ON public.journey_events(user_id, created_at desc);

GRANT SELECT ON public.journey_books TO authenticated;
GRANT SELECT ON public.journey_chapters TO authenticated;
GRANT SELECT ON public.journey_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_signals TO authenticated;
GRANT SELECT, INSERT ON public.journey_events TO authenticated;
GRANT ALL ON public.journey_books, public.journey_chapters, public.journey_sections,
  public.journey_preferences, public.journey_items, public.journey_signals, public.journey_events TO service_role;

ALTER TABLE public.journey_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read approved books" ON public.journey_books FOR SELECT TO authenticated USING (is_approved);
CREATE POLICY "Admins manage books" ON public.journey_books FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members read chapters" ON public.journey_chapters FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.journey_books b WHERE b.id = book_id AND b.is_approved));
CREATE POLICY "Admins manage chapters" ON public.journey_chapters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members read approved sections" ON public.journey_sections FOR SELECT TO authenticated
  USING (is_approved AND EXISTS (SELECT 1 FROM public.journey_books b WHERE b.id = book_id AND b.is_approved));
CREATE POLICY "Admins manage sections" ON public.journey_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Own preferences" ON public.journey_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own journey items" ON public.journey_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own signals" ON public.journey_signals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own journey events read" ON public.journey_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Own journey events insert" ON public.journey_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER journey_books_updated BEFORE UPDATE ON public.journey_books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER journey_sections_updated BEFORE UPDATE ON public.journey_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER journey_preferences_updated BEFORE UPDATE ON public.journey_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER journey_items_updated BEFORE UPDATE ON public.journey_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER journey_signals_updated BEFORE UPDATE ON public.journey_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
