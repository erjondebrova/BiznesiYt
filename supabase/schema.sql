-- BiznesiYt.al Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

create table if not exists users_profile (
  id uuid references auth.users primary key,
  full_name text not null,
  business_name text,
  industry text,
  city text,
  years_operating text,
  employee_count text,
  monthly_revenue_range text,
  has_nipt boolean default false,
  needs text[],
  biggest_challenge text,
  plan text default 'free',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  module text default 'general',
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations not null on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create table if not exists daily_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null,
  generated_date date default current_date,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table users_profile enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table daily_tips enable row level security;

-- users_profile policies
create policy "Users can view their own profile"
  on users_profile for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on users_profile for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on users_profile for update
  using (auth.uid() = id);

-- conversations policies
create policy "Users can view their own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- messages policies
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in their conversations"
  on messages for delete
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- daily_tips policies
create policy "Users can view their own tips"
  on daily_tips for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tips"
  on daily_tips for insert
  with check (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_updated_at on conversations(updated_at desc);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at);
create index if not exists idx_daily_tips_user_date on daily_tips(user_id, generated_date);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (id, full_name, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TRIGGER: updated_at auto-update
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_profile_updated_at before update on users_profile
  for each row execute procedure update_updated_at();

create trigger conversations_updated_at before update on conversations
  for each row execute procedure update_updated_at();
