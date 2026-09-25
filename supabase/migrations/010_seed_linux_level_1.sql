-- Seed the Linux Mission Training course: "Linux Level I — Prepare for Launch".
-- module_type 'linux' so it surfaces on the Linux Lab landing (/learning/linux)
-- and links to the registered lesson slug played by LessonPlayerScreen.
-- NOTE: assumes `learning_modules` uses Postgres text[] for list fields.

insert into public.learning_modules (
  id,
  module_type,
  title,
  description,
  tagline,
  training_type,
  track,
  level,
  estimated_minutes,
  xp_reward,
  block_count,
  block_list,
  mission_context,
  objective,
  mission_outcomes,
  tags,
  lesson_slug,
  status,
  published_at
)
values
(
  'linux.level-1.prepare-for-launch',
  'linux',
  'Linux Level I — Prepare for Launch',
  'A hands-on Linux course set in StarKid Command. Across seven terminal missions you prepare the spacecraft Aurora for launch using real commands — graded on the resulting system state, not the commands you type.',
  'Learn Linux by getting the spacecraft Aurora ready to fly.',
  'Linux Systems',
  'linux',
  'cadet',
  45,
  200,
  9,
  array[
    'mission_brief',
    'terminal_mission',
    'terminal_mission',
    'terminal_mission',
    'terminal_mission',
    'terminal_mission',
    'terminal_mission',
    'terminal_mission',
    'submission_prompt'
  ],
  'You are a cadet at StarKid Command, and the spacecraft Aurora is your responsibility to prepare for launch. Each stage is a real Linux terminal: you type commands, the system state changes, and mission control grades the result — not the exact commands you typed.',
  'Operate a spacecraft Linux system through seven graded missions, using real commands to bring every launch system to READY.',
  array[
    'Report to Launch Operations (navigate the filesystem)',
    'Build the launch workspace (create directories)',
    'Create the pre-flight checklist (files & redirection)',
    'Assemble the flight crew (users & groups)',
    'Secure the launch keys (ownership & permissions)',
    'Run a flight-computer health check (capture diagnostics)',
    'Verify mission processes (ps, grep, pipes)'
  ],
  array['linux','terminal','launch','level-1'],
  'linux-level-1-prepare-for-launch',
  'published',
  now()
)
on conflict (id) do update set
  module_type = excluded.module_type,
  title = excluded.title,
  description = excluded.description,
  tagline = excluded.tagline,
  training_type = excluded.training_type,
  track = excluded.track,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward = excluded.xp_reward,
  block_count = excluded.block_count,
  block_list = excluded.block_list,
  mission_context = excluded.mission_context,
  objective = excluded.objective,
  mission_outcomes = excluded.mission_outcomes,
  tags = excluded.tags,
  lesson_slug = excluded.lesson_slug,
  status = excluded.status,
  published_at = excluded.published_at;
