-- Cleaning App — checklists réutilisables, preuves avant/après, validation
-- Prérequis : 0001_init.sql, 0002_super_admin.sql

-- ============================================================
-- checklist_templates + checklist_items
-- ============================================================
create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates(id) on delete cascade,
  room text not null,                      -- ex: 'Cuisine', 'Salle de bain'
  label text not null,                     -- ex: 'Four et plaques'
  photo_requirement text not null default 'none'
    check (photo_requirement in ('none', 'after', 'before_after')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index checklist_items_template_idx
  on public.checklist_items (template_id, room, position);

alter table public.apartments
  add column template_id uuid references public.checklist_templates(id) on delete set null;

-- ============================================================
-- task_items : copie figée du modèle au moment de l'assignation
-- ============================================================
create table public.task_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  room text not null,
  label text not null,
  photo_requirement text not null default 'none'
    check (photo_requirement in ('none', 'after', 'before_after')),
  position integer not null default 0,
  done_at timestamptz,
  done_by uuid references public.profiles(id) on delete set null
);

create index task_items_task_idx on public.task_items (task_id, room, position);

-- ============================================================
-- Photos : rattachées à un item, typées avant/après
-- ============================================================
alter table public.task_photos
  add column task_item_id uuid references public.task_items(id) on delete cascade,
  add column kind text not null default 'after' check (kind in ('before', 'after'));

create index task_photos_item_idx on public.task_photos (task_item_id, kind);

-- ============================================================
-- Validation par l'admin
-- ============================================================
alter table public.tasks
  add column validated_at timestamptz,
  add column validated_by uuid references public.profiles(id) on delete set null,
  add column redo_reason text;

-- ============================================================
-- Copie automatique des items du modèle à la création d'une tâche
-- ============================================================
create function public.seed_task_items()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.task_items (task_id, room, label, photo_requirement, position)
  select new.id, ci.room, ci.label, ci.photo_requirement, ci.position
  from public.checklist_items ci
  join public.apartments a on a.template_id = ci.template_id
  where a.id = new.apartment_id
  order by ci.room, ci.position;
  return new;
end;
$$;

create trigger on_task_created
  after insert on public.tasks
  for each row execute procedure public.seed_task_items();

-- ============================================================
-- RLS — même logique que 0001 : assigné ou admin (is_admin() couvre
-- déjà admin + super_admin depuis 0002)
-- ============================================================
alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;
alter table public.task_items enable row level security;

create policy "templates: authenticated read" on public.checklist_templates
  for select using (auth.uid() is not null);
create policy "templates: admin write" on public.checklist_templates
  for all using (public.is_admin()) with check (public.is_admin());

create policy "checklist_items: authenticated read" on public.checklist_items
  for select using (auth.uid() is not null);
create policy "checklist_items: admin write" on public.checklist_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "task_items: assignee or admin can select" on public.task_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assigned_to = auth.uid())
  );
create policy "task_items: assignee can tick" on public.task_items
  for update using (
    public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assigned_to = auth.uid())
  );
create policy "task_items: admin can insert" on public.task_items
  for insert with check (public.is_admin());

-- ============================================================
-- Modèles de checklist par défaut (repris du design), pour que l'écran
-- admin/checklists ait du contenu réel dès l'intégration.
-- ============================================================
do $$
declare
  standard_id uuid;
  depart_id uuid;
  grand_id uuid;
begin
  insert into public.checklist_templates (name) values ('Standard') returning id into standard_id;
  insert into public.checklist_templates (name) values ('Départ locataire') returning id into depart_id;
  insert into public.checklist_templates (name) values ('Grand ménage') returning id into grand_id;

  insert into public.checklist_items (template_id, room, label, photo_requirement, position) values
    (standard_id, 'Cuisine', 'Vider le lave-vaisselle', 'none', 1),
    (standard_id, 'Cuisine', 'Plan de travail + évier', 'before_after', 2),
    (standard_id, 'Cuisine', 'Four et plaques', 'before_after', 3),
    (standard_id, 'Salle de bain', 'Miroir et lavabo', 'none', 1),
    (standard_id, 'Salle de bain', 'Douche + joints', 'before_after', 2),
    (standard_id, 'Salle de bain', 'WC', 'after', 3),
    (standard_id, 'Salle de bain', 'Serviettes propres', 'none', 4),
    (standard_id, 'Chambre', 'Changer les draps', 'after', 1),
    (standard_id, 'Chambre', 'Aspirateur et sols', 'none', 2),

    (depart_id, 'Cuisine', 'Vider le lave-vaisselle', 'none', 1),
    (depart_id, 'Cuisine', 'Plan de travail + évier', 'before_after', 2),
    (depart_id, 'Cuisine', 'Four et plaques', 'before_after', 3),
    (depart_id, 'Cuisine', 'Réfrigérateur', 'before_after', 4),
    (depart_id, 'Salle de bain', 'Miroir et lavabo', 'none', 1),
    (depart_id, 'Salle de bain', 'Douche + joints', 'before_after', 2),
    (depart_id, 'Salle de bain', 'WC', 'after', 3),
    (depart_id, 'Chambre', 'Changer les draps', 'after', 1),
    (depart_id, 'Chambre', 'Aspirateur et sols', 'after', 2),
    (depart_id, 'Chambre', 'Placards vides', 'none', 3),
    (depart_id, 'Séjour', 'Vitres', 'before_after', 1),
    (depart_id, 'Séjour', 'Sols', 'after', 2),

    (grand_id, 'Cuisine', 'Vider le lave-vaisselle', 'none', 1),
    (grand_id, 'Cuisine', 'Plan de travail + évier', 'before_after', 2),
    (grand_id, 'Cuisine', 'Four et plaques', 'before_after', 3),
    (grand_id, 'Cuisine', 'Placards intérieur', 'none', 4),
    (grand_id, 'Salle de bain', 'Miroir et lavabo', 'none', 1),
    (grand_id, 'Salle de bain', 'Douche + joints', 'before_after', 2),
    (grand_id, 'Salle de bain', 'WC', 'after', 3),
    (grand_id, 'Salle de bain', 'Serviettes propres', 'none', 4),
    (grand_id, 'Chambre', 'Changer les draps', 'after', 1),
    (grand_id, 'Chambre', 'Aspirateur et sols', 'after', 2),
    (grand_id, 'Séjour', 'Vitres', 'before_after', 1),
    (grand_id, 'Séjour', 'Sols', 'after', 2);
end $$;
