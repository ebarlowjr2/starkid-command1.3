-- Seed flagship "wow mission" learning module: Artemis III Docking Challenge.
-- NOTE: This assumes `learning_modules` uses Postgres text[] for list fields.

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
  'space.artemis.docking-challenge',
  'stem',
  'Artemis III Docking Challenge',
  'Support an Artemis III-style rendezvous/docking test with timing checks, readiness review, and a final GO/HOLD/ABORT recommendation.',
  'A flagship mission inspired by current Artemis planning.',
  'Space Systems',
  'science',
  'explorer',
  15,
  150,
  7,
  array['mission_brief','concept','instruction','question_numeric','question_multiple_choice','question_short_text','submission_prompt'],
  'You are a junior mission controller supporting an Artemis III-style docking test. You will calculate an approach timing check, review simplified telemetry, and recommend GO, HOLD, or ABORT. This is an educational simulation inspired by current Artemis planning — not an official NASA mission simulator.',
  'Evaluate docking readiness and submit a safety-first recommendation for Command review.',
  array[
    'Review a mission brief inspired by Artemis planning',
    'Learn vehicle/system readiness concepts',
    'Run a rendezvous timing check',
    'Evaluate simplified telemetry for docking readiness',
    'Submit a GO/HOLD/ABORT recommendation'
  ],
  array['Artemis','Orion','Docking','Mission Planning','STEM'],
  'space.artemis.docking-challenge',
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

