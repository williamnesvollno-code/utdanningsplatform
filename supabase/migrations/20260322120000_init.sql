-- Kjør denne i Supabase: SQL Editor → New query → Paste → Run
-- Eller: supabase db push (hvis du bruker Supabase CLI)
--
-- Viktig: Tabellen profiles må opprettes FØR funksjonen requesting_user_role(),
-- ellers feiler PostgreSQL med «relation profiles does not exist».

-- Profiler (kobles til auth.users) — må komme først
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null default '',
  role text not null default 'student' check (role in ('teacher', 'student', 'admin')),
  school text default 'Min skole',
  class_name text,
  grade text,
  avatar_initials text default '??',
  subjects text[] default '{}',
  classes text[] default '{}',
  skill_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Hjelpefunksjon for RLS (krever at profiles finnes)
create or replace function public.requesting_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;

create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.requesting_user_role() in ('teacher', 'admin')
  );

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_update"
  on public.profiles for update
  to authenticated
  using (public.requesting_user_role() = 'admin')
  with check (true);

-- Ny bruker → rad i profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role, school, class_name, grade, avatar_initials, subjects, classes)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'school', 'Min skole'),
    nullif(new.raw_user_meta_data ->> 'class_name', ''),
    nullif(new.raw_user_meta_data ->> 'grade', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_initials', ''),
      upper(left(split_part(new.email, '@', 1), 2))
    ),
    case
      when jsonb_typeof(new.raw_user_meta_data -> 'subjects') = 'array'
        then array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'subjects'))
      else '{}'::text[]
    end,
    case
      when jsonb_typeof(new.raw_user_meta_data -> 'classes') = 'array'
        then array(select jsonb_array_elements_text(new.raw_user_meta_data -> 'classes'))
      else '{}'::text[]
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Oppgaver
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null default '',
  type text not null default 'flervalg',
  status text not null default 'Aktiv',
  class_name text not null default '10A',
  due_date text not null default '',
  difficulty int not null default 3,
  icon text default '📄',
  description text default '',
  questions jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists assignments_created_at_idx on public.assignments (created_at desc);

alter table public.assignments enable row level security;

create policy "assignments_select"
  on public.assignments for select
  to authenticated
  using (true);

create policy "assignments_insert"
  on public.assignments for insert
  to authenticated
  with check (
    public.requesting_user_role() in ('teacher', 'admin')
    and created_by = auth.uid()
  );

create policy "assignments_insert_student_ai"
  on public.assignments for insert
  to authenticated
  with check (
    public.requesting_user_role() = 'student'
    and ai_generated is true
    and created_by = auth.uid()
  );

create policy "assignments_update"
  on public.assignments for update
  to authenticated
  using (
    created_by = auth.uid()
    or public.requesting_user_role() = 'admin'
  );

create policy "assignments_delete"
  on public.assignments for delete
  to authenticated
  using (
    created_by = auth.uid()
    or public.requesting_user_role() = 'admin'
  );

-- Innleveringer
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  score int not null default 0,
  submitted_at timestamptz not null default now()
);

create index if not exists submissions_student_idx on public.submissions (student_id);
create index if not exists submissions_assignment_idx on public.submissions (assignment_id);

alter table public.submissions enable row level security;

create policy "submissions_select"
  on public.submissions for select
  to authenticated
  using (
    student_id = auth.uid()
    or public.requesting_user_role() in ('teacher', 'admin')
  );

create policy "submissions_insert"
  on public.submissions for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and public.requesting_user_role() = 'student'
  );

-- Demo-oppgaver (JSON i dollar-quotes unngår feil med " inni tekst)
insert into public.assignments (id, title, subject, type, status, class_name, due_date, difficulty, icon, questions, created_by, ai_generated)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    'Brøkregning – Del 1',
    'Matematikk',
    'flervalg',
    'Aktiv',
    '10A',
    '2026-03-25',
    3,
    '📐',
    $a1$
[
  {"id":"q1","type":"flervalg","text":"Hva er 3/4 + 1/4?","options":["1/2","4/8","1","3/8"],"correct":2},
  {"id":"q2","type":"flervalg","text":"Hva er 2/3 av 12?","options":["4","6","8","9"],"correct":2},
  {"id":"q3","type":"flervalg","text":"Forenkle: 6/9","options":["3/4","2/3","1/2","5/8"],"correct":1}
]
$a1$::jsonb,
    null,
    false
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Norsk Grammatikk – Setningsledd',
    'Norsk',
    'kort svar',
    'Aktiv',
    '10A',
    '2026-03-22',
    2,
    '📝',
    $a2$
[
  {"id":"q4","type":"kort svar","text":"Hva er subjektet i setningen: \"Hunden løper fort\"?","correct":"Hunden"},
  {"id":"q5","type":"kort svar","text":"Hva kalles verbet i en setning?","correct":"Predikat"}
]
$a2$::jsonb,
    null,
    false
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Python Basis – Variabler og løkker',
    'Programmering',
    'kode',
    'Kommende',
    '10B',
    '2026-03-28',
    4,
    '💻',
    $a3$
[
  {"id":"q6","type":"kode","text":"Skriv et Python-program som skriver ut tallene 1 til 10 med en for-løkke.","starterCode":"for i in range(...):\n    print(...)","correct":"for i in range(1, 11):\n    print(i)"}
]
$a3$::jsonb,
    null,
    false
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Celle og Arv – Biologi',
    'Naturfag',
    'flervalg',
    'Vurdert',
    '9A',
    '2026-03-15',
    3,
    '🔬',
    $a4$
[
  {"id":"q7","type":"flervalg","text":"Hva er cellens \"kraftverk\"?","options":["Cellekjernen","Mitokondrien","Ribosomer","Golgi-apparatet"],"correct":1}
]
$a4$::jsonb,
    null,
    false
  )
on conflict (id) do nothing;
