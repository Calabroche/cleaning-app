-- Rôle super_admin (accès technique développeur : sessions, comptes,
-- suppression) en plus de employee/admin (opérationnel, côté boss).

-- ============================================================
-- Autoriser le rôle super_admin
-- ============================================================
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('employee', 'admin', 'super_admin'));

-- is_admin() couvre désormais aussi super_admin : toutes les policies RLS
-- existantes ("admin peut tout faire sur X") s'appliquent donc aux deux
-- rôles sans avoir à réécrire une seule policy.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- ============================================================
-- Ne pas bloquer la suppression d'un compte à cause de son historique
-- (appartements créés, tâches créées, photos, notifications envoyées).
-- Ces colonnes n'avaient pas de règle ON DELETE explicite -> RESTRICT par
-- défaut, ce qui aurait empêché de supprimer un utilisateur ayant déjà agi
-- dans l'app.
-- ============================================================
alter table public.apartments drop constraint apartments_created_by_fkey;
alter table public.apartments add constraint apartments_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.tasks drop constraint tasks_created_by_fkey;
alter table public.tasks add constraint tasks_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.task_photos alter column uploaded_by drop not null;
alter table public.task_photos drop constraint task_photos_uploaded_by_fkey;
alter table public.task_photos add constraint task_photos_uploaded_by_fkey
  foreign key (uploaded_by) references public.profiles(id) on delete set null;

alter table public.notifications drop constraint notifications_sender_id_fkey;
alter table public.notifications add constraint notifications_sender_id_fkey
  foreign key (sender_id) references public.profiles(id) on delete set null;
