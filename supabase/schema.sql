-- Create Tricks Table
create table tricks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Tricks Table for tracking progress
create table user_tricks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  trick_id uuid references tricks(id) not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  unique(user_id, trick_id)
);

-- Enable RLS
alter table tricks enable row level security;
alter table user_tricks enable row level security;

-- Policies for Tricks (Public Read Only)
create policy "Tricks are viewable by everyone"
on tricks for select
to authenticated, anon
using (true);

-- Policies for User Tricks (Users can full manage their own)
create policy "Users can see their own progress"
on user_tricks for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own progress"
on user_tricks for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own progress"
on user_tricks for delete
to authenticated
using (auth.uid() = user_id);

-- Seed Data (25 Tricks)
insert into tricks (name, description) values
  ('Ollie', 'The fundamental jump. Popping the tail and sliding the front foot up.'),
  ('Manual', 'Balancing on the back two wheels while rolling.'),
  ('Kickturn', 'Lifting the front wheels to pivot and turn.'),
  ('Tic-Tac', 'Consecutive kickturns to generate speed.'),
  ('Fakie Riding', 'Riding backwards in your normal stance.'),
  ('Switch Riding', 'Riding in your opposite stance.'),
  ('Shuvit', 'Rotating the board 180 degrees horizontally without popping.'),
  ('Pop Shuvit', 'Popping the tail to rotate the board 180 degrees horizontally.'),
  ('Frontside 180', 'Rotating yourself and the board 180 degrees facing forward.'),
  ('Backside 180', 'Rotating yourself and the board 180 degrees facing backward.'),
  ('Kickflip', 'Flipping the board 360 degrees along its axis with your toe.'),
  ('Heelflip', 'Flipping the board 360 degrees with your heel.'),
  ('Varial Kickflip', 'A combination of a backside pop shuvit and a kickflip.'),
  ('Hardflip', 'A frontside pop shuvit combined with a kickflip.'),
  ('360 Flip', 'A 360 shove-it combined with a kickflip. Also known as a Tre Flip.'),
  ('Impossible', 'Wrapping the board vertically around the back foot.'),
  ('50-50 Grind', 'Grinding on both trucks equally.'),
  ('5-0 Grind', 'Grinding only on the back truck.'),
  ('Nose Grind', 'Grinding only on the front truck.'),
  ('Boardslide', 'Sliding the middle of the board between the trucks.'),
  ('Noseslide', 'Sliding on the nose of the deck.'),
  ('Tailslide', 'Sliding on the tail of the deck.'),
  ('Crooked Grind', 'Grinding on the front truck with the nose angled out.'),
  ('Rock to Fakie', 'Hooking the front truck over the coping and rolling back.'),
  ('Drop In', 'Entering a bowl or ramp from the top coping.');
