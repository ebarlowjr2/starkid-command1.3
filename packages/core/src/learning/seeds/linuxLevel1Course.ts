import type { Lesson } from '../models/lesson'
import type { TerminalMission } from '../terminal/types'

// Linux Level I — "Prepare for Launch".
//
// Course-as-lesson (see docs/linux-missions/HANDOFF.md): this single Lesson's
// blocks are the missions, each a `terminal_mission`. Missions 1–7 tell one
// continuous story — a cadet preparing the spacecraft *Aurora* for launch —
// and build on each other: orient → build the workspace → draft the checklist →
// assemble the crew → secure the keys → check the flight computer → verify
// running flight software.
//
// Authoring rules honored here:
//  - Grade RESULTING STATE, never the command typed (validators only).
//  - Don't hand the student the command up front; reveal it progressively via
//    hints (conceptual nudge → technique → exact command).
//  - Every task is achievable with the Level I command set the emulator really
//    supports (pwd ls cd cat echo mkdir touch cp mv rm chmod chown chgrp id
//    groups useradd groupadd usermod ps df free uptime uname grep, with `>`/`>>`
//    redirection and one `| grep`). Nothing here relies on behavior the engine
//    does not implement (no interactive editors, no live process control).
//  - Each mission's `init` is self-contained so it can be reset or attempted
//    independently; state a later mission "inherits" is pre-seeded, not assumed
//    to carry over from an earlier one.

const AURORA = '/ops/launch/aurora'

const mission1: TerminalMission = {
  id: 'linux-l1-m1-report',
  order: 1,
  title: 'Mission 1 — Report to Launch Operations',
  subtitle: 'Orientation: find your way around the station',
  narrative:
    "Welcome to StarKid Command, cadet. The spacecraft Aurora launches soon and you're on the prep crew. " +
    "First: get your bearings and report in. Your orders are waiting in your home directory, and Launch " +
    "Operations lives somewhere under /ops. Look around before you act — a good operator always knows where they are.",
  objectives: [
    'Find out where you are and what is around you',
    'Read and acknowledge your orders',
    'Report in at Launch Operations',
  ],
  skills: ['pwd', 'ls', 'cd', 'cat', 'whoami', 'echo'],
  init: {
    user: 'cadet',
    hostname: 'starkid',
    home: '/home/cadet',
    cwd: '/home/cadet',
    files: [
      {
        path: '/home/cadet/orders.txt',
        owner: 'cadet',
        group: 'cadet',
        content:
          'STARKID COMMAND — DUTY ORDERS\n' +
          'Cadet, acknowledge these orders, then report to Launch Operations at /ops/launch.\n' +
          'Callsign for this rotation: CADET-01\n',
      },
      { path: '/ops/launch', type: 'dir', owner: 'root', group: 'root' },
      { path: '/ops/telemetry', type: 'dir', owner: 'root', group: 'root' },
      { path: '/ops/README', owner: 'root', group: 'root', content: 'Operations wing. Launch Operations is in ./launch\n' },
    ],
  },
  tasks: [
    {
      id: 'm1-ack',
      title: 'Acknowledge your orders',
      description: 'Leave a file "ack.txt" in your home directory containing the word ACKNOWLEDGED.',
      skills: ['cat', 'echo'],
      validators: [
        { type: 'file_exists', path: '/home/cadet/ack.txt', failureMessage: 'Create ack.txt in your home directory.' },
        { type: 'file_contains', path: '/home/cadet/ack.txt', text: 'ACKNOWLEDGED', failureMessage: 'ack.txt must contain ACKNOWLEDGED.' },
      ],
      hints: [
        { level: 1, text: 'Start by looking around: which directory are you in, and what files are here? Read your orders before acting.' },
        { level: 2, text: 'You can send text straight into a new file instead of opening an editor. The word you write must be ACKNOWLEDGED.' },
        { level: 3, text: 'Try: echo ACKNOWLEDGED > ack.txt' },
      ],
    },
    {
      id: 'm1-checkin',
      title: 'Report to Launch Operations',
      description: 'Place a check-in file at /ops/launch/checkin.txt containing your callsign CADET-01.',
      skills: ['cd', 'echo'],
      validators: [
        { type: 'file_exists', path: '/ops/launch/checkin.txt', failureMessage: 'Create checkin.txt inside /ops/launch.' },
        { type: 'file_contains', path: '/ops/launch/checkin.txt', text: 'CADET-01', failureMessage: 'checkin.txt must contain your callsign CADET-01.' },
      ],
      hints: [
        { level: 4, text: 'Launch Operations is the launch directory under /ops. You can move there, or write to the file by its full path.' },
        { level: 5, text: 'A full (absolute) path starts with / — you can create a file anywhere by naming its whole path.' },
        { level: 6, text: 'Try: echo CADET-01 > /ops/launch/checkin.txt' },
      ],
    },
  ],
  systems: [
    { id: 'orders', label: 'DUTY ORDERS', pendingLabel: 'UNREAD', readyLabel: 'ACKNOWLEDGED', taskId: 'm1-ack' },
    { id: 'checkin', label: 'LAUNCH OPS CHECK-IN', pendingLabel: 'AWAITING', readyLabel: 'ON STATION', taskId: 'm1-checkin' },
  ],
  completionBanner: 'LAUNCH OPS: CADET-01 ON STATION',
}

const mission2: TerminalMission = {
  id: 'linux-l1-m2-workspace',
  order: 2,
  title: 'Mission 2 — Build the Launch Workspace',
  subtitle: 'Organize a place for every part of the launch',
  narrative:
    "You're on station. Now build Aurora's launch workspace so every team has a home for its files. " +
    "Under /ops/launch, create a project folder for Aurora with a bay for fuel data, a bay for telemetry, " +
    'and quarters for crew records. A tidy filesystem keeps a launch from turning into chaos.',
  objectives: [
    'Create the Aurora workspace under /ops/launch',
    'Add storage for fuel, telemetry, and crew',
  ],
  skills: ['mkdir', 'cd', 'ls'],
  init: {
    user: 'cadet',
    hostname: 'starkid',
    home: '/home/cadet',
    cwd: '/ops/launch',
    files: [{ path: '/ops/launch', type: 'dir', owner: 'root', group: 'root' }],
  },
  tasks: [
    {
      id: 'm2-root',
      title: 'Create the Aurora workspace',
      description: 'Make the directory /ops/launch/aurora.',
      skills: ['mkdir'],
      validators: [{ type: 'directory_exists', path: AURORA, failureMessage: 'Create the aurora directory inside /ops/launch.' }],
      hints: [
        { level: 1, text: 'You are already inside /ops/launch. You need a new folder named aurora.' },
        { level: 2, text: 'The command that makes directories is "make directory" — mkdir.' },
        { level: 3, text: 'Try: mkdir aurora' },
      ],
    },
    {
      id: 'm2-fuel',
      title: 'Add the fuel bay',
      description: 'Create /ops/launch/aurora/fuel.',
      skills: ['mkdir'],
      validators: [{ type: 'directory_exists', path: `${AURORA}/fuel`, failureMessage: 'Create the fuel directory inside aurora.' }],
      hints: [
        { level: 4, text: 'Each bay is a directory inside aurora. Move into aurora first, or name the full path.' },
        { level: 5, text: 'mkdir can build a nested path in one step with the -p option, e.g. mkdir -p aurora/fuel' },
      ],
    },
    {
      id: 'm2-telemetry',
      title: 'Add the telemetry bay',
      description: 'Create /ops/launch/aurora/telemetry.',
      skills: ['mkdir'],
      validators: [{ type: 'directory_exists', path: `${AURORA}/telemetry`, failureMessage: 'Create the telemetry directory inside aurora.' }],
      hints: [{ level: 6, text: 'Same idea as the fuel bay — a telemetry directory inside aurora.' }],
    },
    {
      id: 'm2-crew',
      title: 'Add crew quarters',
      description: 'Create /ops/launch/aurora/crew.',
      skills: ['mkdir'],
      validators: [{ type: 'directory_exists', path: `${AURORA}/crew`, failureMessage: 'Create the crew directory inside aurora.' }],
      hints: [{ level: 7, text: 'One more directory inside aurora, named crew. Use ls to confirm all three bays exist.' }],
    },
  ],
  systems: [
    { id: 'ws', label: 'WORKSPACE ROOT', pendingLabel: 'UNALLOCATED', readyLabel: 'ALLOCATED', taskId: 'm2-root' },
    { id: 'fuel', label: 'FUEL BAY', pendingLabel: 'NO STORAGE', readyLabel: 'READY', taskId: 'm2-fuel' },
    { id: 'tlm', label: 'TELEMETRY BAY', pendingLabel: 'NO STORAGE', readyLabel: 'READY', taskId: 'm2-telemetry' },
    { id: 'crew', label: 'CREW QUARTERS', pendingLabel: 'NO STORAGE', readyLabel: 'READY', taskId: 'm2-crew' },
  ],
  completionBanner: 'WORKSPACE: STRUCTURED',
}

const mission3: TerminalMission = {
  id: 'linux-l1-m3-checklist',
  order: 3,
  title: 'Mission 3 — Create the Pre-Flight Checklist',
  subtitle: 'Write the launch checklist, line by line',
  narrative:
    'With the workspace built, draft Aurora\'s pre-flight checklist. Create a file called preflight.txt in the ' +
    'workspace and list the three systems that must be verified — FUEL, TELEMETRY, and CREW — then add the final ' +
    'GO/NO-GO decision line. You\'ll build the file up one line at a time, the way a real checklist grows.',
  objectives: ['Create preflight.txt', 'List the three systems to verify', 'Add the GO/NO-GO line'],
  skills: ['touch', 'echo', 'cat'],
  init: {
    user: 'cadet',
    hostname: 'starkid',
    home: '/home/cadet',
    cwd: AURORA,
    files: [
      { path: `${AURORA}/fuel`, type: 'dir', owner: 'cadet', group: 'cadet' },
      { path: `${AURORA}/telemetry`, type: 'dir', owner: 'cadet', group: 'cadet' },
      { path: `${AURORA}/crew`, type: 'dir', owner: 'cadet', group: 'cadet' },
    ],
  },
  tasks: [
    {
      id: 'm3-create',
      title: 'Create the checklist file',
      description: 'Create preflight.txt in the Aurora workspace.',
      skills: ['touch', 'echo'],
      validators: [{ type: 'file_exists', path: `${AURORA}/preflight.txt`, failureMessage: 'Create preflight.txt in the workspace.' }],
      hints: [
        { level: 1, text: 'You need an empty (or new) file named preflight.txt. There is a command whose whole job is to create/refresh a file.' },
        { level: 2, text: 'Try: touch preflight.txt  (or write your first line straight in with echo ... > preflight.txt)' },
      ],
    },
    {
      id: 'm3-items',
      title: 'List the three systems',
      description: 'preflight.txt must contain the words FUEL, TELEMETRY, and CREW.',
      skills: ['echo'],
      validators: [
        {
          type: 'file_contains',
          path: `${AURORA}/preflight.txt`,
          contains: ['FUEL', 'TELEMETRY', 'CREW'],
          failureMessage: 'The checklist must list FUEL, TELEMETRY, and CREW.',
        },
      ],
      hints: [
        { level: 3, text: 'Add each system on its own line. A single > overwrites the file; two >> append to it without erasing what is there.' },
        { level: 4, text: 'Try: echo FUEL > preflight.txt  then  echo TELEMETRY >> preflight.txt  then  echo CREW >> preflight.txt' },
      ],
    },
    {
      id: 'm3-decision',
      title: 'Add the GO/NO-GO line',
      description: 'Append a line containing GO/NO-GO to the bottom of the checklist.',
      skills: ['echo', 'cat'],
      validators: [
        { type: 'file_contains', path: `${AURORA}/preflight.txt`, text: 'GO/NO-GO', failureMessage: 'Append a GO/NO-GO decision line.' },
      ],
      hints: [
        { level: 5, text: 'Append one more line without overwriting the systems you already listed.' },
        { level: 6, text: 'Try: echo GO/NO-GO >> preflight.txt   — then read it back with cat preflight.txt' },
      ],
    },
  ],
  systems: [
    { id: 'file', label: 'CHECKLIST FILE', pendingLabel: 'MISSING', readyLabel: 'CREATED', taskId: 'm3-create' },
    { id: 'items', label: 'CHECKLIST ITEMS', pendingLabel: 'INCOMPLETE', readyLabel: 'LISTED', taskId: 'm3-items' },
    { id: 'poll', label: 'GO/NO-GO POLL', pendingLabel: 'PENDING', readyLabel: 'ARMED', taskId: 'm3-decision' },
  ],
  completionBanner: 'PRE-FLIGHT CHECKLIST: DRAFTED',
}

const mission4: TerminalMission = {
  id: 'linux-l1-m4-crew',
  order: 4,
  title: 'Mission 4 — Assemble the Flight Crew',
  subtitle: 'Create accounts and a group for the crew',
  narrative:
    'Aurora needs a crew on the system. Create a "flightcrew" group, then register three accounts — commander, ' +
    'pilot, and engineer — and add each of them to the flightcrew group. Groups are how Linux lets a whole team ' +
    'share access without handing out one login. Use id and groups to check your work.',
  objectives: ['Create the flightcrew group', 'Create the commander, pilot, and engineer accounts', 'Add all three to flightcrew'],
  skills: ['groupadd', 'useradd', 'usermod', 'id', 'groups'],
  init: { user: 'cadet', hostname: 'starkid', home: '/home/cadet', cwd: '/home/cadet' },
  tasks: [
    {
      id: 'm4-group',
      title: 'Create the flightcrew group',
      description: 'Add a group named flightcrew.',
      skills: ['groupadd'],
      validators: [{ type: 'group_exists', group: 'flightcrew', failureMessage: 'Create the flightcrew group.' }],
      hints: [
        { level: 1, text: 'A crew shares access through a group. There is a command for adding a group.' },
        { level: 2, text: 'Try: groupadd flightcrew' },
      ],
    },
    {
      id: 'm4-commander',
      title: 'Register the commander',
      description: 'Create a user account named commander.',
      skills: ['useradd'],
      validators: [{ type: 'user_exists', user: 'commander', failureMessage: 'Create the commander account.' }],
      hints: [
        { level: 3, text: 'Accounts are added with a command that means "add user".' },
        { level: 4, text: 'Try: useradd commander' },
      ],
    },
    {
      id: 'm4-pilot',
      title: 'Register the pilot',
      description: 'Create a user account named pilot.',
      skills: ['useradd'],
      validators: [{ type: 'user_exists', user: 'pilot', failureMessage: 'Create the pilot account.' }],
      hints: [{ level: 5, text: 'Same as the commander, for the pilot: useradd pilot' }],
    },
    {
      id: 'm4-engineer',
      title: 'Register the engineer',
      description: 'Create a user account named engineer.',
      skills: ['useradd'],
      validators: [{ type: 'user_exists', user: 'engineer', failureMessage: 'Create the engineer account.' }],
      hints: [{ level: 6, text: 'One more account: useradd engineer' }],
    },
    {
      id: 'm4-commander-group',
      title: 'Seat the commander',
      description: 'Add commander to the flightcrew group.',
      skills: ['usermod'],
      validators: [{ type: 'user_in_group', user: 'commander', group: 'flightcrew', failureMessage: 'Add commander to flightcrew.' }],
      hints: [
        { level: 7, text: 'Add an existing user to a group without dropping their other groups using usermod with the -aG option (append to Groups).' },
        { level: 8, text: 'Try: usermod -aG flightcrew commander' },
      ],
    },
    {
      id: 'm4-pilot-group',
      title: 'Seat the pilot',
      description: 'Add pilot to the flightcrew group.',
      skills: ['usermod'],
      validators: [{ type: 'user_in_group', user: 'pilot', group: 'flightcrew', failureMessage: 'Add pilot to flightcrew.' }],
      hints: [{ level: 9, text: 'usermod -aG flightcrew pilot' }],
    },
    {
      id: 'm4-engineer-group',
      title: 'Seat the engineer',
      description: 'Add engineer to the flightcrew group.',
      skills: ['usermod', 'id'],
      validators: [{ type: 'user_in_group', user: 'engineer', group: 'flightcrew', failureMessage: 'Add engineer to flightcrew.' }],
      hints: [
        { level: 10, text: 'usermod -aG flightcrew engineer' },
        { level: 11, text: 'Confirm membership with: id engineer   (you should see flightcrew in the groups list).' },
      ],
    },
  ],
  systems: [
    { id: 'grp', label: 'FLIGHT CREW GROUP', pendingLabel: 'NONE', readyLabel: 'CREATED', taskId: 'm4-group' },
    { id: 'cmd', label: 'COMMANDER SEAT', pendingLabel: 'EMPTY', readyLabel: 'SEATED', taskId: 'm4-commander-group' },
    { id: 'plt', label: 'PILOT SEAT', pendingLabel: 'EMPTY', readyLabel: 'SEATED', taskId: 'm4-pilot-group' },
    { id: 'eng', label: 'ENGINEER SEAT', pendingLabel: 'EMPTY', readyLabel: 'SEATED', taskId: 'm4-engineer-group' },
  ],
  completionBanner: 'FLIGHT CREW: ASSEMBLED',
}

const mission5: TerminalMission = {
  id: 'linux-l1-m5-keys',
  order: 5,
  title: 'Mission 5 — Secure the Launch Keys',
  subtitle: 'Ownership and permissions on sensitive files',
  narrative:
    'The launch and abort keys are currently owned by root and readable by everyone — unacceptable for launch ' +
    'authorization. Hand each key to the right crew member, put both under the flightcrew group, and lock down ' +
    'their permissions so only the owner (and, for the abort key, the crew) can read them. The crew accounts and ' +
    'the flightcrew group already exist on this system.',
  objectives: ['Assign each key to its crew owner', 'Put the keys under the flightcrew group', 'Restrict the key permissions'],
  skills: ['chown', 'chgrp', 'chmod', 'ls'],
  init: {
    user: 'cadet',
    hostname: 'starkid',
    home: '/home/cadet',
    cwd: AURORA,
    groups: [{ name: 'flightcrew', gid: 1500, members: ['commander', 'pilot', 'engineer'] }],
    users: [
      { name: 'commander', uid: 1501, primaryGroup: 'commander', groups: ['commander', 'flightcrew'] },
      { name: 'pilot', uid: 1502, primaryGroup: 'pilot', groups: ['pilot', 'flightcrew'] },
      { name: 'engineer', uid: 1503, primaryGroup: 'engineer', groups: ['engineer', 'flightcrew'] },
    ],
    files: [
      { path: `${AURORA}/launch.key`, owner: 'root', group: 'root', mode: 0o644, content: 'LAUNCH-AUTH-AURORA-001\n' },
      { path: `${AURORA}/abort.key`, owner: 'root', group: 'root', mode: 0o644, content: 'ABORT-AUTH-AURORA-001\n' },
    ],
  },
  tasks: [
    {
      id: 'm5-launch-owner',
      title: 'Assign the launch key',
      description: 'Make commander the owner of launch.key.',
      skills: ['chown'],
      validators: [{ type: 'owner_matches', path: `${AURORA}/launch.key`, user: 'commander', failureMessage: 'launch.key must be owned by commander.' }],
      hints: [
        { level: 1, text: 'Only the launch commander should own the launch key. There is a command to "change owner".' },
        { level: 2, text: 'Try: chown commander launch.key' },
      ],
    },
    {
      id: 'm5-launch-group',
      title: 'Group the launch key',
      description: 'Set launch.key\'s group to flightcrew.',
      skills: ['chgrp', 'chown'],
      validators: [{ type: 'group_matches', path: `${AURORA}/launch.key`, group: 'flightcrew', failureMessage: 'launch.key must belong to the flightcrew group.' }],
      hints: [
        { level: 3, text: 'You can change the group with chgrp, or set owner and group together with chown owner:group.' },
        { level: 4, text: 'Try: chgrp flightcrew launch.key   (or chown commander:flightcrew launch.key to do both at once)' },
      ],
    },
    {
      id: 'm5-launch-perms',
      title: 'Lock the launch key',
      description: 'Restrict launch.key so only its owner can read and write it (permissions 600).',
      skills: ['chmod'],
      validators: [{ type: 'permissions_match', path: `${AURORA}/launch.key`, mode: 0o600, failureMessage: 'launch.key permissions must be 600 (owner read/write only).' }],
      hints: [
        { level: 5, text: 'Permissions are three digits: owner, group, others. Read=4, write=2, execute=1. "Owner read+write, nobody else" is 6,0,0.' },
        { level: 6, text: 'Try: chmod 600 launch.key   — check it with ls -l' },
      ],
    },
    {
      id: 'm5-abort-owner',
      title: 'Assign the abort key',
      description: 'Make pilot the owner of abort.key.',
      skills: ['chown'],
      validators: [{ type: 'owner_matches', path: `${AURORA}/abort.key`, user: 'pilot', failureMessage: 'abort.key must be owned by pilot.' }],
      hints: [{ level: 7, text: 'The pilot holds the abort key: chown pilot abort.key' }],
    },
    {
      id: 'm5-abort-group',
      title: 'Group the abort key',
      description: 'Set abort.key\'s group to flightcrew.',
      skills: ['chgrp'],
      validators: [{ type: 'group_matches', path: `${AURORA}/abort.key`, group: 'flightcrew', failureMessage: 'abort.key must belong to the flightcrew group.' }],
      hints: [{ level: 8, text: 'chgrp flightcrew abort.key' }],
    },
    {
      id: 'm5-abort-perms',
      title: 'Lock the abort key',
      description: 'Set abort.key so the owner can read/write and the crew group can read (permissions 640).',
      skills: ['chmod'],
      validators: [{ type: 'permissions_match', path: `${AURORA}/abort.key`, mode: 0o640, failureMessage: 'abort.key permissions must be 640 (owner read/write, group read).' }],
      hints: [
        { level: 9, text: 'Owner read+write (6), group read-only (4), others nothing (0).' },
        { level: 10, text: 'Try: chmod 640 abort.key' },
      ],
    },
  ],
  systems: [
    { id: 'lk-owner', label: 'LAUNCH KEY CUSTODY', pendingLabel: 'ROOT', readyLabel: 'COMMANDER', taskId: 'm5-launch-owner' },
    { id: 'lk-lock', label: 'LAUNCH KEY LOCK', pendingLabel: 'EXPOSED', readyLabel: 'SECURED', taskId: 'm5-launch-perms' },
    { id: 'ak-owner', label: 'ABORT KEY CUSTODY', pendingLabel: 'ROOT', readyLabel: 'PILOT', taskId: 'm5-abort-owner' },
    { id: 'ak-lock', label: 'ABORT KEY LOCK', pendingLabel: 'EXPOSED', readyLabel: 'SECURED', taskId: 'm5-abort-perms' },
  ],
  completionBanner: 'LAUNCH KEYS: SECURED',
}

const mission6: TerminalMission = {
  id: 'linux-l1-m6-health',
  order: 6,
  title: 'Mission 6 — Flight Computer Health Check',
  subtitle: 'Capture diagnostics into a single report',
  narrative:
    "Before ignition, Aurora's flight computer needs a clean bill of health. Run the standard diagnostics — " +
    'system identity, disk, memory, and uptime — and capture each one into a single health.txt report in the ' +
    'workspace. In Linux, most tools print to the screen; the skill here is redirecting that output into a file ' +
    'so it can be filed and reviewed.',
  objectives: ['Record the system identity', 'Append disk, memory, and uptime diagnostics into one report'],
  skills: ['uname', 'df', 'free', 'uptime', 'cat'],
  init: {
    user: 'cadet',
    hostname: 'aurora-fc',
    home: '/home/cadet',
    cwd: AURORA,
    files: [{ path: AURORA, type: 'dir', owner: 'cadet', group: 'cadet' }],
  },
  tasks: [
    {
      id: 'm6-identity',
      title: 'Record system identity',
      description: 'Capture the full system/kernel identity into health.txt (start the report).',
      skills: ['uname'],
      validators: [
        { type: 'file_exists', path: `${AURORA}/health.txt`, failureMessage: 'Create the health.txt report.' },
        { type: 'file_contains', path: `${AURORA}/health.txt`, contains: ['Linux', 'aurora-fc'], failureMessage: 'The report must include the full system identity (try uname -a).' },
      ],
      hints: [
        { level: 1, text: 'There is a command that prints the system/kernel name; with the "all" option it prints the full identity, including the hostname.' },
        { level: 2, text: 'Redirect that output into a new file to start the report. This first one should overwrite (>).' },
        { level: 3, text: 'Try: uname -a > health.txt' },
      ],
    },
    {
      id: 'm6-disk',
      title: 'Append the disk report',
      description: 'Append the filesystem/disk usage to health.txt.',
      skills: ['df'],
      validators: [{ type: 'file_contains', path: `${AURORA}/health.txt`, text: 'Filesystem', failureMessage: 'Append disk usage (its output has a Filesystem header).' }],
      hints: [
        { level: 4, text: 'The disk-free command reports filesystem usage. Append it so you keep the identity line above it.' },
        { level: 5, text: 'Try: df >> health.txt' },
      ],
    },
    {
      id: 'm6-memory',
      title: 'Append the memory report',
      description: 'Append the memory usage to health.txt.',
      skills: ['free'],
      validators: [{ type: 'file_contains', path: `${AURORA}/health.txt`, text: 'Mem:', failureMessage: 'Append memory usage (its output has a Mem: line).' }],
      hints: [{ level: 6, text: 'The memory report command is "free". Append it: free >> health.txt' }],
    },
    {
      id: 'm6-uptime',
      title: 'Append uptime and load',
      description: 'Append uptime/load average to health.txt.',
      skills: ['uptime', 'cat'],
      validators: [{ type: 'file_contains', path: `${AURORA}/health.txt`, text: 'load average', failureMessage: 'Append uptime (it reports the load average).' }],
      hints: [
        { level: 7, text: 'The "uptime" command shows how long the system has been up and the load average. Append it.' },
        { level: 8, text: 'Try: uptime >> health.txt   — then read the whole report with cat health.txt' },
      ],
    },
  ],
  systems: [
    { id: 'id', label: 'SYSTEM IDENTITY', pendingLabel: 'UNKNOWN', readyLabel: 'LOGGED', taskId: 'm6-identity' },
    { id: 'disk', label: 'DISK', pendingLabel: 'UNCHECKED', readyLabel: 'NOMINAL', taskId: 'm6-disk' },
    { id: 'mem', label: 'MEMORY', pendingLabel: 'UNCHECKED', readyLabel: 'NOMINAL', taskId: 'm6-memory' },
    { id: 'load', label: 'UPTIME / LOAD', pendingLabel: 'UNCHECKED', readyLabel: 'NOMINAL', taskId: 'm6-uptime' },
  ],
  completionBanner: 'FLIGHT COMPUTER: NOMINAL',
}

const mission7: TerminalMission = {
  id: 'linux-l1-m7-processes',
  order: 7,
  title: 'Mission 7 — Verify Mission Processes',
  subtitle: 'Confirm the flight software is running',
  narrative:
    "Final stage: prove Aurora's flight software is actually running. Inspect the process list, filter it for each " +
    'critical service, and save proof of each one into the telemetry bay. Then capture a full process snapshot for ' +
    'the launch record. When every service checks out, Aurora is GO.',
  objectives: ['Verify the telemetry, guidance, and fuel-monitor processes', 'File a full process snapshot'],
  skills: ['ps', 'grep', 'cat'],
  init: {
    user: 'cadet',
    hostname: 'aurora-fc',
    home: '/home/cadet',
    cwd: AURORA,
    files: [
      { path: `${AURORA}/telemetry`, type: 'dir', owner: 'cadet', group: 'cadet' },
    ],
    processes: [
      { pid: 1, user: 'root', command: '/sbin/init', cpu: 0.0, mem: 0.1 },
      { pid: 101, user: 'root', command: 'flight-control', cpu: 1.2, mem: 3.4 },
      { pid: 102, user: 'cadet', command: 'telemetry-daemon', cpu: 0.6, mem: 1.1 },
      { pid: 103, user: 'cadet', command: 'fuel-monitor', cpu: 0.3, mem: 0.8 },
    ],
  },
  tasks: [
    {
      id: 'm7-telemetry',
      title: 'Verify telemetry',
      description: 'Save proof that the telemetry process is running to telemetry/telemetry.log.',
      skills: ['ps', 'grep'],
      validators: [
        { type: 'file_exists', path: `${AURORA}/telemetry/telemetry.log`, failureMessage: 'Create telemetry/telemetry.log.' },
        { type: 'file_contains', path: `${AURORA}/telemetry/telemetry.log`, text: 'telemetry', failureMessage: 'The log must show the telemetry process.' },
      ],
      hints: [
        { level: 1, text: 'List the running processes, then narrow the list to just the telemetry line, and save that to a file.' },
        { level: 2, text: 'ps lists processes; a pipe (|) into grep filters them; > saves the result to a file.' },
        { level: 3, text: 'Try: ps | grep telemetry > telemetry/telemetry.log' },
      ],
    },
    {
      id: 'm7-guidance',
      title: 'Verify guidance',
      description: 'Save proof the flight-control (guidance) process is running to telemetry/guidance.log.',
      skills: ['ps', 'grep'],
      validators: [
        { type: 'file_contains', path: `${AURORA}/telemetry/guidance.log`, text: 'flight-control', failureMessage: 'The log must show the flight-control process.' },
      ],
      hints: [{ level: 4, text: 'Same technique, filtering for flight-control: ps | grep flight-control > telemetry/guidance.log' }],
    },
    {
      id: 'm7-fuel',
      title: 'Verify the fuel monitor',
      description: 'Save proof the fuel-monitor process is running to telemetry/fuel.log.',
      skills: ['ps', 'grep'],
      validators: [
        { type: 'file_contains', path: `${AURORA}/telemetry/fuel.log`, text: 'fuel-monitor', failureMessage: 'The log must show the fuel-monitor process.' },
      ],
      hints: [{ level: 5, text: 'ps | grep fuel > telemetry/fuel.log' }],
    },
    {
      id: 'm7-snapshot',
      title: 'File the full process snapshot',
      description: 'Capture a complete process list (with users) to telemetry/processes.log.',
      skills: ['ps'],
      validators: [
        {
          type: 'file_contains',
          path: `${AURORA}/telemetry/processes.log`,
          contains: ['flight-control', 'telemetry-daemon', 'fuel-monitor'],
          failureMessage: 'The snapshot must include all three flight services.',
        },
      ],
      hints: [
        { level: 6, text: 'For a full snapshot with user columns, ps takes the aux options.' },
        { level: 7, text: 'Try: ps aux > telemetry/processes.log   — then cat it to confirm all three services are listed.' },
      ],
    },
  ],
  systems: [
    { id: 'tlm', label: 'TELEMETRY LINK', pendingLabel: 'UNVERIFIED', readyLabel: 'VERIFIED', taskId: 'm7-telemetry' },
    { id: 'gnc', label: 'GUIDANCE COMPUTER', pendingLabel: 'UNVERIFIED', readyLabel: 'VERIFIED', taskId: 'm7-guidance' },
    { id: 'fuel', label: 'FUEL MONITOR', pendingLabel: 'UNVERIFIED', readyLabel: 'VERIFIED', taskId: 'm7-fuel' },
    { id: 'snap', label: 'PROCESS SNAPSHOT', pendingLabel: 'NOT FILED', readyLabel: 'FILED', taskId: 'm7-snapshot' },
  ],
  completionBanner: 'ALL FLIGHT SYSTEMS VERIFIED — AURORA IS GO',
}

// Mission 8 — the capstone. Technically self-contained: a fresh, deterministic
// pre-launch snapshot representing the *results* of Missions 1–7 (never the
// student's own carried-over state, so resets and grading stay reproducible).
// Narratively it is the Aurora the cadet has spent Level I preparing. Unlike the
// build-up missions, Aurora arrives MOSTLY ready but with several deliberate
// launch-blocking faults the cadet must independently find and fix. Objectives
// are operational ("correct the security exposure"), never step-by-step
// commands — the cadet decides how to investigate and resolve each one.
const mission8: TerminalMission = {
  id: 'linux-l1-m8-launch',
  order: 8,
  title: 'Mission 8 — Final Launch Readiness',
  subtitle: 'Independently verify Aurora, then authorize ignition',
  narrative:
    'Aurora is on the pad. Engineering, crew operations, navigation, communications, and flight systems have all ' +
    'reported their individual preparations complete, and the launch window is approaching. Mission Control believes ' +
    'Aurora is ready — but final go/no-go is your responsibility, cadet. Independently verify the spacecraft before ' +
    'ignition. Run ./verify-launch.sh at any time to poll every station; it reports GO/NO-GO from the real system ' +
    'state, but it will not tell you how to fix a hold. Investigate with the tools you have learned (ls, cat, grep, ' +
    'id, groups, ps), correct every discrepancy, then arm Aurora for launch.',
  objectives: [
    'Run ./verify-launch.sh and find every station reporting NO-GO',
    'Correct each launch-blocking discrepancy using your Level I skills',
    'Arm Aurora for ignition once all stations are GO',
  ],
  skills: ['ls', 'cat', 'grep', 'id', 'groups', 'usermod', 'chmod', 'mv', 'echo', 'ps'],
  init: {
    user: 'cadet',
    hostname: 'aurora-fc',
    home: '/home/cadet',
    cwd: AURORA,
    // Flight crew from Mission 4 — but the engineer was dropped from flightcrew.
    groups: [{ name: 'flightcrew', gid: 1500, members: ['commander', 'pilot'] }],
    users: [
      { name: 'commander', uid: 1501, primaryGroup: 'commander', groups: ['commander', 'flightcrew'] },
      { name: 'pilot', uid: 1502, primaryGroup: 'pilot', groups: ['pilot', 'flightcrew'] },
      { name: 'engineer', uid: 1503, primaryGroup: 'engineer', groups: ['engineer'] },
    ],
    processes: [
      { pid: 1, user: 'root', command: '/sbin/init', cpu: 0.0, mem: 0.1 },
      { pid: 101, user: 'root', command: 'flight-control', cpu: 1.2, mem: 3.4 },
      { pid: 102, user: 'cadet', command: 'telemetry-daemon', cpu: 0.6, mem: 1.1 },
      { pid: 103, user: 'cadet', command: 'fuel-monitor', cpu: 0.3, mem: 0.8 },
    ],
    files: [
      // Workspace + bays (Mission 2) — correct.
      { path: `${AURORA}/fuel`, type: 'dir', owner: 'cadet', group: 'cadet' },
      { path: `${AURORA}/telemetry`, type: 'dir', owner: 'cadet', group: 'cadet' },
      { path: `${AURORA}/crew`, type: 'dir', owner: 'cadet', group: 'cadet' },
      { path: `${AURORA}/launch`, type: 'dir', owner: 'cadet', group: 'cadet' },
      // Pre-flight checklist (Mission 3) — FAULT: fuel line still reads NO-GO.
      {
        path: `${AURORA}/preflight.txt`,
        owner: 'cadet',
        group: 'cadet',
        content:
          'AURORA PRE-FLIGHT CHECKLIST\nGUIDANCE: GO\nTELEMETRY: GO\nFUEL: NO-GO\nGO/NO-GO: PENDING\n',
      },
      // Launch keys (Mission 5) — correctly secured.
      { path: `${AURORA}/launch.key`, owner: 'commander', group: 'flightcrew', mode: 0o600, content: 'LAUNCH-AUTH-AURORA-001\n' },
      { path: `${AURORA}/abort.key`, owner: 'pilot', group: 'flightcrew', mode: 0o640, content: 'ABORT-AUTH-AURORA-001\n' },
      // Flight-computer health report (Mission 6) — correct.
      { path: `${AURORA}/health.txt`, owner: 'cadet', group: 'cadet', content: 'AURORA FLIGHT COMPUTER: NOMINAL\n' },
      // Ignition authorization file — FAULT: world-readable (644) instead of 640.
      { path: `${AURORA}/launch/ignition.key`, owner: 'commander', group: 'flightcrew', mode: 0o644, content: 'IGNITION-AUTH-AURORA-001\n' },
      // Flight-computer diagnostic — FAULT: left in the workspace root as a .bak,
      // not filed in the telemetry bay where guidance expects it.
      { path: `${AURORA}/diagnostic.log.bak`, owner: 'cadet', group: 'cadet', content: 'FLIGHT-COMPUTER DIAGNOSTIC\nALL SUBSYSTEMS NOMINAL\n' },
      // The readiness tool itself — real, readable, run via the backend.
      {
        path: `${AURORA}/verify-launch.sh`,
        owner: 'cadet',
        group: 'cadet',
        mode: 0o755,
        content:
          '#!/bin/sh\n# StarKid Command — Aurora launch-readiness check.\n' +
          '# Usage: ./verify-launch.sh\n' +
          '# Reports GO/NO-GO for every launch station from live system state.\n',
      },
    ],
  },
  tasks: [
    {
      id: 'm8-crew',
      title: 'Complete the flight crew roster',
      description:
        'Launch Control reports the authorized flight crew is incomplete — a crew member is missing from the team. Restore the full roster.',
      skills: ['id', 'groups', 'usermod'],
      validators: [
        { type: 'user_in_group', user: 'engineer', group: 'flightcrew', failureMessage: 'The engineer is not on the authorized flight crew.' },
        { type: 'user_in_group', user: 'commander', group: 'flightcrew', failureMessage: 'The commander must remain on the flight crew.' },
        { type: 'user_in_group', user: 'pilot', group: 'flightcrew', failureMessage: 'The pilot must remain on the flight crew.' },
      ],
      hints: [
        { level: 1, text: 'Check who is actually on the crew. id <user> and groups <user> show a user\'s group memberships — compare all three against flightcrew.' },
        { level: 2, text: 'One crew member is not in flightcrew. Adding a user to a group without removing their other groups uses usermod -aG.' },
        { level: 3, text: 'Try: usermod -aG flightcrew engineer' },
      ],
    },
    {
      id: 'm8-security',
      title: 'Correct the ignition security exposure',
      description:
        'Launch Control reports the ignition authorization file is accessible outside the authorized flight team. Correct the security issue without locking out the crew.',
      skills: ['ls', 'chmod'],
      validators: [
        { type: 'permissions_match', path: `${AURORA}/launch/ignition.key`, mode: 0o640, failureMessage: 'ignition.key is readable outside the flight crew — owner read/write and group read only (640).' },
      ],
      hints: [
        { level: 4, text: 'Inspect the file\'s permissions with ls -l inside the launch directory. Who can currently read it?' },
        { level: 5, text: 'It should be readable by its owner and the flightcrew group, but not by everyone. Owner read+write (6), group read (4), others none (0).' },
        { level: 6, text: 'Try: chmod 640 launch/ignition.key' },
      ],
    },
    {
      id: 'm8-checklist',
      title: 'Clear the pre-flight checklist',
      description:
        'The pre-flight checklist still shows a station that is not GO. Investigate which one, resolve it, and bring every checklist item to GO.',
      skills: ['cat', 'grep', 'echo'],
      validators: [
        {
          type: 'file_contains',
          path: `${AURORA}/preflight.txt`,
          contains: ['GUIDANCE: GO', 'TELEMETRY: GO', 'FUEL: GO'],
          failureMessage: 'Every checklist station must read GO — one still shows a hold.',
        },
      ],
      hints: [
        { level: 7, text: 'Read the checklist with cat preflight.txt. Which station is not GO? grep NO-GO preflight.txt narrows it down.' },
        { level: 8, text: 'Rewrite the checklist so the held station reads GO. You can recreate the file with echo lines and > / >> redirection.' },
        { level: 9, text: 'For example: echo "AURORA PRE-FLIGHT CHECKLIST" > preflight.txt then append GUIDANCE: GO, TELEMETRY: GO, FUEL: GO with >>' },
      ],
    },
    {
      id: 'm8-diagnostic',
      title: 'File the flight-computer diagnostic',
      description:
        'Guidance cannot find the flight-computer diagnostic in the telemetry bay where it belongs. Locate the misplaced file and restore it to telemetry/diagnostic.log.',
      skills: ['ls', 'mv'],
      validators: [
        {
          type: 'file_contains',
          path: `${AURORA}/telemetry/diagnostic.log`,
          text: 'FLIGHT-COMPUTER DIAGNOSTIC',
          failureMessage: 'The flight-computer diagnostic is not filed at telemetry/diagnostic.log.',
        },
      ],
      hints: [
        { level: 10, text: 'List the workspace with ls to find the stray diagnostic file. It is not in the telemetry bay yet.' },
        { level: 11, text: 'Move (and rename) it into the telemetry directory. mv can move and rename in one step.' },
        { level: 12, text: 'Try: mv diagnostic.log.bak telemetry/diagnostic.log' },
      ],
    },
    {
      id: 'm8-arm',
      title: 'Arm Aurora for ignition',
      description:
        'With every station GO, transmit final ignition authorization: write ARMED into launch/authorization. This is your authorization to proceed — do it only when verify-launch.sh reports ALL STATIONS GO.',
      skills: ['echo'],
      validators: [
        { type: 'file_contains', path: `${AURORA}/launch/authorization`, text: 'ARMED', failureMessage: 'Aurora is not armed — write ARMED into launch/authorization.' },
      ],
      hints: [
        { level: 13, text: 'The authorization is a file at launch/authorization containing the word ARMED.' },
        { level: 14, text: 'Try: echo ARMED > launch/authorization' },
      ],
    },
  ],
  systems: [
    { id: 'crew', label: 'FLIGHT CREW ROSTER', pendingLabel: 'INCOMPLETE', readyLabel: 'GO', taskId: 'm8-crew' },
    { id: 'sec', label: 'IGNITION SECURITY', pendingLabel: 'EXPOSED', readyLabel: 'GO', taskId: 'm8-security' },
    { id: 'chk', label: 'LAUNCH CHECKLIST', pendingLabel: 'HOLD', readyLabel: 'GO', taskId: 'm8-checklist' },
    { id: 'diag', label: 'FLIGHT COMPUTER', pendingLabel: 'MISPLACED', readyLabel: 'GO', taskId: 'm8-diagnostic' },
    { id: 'ign', label: 'IGNITION AUTHORIZATION', pendingLabel: 'SAFED', readyLabel: 'ARMED', taskId: 'm8-arm' },
  ],
  readiness: {
    title: 'AURORA FINAL LAUNCH READINESS',
    scriptName: 'verify-launch.sh',
    goLine: 'ALL STATIONS GO',
    holdLine: 'LAUNCH STATUS: HOLD',
    subsystems: [
      { label: 'Navigation', validators: [{ type: 'directory_exists', path: `${AURORA}/telemetry` }] },
      { label: 'Communications', validators: [{ type: 'directory_exists', path: `${AURORA}/crew` }] },
      {
        label: 'Flight Crew',
        validators: [
          { type: 'user_in_group', user: 'commander', group: 'flightcrew' },
          { type: 'user_in_group', user: 'pilot', group: 'flightcrew' },
          { type: 'user_in_group', user: 'engineer', group: 'flightcrew' },
        ],
      },
      { label: 'Launch Checklist', validators: [{ type: 'file_contains', path: `${AURORA}/preflight.txt`, contains: ['GUIDANCE: GO', 'TELEMETRY: GO', 'FUEL: GO'] }] },
      { label: 'Security', validators: [{ type: 'permissions_match', path: `${AURORA}/launch/ignition.key`, mode: 0o640 }] },
      { label: 'Flight Computer', validators: [{ type: 'file_contains', path: `${AURORA}/telemetry/diagnostic.log`, text: 'FLIGHT-COMPUTER DIAGNOSTIC' }] },
      {
        label: 'Mission Processes',
        validators: [
          { type: 'process_running', process: 'flight-control' },
          { type: 'process_running', process: 'telemetry-daemon' },
          { type: 'process_running', process: 'fuel-monitor' },
        ],
      },
      { label: 'Ignition', validators: [{ type: 'file_contains', path: `${AURORA}/launch/authorization`, text: 'ARMED' }] },
    ],
  },
  completionBanner: 'ALL STATIONS GO — AURORA CLEARED FOR IGNITION',
}

const missions = [mission1, mission2, mission3, mission4, mission5, mission6, mission7, mission8]

export const linuxLevel1Course: Lesson = {
  id: 'lesson_linux_level_1_prepare_for_launch_v1',
  slug: 'linux-level-1-prepare-for-launch',
  title: 'Linux Level I — Prepare for Launch',
  subtitle: 'Learn Linux by getting the spacecraft Aurora ready to fly',
  summary:
    'A hands-on Linux course set in StarKid Command. Across eight terminal missions you orient on the station, ' +
    'build the launch workspace, draft the pre-flight checklist, assemble the flight crew, secure the launch keys, ' +
    'run a flight-computer health check, verify the flight software, and pass a final launch-readiness review before ' +
    'authorizing ignition — one continuous launch-preparation story.',
  track: 'linux',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 45,
  skills: ['filesystem navigation', 'files & directories', 'redirection', 'users & groups', 'permissions', 'processes'],
  tags: ['linux', 'terminal', 'launch', 'level-1'],
  objective:
    'Operate a spacecraft Linux system through eight graded missions, using real commands to bring every launch system to READY and authorize ignition.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'linux-l1-brief',
      type: 'mission_brief',
      order: 1,
      heading: 'Prepare for Launch',
      body:
        "You are a cadet at StarKid Command, and the spacecraft Aurora is your responsibility to prepare for launch. " +
        'Each stage is a real Linux terminal: you type commands, the system state changes, and mission control grades ' +
        'the result — not the exact commands you typed. Any correct approach counts.',
      context:
        'Stuck on a mission? Reveal hints one at a time — they go from a gentle nudge to the exact command. Use Reset to ' +
        'return a mission to its starting state. Type help in any terminal to see the available commands.',
      stats: ['8 missions', 'Graded on system state', 'Progressive hints'],
    },
    ...missions.map((mission, index) => ({
      id: `block-${mission.id}`,
      type: 'terminal_mission' as const,
      order: index + 2,
      title: mission.title,
      mission,
    })),
    {
      id: 'linux-l1-launch',
      type: 'launch_sequence',
      order: missions.length + 2,
      heading: 'Aurora Launch',
      requiresBlockId: `block-${mission8.id}`,
      holdMessage:
        'LAUNCH STATUS: HOLD — Final launch readiness is not yet complete. Return to Mission 8, clear every station to GO, and arm Aurora for ignition.',
      authorizedMessage: 'FINAL GO/NO-GO COMPLETE\nALL STATIONS: GO\nAURORA LAUNCH AUTHORIZED',
      badgeLabel: 'Linux Launch Operations — Level I Complete',
      completionMessage: 'Aurora is airborne. You learned enough Linux to launch a spacecraft, cadet — outstanding work.',
      nextSteps: ['Level II — Operate in Flight (coming soon)', 'Review your secured keys, checklist, and process logs'],
    },
  ],
  rewards: {
    badgeId: 'badge-linux-level-1',
    xp: 200,
  },
  createdAt: '2026-09-21T00:00:00Z',
  updatedAt: '2026-09-21T00:00:00Z',
}
