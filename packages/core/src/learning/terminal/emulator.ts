// Browser-emulated Linux environment.
//
// A pure, deterministic interpreter over an in-memory filesystem. Every command
// returns a NEW state (structural clone) so missions are reproducible and reset
// is just "re-create the initial state". No real process is ever spawned, so
// there is nothing to escape — the whole machine lives in the student's tab.
//
// Scope: the Linux Level I command set. Later levels can extend `runCommand`
// and, when a real sandbox is introduced, this module is swapped for a bridge
// that satisfies the same CommandResult contract.

import type {
  CommandResult,
  EmulatorInit,
  EmulatorState,
  FsNode,
  FsNodeType,
  GroupAccount,
  UserAccount,
} from './types'

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

export function normalizePath(cwd: string, input: string, home = '/root'): string {
  let path = input.trim()
  if (path === '' || path === '.') path = cwd
  if (path === '~') path = home
  else if (path.startsWith('~/')) path = home + path.slice(1)

  const isAbsolute = path.startsWith('/')
  const base = isAbsolute ? [] : cwd.split('/').filter(Boolean)
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') base.pop()
    else base.push(part)
  }
  return '/' + base.join('/')
}

function parentOf(absPath: string): { parent: string; name: string } {
  if (absPath === '/') return { parent: '/', name: '' }
  const parts = absPath.split('/').filter(Boolean)
  const name = parts.pop() as string
  return { parent: '/' + parts.join('/'), name }
}

// ---------------------------------------------------------------------------
// Filesystem accessors (operate on a cloned tree)
// ---------------------------------------------------------------------------

function getNode(root: FsNode, absPath: string): FsNode | null {
  if (absPath === '/') return root
  let node: FsNode = root
  for (const part of absPath.split('/').filter(Boolean)) {
    if (node.type !== 'dir' || !node.children || !node.children[part]) return null
    node = node.children[part]
  }
  return node
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function nowNode(type: FsNodeType, owner: string, group: string, mode: number): FsNode {
  const node: FsNode = { type, mode, owner, group, mtime: 0 }
  if (type === 'dir') node.children = {}
  else node.content = ''
  return node
}

// ---------------------------------------------------------------------------
// Permission formatting
// ---------------------------------------------------------------------------

export function modeToRwx(node: FsNode): string {
  const typeChar = node.type === 'dir' ? 'd' : '-'
  const bits = node.mode & 0o777
  const trip = (b: number) =>
    (b & 4 ? 'r' : '-') + (b & 2 ? 'w' : '-') + (b & 1 ? 'x' : '-')
  return typeChar + trip((bits >> 6) & 7) + trip((bits >> 3) & 7) + trip(bits & 7)
}

// ---------------------------------------------------------------------------
// State construction
// ---------------------------------------------------------------------------

const DEFAULT_PROCESSES = [
  { pid: 1, user: 'root', command: '/sbin/init', cpu: 0.0, mem: 0.1 },
]

export function createEmulator(init: EmulatorInit = {}): EmulatorState {
  const user = init.user ?? 'cadet'
  const home = init.home ?? (user === 'root' ? '/root' : `/home/${user}`)
  const hostname = init.hostname ?? 'starship'

  const groups: Record<string, GroupAccount> = {}
  const users: Record<string, UserAccount> = {}

  // Base accounts so `id`, `whoami`, ownership all resolve out of the box.
  groups.root = { name: 'root', gid: 0, members: [] }
  users.root = { name: 'root', uid: 0, primaryGroup: 'root', groups: ['root'] }
  if (user !== 'root') {
    groups[user] = { name: user, gid: 1000, members: [] }
    users[user] = { name: user, uid: 1000, primaryGroup: user, groups: [user] }
  }

  for (const g of init.groups ?? []) groups[g.name] = clone(g)
  for (const u of init.users ?? []) users[u.name] = clone(u)

  const root: FsNode = nowNode('dir', 'root', 'root', 0o755)
  const state: EmulatorState = {
    cwd: init.cwd ?? home,
    user,
    hostname,
    home,
    users,
    groups,
    processes: clone(init.processes ?? DEFAULT_PROCESSES),
    fs: root,
    env: { HOME: home, USER: user, PWD: init.cwd ?? home, HOSTNAME: hostname, ...(init.env ?? {}) },
    lastExitCode: 0,
  }

  // Standard skeleton so navigation missions have somewhere to go.
  ensureDir(state.fs, '/home', 'root', 'root', 0o755)
  ensureDir(state.fs, '/root', 'root', 'root', 0o700)
  ensureDir(state.fs, '/tmp', 'root', 'root', 0o777)
  if (user !== 'root') ensureDir(state.fs, home, user, user, 0o755)

  for (const f of init.files ?? []) {
    const type = f.type ?? 'file'
    const node = ensurePath(state.fs, f.path, type, f.owner ?? 'root', f.group ?? 'root')
    node.mode = f.mode ?? (type === 'dir' ? 0o755 : 0o644)
    if (type === 'file' && f.content !== undefined) node.content = f.content
    if (f.owner) node.owner = f.owner
    if (f.group) node.group = f.group
  }

  return state
}

function ensureDir(root: FsNode, absPath: string, owner: string, group: string, mode: number): FsNode {
  if (absPath === '/') return root
  let node = root
  for (const part of absPath.split('/').filter(Boolean)) {
    node.children = node.children ?? {}
    if (!node.children[part]) node.children[part] = nowNode('dir', owner, group, mode)
    node = node.children[part]
  }
  return node
}

function ensurePath(root: FsNode, absPath: string, type: FsNodeType, owner: string, group: string): FsNode {
  const { parent, name } = parentOf(absPath)
  const parentNode = ensureDir(root, parent, owner, group, 0o755)
  parentNode.children = parentNode.children ?? {}
  if (!parentNode.children[name]) {
    parentNode.children[name] = nowNode(type, owner, group, type === 'dir' ? 0o755 : 0o644)
  }
  return parentNode.children[name]
}

// ---------------------------------------------------------------------------
// Command interpreter
// ---------------------------------------------------------------------------

const OK = (state: EmulatorState, output = '', clear = false): CommandResult => ({
  state: { ...state, lastExitCode: 0 },
  output,
  exitCode: 0,
  clear,
})

const ERR = (state: EmulatorState, output: string, code = 1): CommandResult => ({
  state: { ...state, lastExitCode: code },
  output,
  exitCode: code,
})

/**
 * Execute a single command line and return the resulting state + output.
 * Supports one level of `| grep <pattern>` and `>`/`>>` redirection.
 */
export function runCommand(prev: EmulatorState, raw: string): CommandResult {
  const line = raw.trim()
  if (line === '') return OK(prev)

  // Work on a clone so the caller's state is never mutated.
  const state: EmulatorState = clone(prev)

  // Redirection (> file, >> file) — split before pipes so `echo x > f` works.
  let redirect: { target: string; append: boolean } | null = null
  let body = line
  const redirMatch = line.match(/^(.*?)\s*(>>|>)\s*(\S+)\s*$/)
  if (redirMatch) {
    body = redirMatch[1]
    redirect = { target: redirMatch[3], append: redirMatch[2] === '>>' }
  }

  // Single pipe to grep.
  let grepPattern: string | null = null
  if (body.includes('|')) {
    const [left, right] = body.split('|')
    const rightTokens = tokenize(right)
    if (rightTokens[0] === 'grep' && rightTokens[1]) {
      grepPattern = rightTokens.slice(1).join(' ').replace(/^['"]|['"]$/g, '')
      body = left
    }
  }

  const tokens = tokenize(body)
  const cmd = tokens[0]
  const args = tokens.slice(1)

  let result = dispatch(state, cmd, args)

  if (grepPattern && result.exitCode === 0) {
    const filtered = result.output
      .split('\n')
      .filter((l) => l.includes(grepPattern as string))
      .join('\n')
    result = { ...result, output: filtered }
  }

  if (redirect && result.exitCode === 0) {
    const abs = normalizePath(result.state.cwd, redirect.target, result.state.home)
    const { parent, name } = parentOf(abs)
    const parentNode = getNode(result.state.fs, parent)
    if (!parentNode || parentNode.type !== 'dir') {
      return ERR(result.state, `bash: ${redirect.target}: No such file or directory`)
    }
    parentNode.children = parentNode.children ?? {}
    const existing = parentNode.children[name]
    const text = result.output ? result.output + '\n' : ''
    if (existing && existing.type === 'file') {
      existing.content = redirect.append ? (existing.content ?? '') + text : text
    } else {
      const node = nowNode('file', result.state.user, primaryGroupOf(result.state, result.state.user), 0o644)
      node.content = text
      parentNode.children[name] = node
    }
    return OK(result.state)
  }

  return result
}

function tokenize(input: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input)) !== null) {
    out.push(m[1] ?? m[2] ?? m[3])
  }
  return out
}

function primaryGroupOf(state: EmulatorState, user: string): string {
  return state.users[user]?.primaryGroup ?? user
}

function dispatch(state: EmulatorState, cmd: string, args: string[]): CommandResult {
  switch (cmd) {
    case undefined:
      return OK(state)
    case 'pwd':
      return OK(state, state.cwd)
    case 'whoami':
      return OK(state, state.user)
    case 'hostname':
      return OK(state, state.hostname)
    case 'clear':
      return OK(state, '', true)
    case 'echo':
      return OK(state, echoText(args))
    case 'cd':
      return cd(state, args)
    case 'ls':
      return ls(state, args)
    case 'mkdir':
      return mkdir(state, args)
    case 'touch':
      return touch(state, args)
    case 'cat':
      return cat(state, args)
    case 'rm':
      return rm(state, args)
    case 'cp':
      return cpmv(state, args, 'cp')
    case 'mv':
      return cpmv(state, args, 'mv')
    case 'chmod':
      return chmod(state, args)
    case 'chown':
      return chown(state, args, 'owner')
    case 'chgrp':
      return chown(state, args, 'group')
    case 'id':
      return id(state, args)
    case 'groups':
      return groupsCmd(state, args)
    case 'useradd':
      return useradd(state, args)
    case 'groupadd':
      return groupadd(state, args)
    case 'usermod':
      return usermod(state, args)
    case 'ps':
      return ps(state, args)
    case 'df':
      return OK(state, 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1       20961280 6291456  14669824  31% /')
    case 'free':
      return OK(state, '               total        used        free\nMem:         2048000      512000     1536000\nSwap:        1048576           0     1048576')
    case 'uptime':
      return OK(state, ' 12:00:00 up 3 days,  4:21,  1 user,  load average: 0.08, 0.03, 0.01')
    case 'uname':
      return uname(state, args)
    case 'help':
      return OK(state, HELP)
    case 'grep':
      return grepStandalone(state, args)
    default:
      return ERR(state, `${cmd}: command not found`, 127)
  }
}

function echoText(args: string[]): string {
  // Strip surrounding quotes already handled by tokenizer.
  return args.join(' ')
}

function cd(state: EmulatorState, args: string[]): CommandResult {
  const target = args[0] ?? state.home
  const abs = normalizePath(state.cwd, target, state.home)
  const node = getNode(state.fs, abs)
  if (!node) return ERR(state, `cd: ${target}: No such file or directory`)
  if (node.type !== 'dir') return ERR(state, `cd: ${target}: Not a directory`)
  state.cwd = abs
  state.env.PWD = abs
  return OK(state)
}

function ls(state: EmulatorState, args: string[]): CommandResult {
  const flags = args.filter((a) => a.startsWith('-')).join('')
  const long = flags.includes('l')
  const all = flags.includes('a')
  const paths = args.filter((a) => !a.startsWith('-'))
  const target = paths[0] ?? state.cwd
  const abs = normalizePath(state.cwd, target, state.home)
  const node = getNode(state.fs, abs)
  if (!node) return ERR(state, `ls: cannot access '${target}': No such file or directory`, 2)

  if (node.type === 'file') {
    return OK(state, long ? longLine(node, parentOf(abs).name) : parentOf(abs).name)
  }

  const entries = Object.entries(node.children ?? {}).sort(([a], [b]) => a.localeCompare(b))
  const names = all ? [['.', node] as const, ['..', node] as const, ...entries] : entries
  if (long) {
    const lines = names.map(([name, child]) => longLine(child as FsNode, name))
    return OK(state, lines.join('\n'))
  }
  return OK(state, names.map(([name]) => name).join('  '))
}

function longLine(node: FsNode, name: string): string {
  const size = node.type === 'file' ? (node.content?.length ?? 0) : 4096
  return `${modeToRwx(node)} 1 ${node.owner} ${node.group} ${String(size).padStart(5)} Jan  1 00:00 ${name}`
}

function mkdir(state: EmulatorState, args: string[]): CommandResult {
  const recursive = args.includes('-p')
  const targets = args.filter((a) => !a.startsWith('-'))
  if (!targets.length) return ERR(state, 'mkdir: missing operand')
  for (const t of targets) {
    const abs = normalizePath(state.cwd, t, state.home)
    const { parent, name } = parentOf(abs)
    const parentNode = getNode(state.fs, parent)
    if (!parentNode || parentNode.type !== 'dir') {
      if (recursive) {
        ensureDir(state.fs, abs, state.user, primaryGroupOf(state, state.user), 0o755)
        continue
      }
      return ERR(state, `mkdir: cannot create directory '${t}': No such file or directory`)
    }
    parentNode.children = parentNode.children ?? {}
    if (parentNode.children[name]) {
      if (recursive) continue
      return ERR(state, `mkdir: cannot create directory '${t}': File exists`)
    }
    parentNode.children[name] = nowNode('dir', state.user, primaryGroupOf(state, state.user), 0o755)
  }
  return OK(state)
}

function touch(state: EmulatorState, args: string[]): CommandResult {
  const targets = args.filter((a) => !a.startsWith('-'))
  if (!targets.length) return ERR(state, 'touch: missing file operand')
  for (const t of targets) {
    const abs = normalizePath(state.cwd, t, state.home)
    const { parent, name } = parentOf(abs)
    const parentNode = getNode(state.fs, parent)
    if (!parentNode || parentNode.type !== 'dir') {
      return ERR(state, `touch: cannot touch '${t}': No such file or directory`)
    }
    parentNode.children = parentNode.children ?? {}
    if (!parentNode.children[name]) {
      parentNode.children[name] = nowNode('file', state.user, primaryGroupOf(state, state.user), 0o644)
    }
  }
  return OK(state)
}

function cat(state: EmulatorState, args: string[]): CommandResult {
  const targets = args.filter((a) => !a.startsWith('-'))
  if (!targets.length) return OK(state, '')
  const chunks: string[] = []
  for (const t of targets) {
    const abs = normalizePath(state.cwd, t, state.home)
    const node = getNode(state.fs, abs)
    if (!node) return ERR(state, `cat: ${t}: No such file or directory`)
    if (node.type === 'dir') return ERR(state, `cat: ${t}: Is a directory`)
    chunks.push((node.content ?? '').replace(/\n$/, ''))
  }
  return OK(state, chunks.join('\n'))
}

function rm(state: EmulatorState, args: string[]): CommandResult {
  const flags = args.filter((a) => a.startsWith('-')).join('')
  const recursive = flags.includes('r') || flags.includes('R')
  const force = flags.includes('f')
  const targets = args.filter((a) => !a.startsWith('-'))
  if (!targets.length) return force ? OK(state) : ERR(state, 'rm: missing operand')
  for (const t of targets) {
    const abs = normalizePath(state.cwd, t, state.home)
    const { parent, name } = parentOf(abs)
    const parentNode = getNode(state.fs, parent)
    const node = parentNode?.children?.[name]
    if (!node) {
      if (force) continue
      return ERR(state, `rm: cannot remove '${t}': No such file or directory`)
    }
    if (node.type === 'dir' && !recursive) {
      return ERR(state, `rm: cannot remove '${t}': Is a directory`)
    }
    delete parentNode!.children![name]
  }
  return OK(state)
}

function cpmv(state: EmulatorState, args: string[], mode: 'cp' | 'mv'): CommandResult {
  const flags = args.filter((a) => a.startsWith('-')).join('')
  const recursive = flags.includes('r') || flags.includes('R')
  const operands = args.filter((a) => !a.startsWith('-'))
  if (operands.length < 2) return ERR(state, `${mode}: missing destination file operand`)
  const srcRaw = operands[0]
  const destRaw = operands[1]
  const srcAbs = normalizePath(state.cwd, srcRaw, state.home)
  const srcNode = getNode(state.fs, srcAbs)
  if (!srcNode) return ERR(state, `${mode}: cannot stat '${srcRaw}': No such file or directory`)
  if (srcNode.type === 'dir' && mode === 'cp' && !recursive) {
    return ERR(state, `cp: -r not specified; omitting directory '${srcRaw}'`)
  }

  let destAbs = normalizePath(state.cwd, destRaw, state.home)
  const destNode = getNode(state.fs, destAbs)
  // If destination is an existing directory, copy INTO it.
  let destName: string
  let destParentPath: string
  if (destNode && destNode.type === 'dir') {
    destParentPath = destAbs
    destName = parentOf(srcAbs).name
    destAbs = normalizePath(destAbs, destName, state.home)
  } else {
    const p = parentOf(destAbs)
    destParentPath = p.parent
    destName = p.name
  }
  const destParent = getNode(state.fs, destParentPath)
  if (!destParent || destParent.type !== 'dir') {
    return ERR(state, `${mode}: cannot create '${destRaw}': No such file or directory`)
  }
  destParent.children = destParent.children ?? {}
  destParent.children[destName] = clone(srcNode)

  if (mode === 'mv') {
    const { parent, name } = parentOf(srcAbs)
    const srcParent = getNode(state.fs, parent)
    if (srcParent?.children) delete srcParent.children[name]
  }
  return OK(state)
}

function parseMode(spec: string, current: number): number | null {
  // Numeric, e.g. 644, 0644, 0o600.
  if (/^0?o?[0-7]{3,4}$/.test(spec)) {
    const digits = spec.replace(/^0o?/, '')
    return parseInt(digits, 8) & 0o7777
  }
  // Symbolic, e.g. u+x, g-w, o+r, a+rwx, ug+rw.
  const m = spec.match(/^([ugoa]*)([+\-=])([rwx]+)$/)
  if (!m) return null
  const who = m[1] || 'a'
  const op = m[2]
  const perms = m[3]
  let bits = 0
  if (perms.includes('r')) bits |= 4
  if (perms.includes('w')) bits |= 2
  if (perms.includes('x')) bits |= 1
  const targets: number[] = []
  if (who.includes('u') || who.includes('a')) targets.push(6)
  if (who.includes('g') || who.includes('a')) targets.push(3)
  if (who.includes('o') || who.includes('a')) targets.push(0)
  let mode = current & 0o7777
  for (const shift of targets) {
    const mask = bits << shift
    if (op === '+') mode |= mask
    else if (op === '-') mode &= ~mask
    else mode = (mode & ~(7 << shift)) | mask
  }
  return mode
}

function chmod(state: EmulatorState, args: string[]): CommandResult {
  const recursive = args.includes('-R')
  const operands = args.filter((a) => !a.startsWith('-'))
  const [spec, ...targets] = operands
  if (!spec || !targets.length) return ERR(state, 'chmod: missing operand')
  for (const t of targets) {
    const abs = normalizePath(state.cwd, t, state.home)
    const node = getNode(state.fs, abs)
    if (!node) return ERR(state, `chmod: cannot access '${t}': No such file or directory`)
    const applied = applyMode(node, spec, recursive)
    if (applied === false) return ERR(state, `chmod: invalid mode: '${spec}'`)
  }
  return OK(state)
}

function applyMode(node: FsNode, spec: string, recursive: boolean): boolean {
  const next = parseMode(spec, node.mode)
  if (next === null) return false
  node.mode = next
  if (recursive && node.type === 'dir' && node.children) {
    for (const child of Object.values(node.children)) applyMode(child, spec, true)
  }
  return true
}

function chown(state: EmulatorState, args: string[], field: 'owner' | 'group'): CommandResult {
  const recursive = args.includes('-R')
  const operands = args.filter((a) => !a.startsWith('-'))
  const [spec, ...targets] = operands
  if (!spec || !targets.length) return ERR(state, `${field === 'owner' ? 'chown' : 'chgrp'}: missing operand`)
  // chown supports user:group.
  let owner: string | null = null
  let group: string | null = null
  if (field === 'owner') {
    const [o, g] = spec.split(':')
    owner = o || null
    group = g || null
  } else {
    group = spec
  }
  for (const t of targets) {
    const abs = normalizePath(state.cwd, t, state.home)
    const node = getNode(state.fs, abs)
    if (!node) return ERR(state, `chown: cannot access '${t}': No such file or directory`)
    applyOwnership(node, owner, group, recursive)
  }
  return OK(state)
}

function applyOwnership(node: FsNode, owner: string | null, group: string | null, recursive: boolean): void {
  if (owner) node.owner = owner
  if (group) node.group = group
  if (recursive && node.type === 'dir' && node.children) {
    for (const child of Object.values(node.children)) applyOwnership(child, owner, group, true)
  }
}

function id(state: EmulatorState, args: string[]): CommandResult {
  const name = args[0] ?? state.user
  const user = state.users[name]
  if (!user) return ERR(state, `id: '${name}': no such user`)
  const primary = state.groups[user.primaryGroup]
  const groupList = user.groups
    .map((g) => {
      const grp = state.groups[g]
      return grp ? `${grp.gid}(${grp.name})` : `1000(${g})`
    })
    .join(',')
  return OK(
    state,
    `uid=${user.uid}(${user.name}) gid=${primary?.gid ?? 1000}(${user.primaryGroup}) groups=${groupList}`
  )
}

function groupsCmd(state: EmulatorState, args: string[]): CommandResult {
  const name = args[0] ?? state.user
  const user = state.users[name]
  if (!user) return ERR(state, `groups: '${name}': no such user`)
  return OK(state, user.groups.join(' '))
}

function useradd(state: EmulatorState, args: string[]): CommandResult {
  const name = args.filter((a) => !a.startsWith('-')).pop()
  if (!name) return ERR(state, 'useradd: missing operand')
  if (state.users[name]) return ERR(state, `useradd: user '${name}' already exists`, 9)
  const uid = 1000 + Object.keys(state.users).length
  // Primary group mirrors the username by default (Debian/RH behaviour).
  if (!state.groups[name]) state.groups[name] = { name, gid: uid, members: [] }
  state.users[name] = { name, uid, primaryGroup: name, groups: [name] }
  // Support `useradd -g <group>` and `useradd -G <g1,g2>`.
  const gIndex = args.indexOf('-g')
  if (gIndex >= 0 && args[gIndex + 1]) {
    const g = args[gIndex + 1]
    state.users[name].primaryGroup = g
    if (!state.users[name].groups.includes(g)) state.users[name].groups.push(g)
  }
  const bigG = args.indexOf('-G')
  if (bigG >= 0 && args[bigG + 1]) {
    for (const g of args[bigG + 1].split(',')) addUserToGroup(state, name, g)
  }
  return OK(state)
}

function groupadd(state: EmulatorState, args: string[]): CommandResult {
  const name = args.filter((a) => !a.startsWith('-')).pop()
  if (!name) return ERR(state, 'groupadd: missing operand')
  if (state.groups[name]) return ERR(state, `groupadd: group '${name}' already exists`, 9)
  const gid = 1000 + Object.keys(state.groups).length
  state.groups[name] = { name, gid, members: [] }
  return OK(state)
}

function usermod(state: EmulatorState, args: string[]): CommandResult {
  const name = args.filter((a) => !a.startsWith('-')).pop()
  if (!name || !state.users[name]) return ERR(state, `usermod: user '${name ?? ''}' does not exist`, 6)
  const aG = args.includes('-aG')
  const g = args.indexOf('-G')
  const groupArgIndex = aG ? args.indexOf('-aG') + 1 : g >= 0 ? g + 1 : -1
  if (groupArgIndex < 0 || !args[groupArgIndex]) return ERR(state, 'usermod: no groups specified')
  const target = args[groupArgIndex]
  if (!aG && g >= 0) {
    // -G replaces secondary groups (keep primary).
    const primary = state.users[name].primaryGroup
    for (const grp of Object.values(state.groups)) {
      grp.members = grp.members.filter((m) => m !== name)
    }
    state.users[name].groups = [primary]
    state.groups[primary] && (state.groups[primary].members = state.groups[primary].members)
  }
  for (const grp of target.split(',')) addUserToGroup(state, name, grp)
  return OK(state)
}

function addUserToGroup(state: EmulatorState, user: string, group: string): void {
  if (!state.groups[group]) {
    const gid = 1000 + Object.keys(state.groups).length
    state.groups[group] = { name: group, gid, members: [] }
  }
  if (!state.groups[group].members.includes(user)) state.groups[group].members.push(user)
  if (state.users[user] && !state.users[user].groups.includes(group)) {
    state.users[user].groups.push(group)
  }
}

function ps(state: EmulatorState, args: string[]): CommandResult {
  const header = 'PID TTY          TIME CMD'
  const wide = args.some((a) => a.includes('a') || a.includes('e') || a.includes('u') || a.includes('x'))
  const lines = state.processes.map((p) =>
    wide
      ? `${String(p.pid).padStart(5)} ${p.user.padEnd(8)} ${p.command}`
      : `${String(p.pid).padStart(5)} pts/0    00:00:00 ${p.command.split('/').pop()}`
  )
  const head = wide ? '  PID USER     COMMAND' : header
  return OK(state, [head, ...lines].join('\n'))
}

function uname(state: EmulatorState, args: string[]): CommandResult {
  const flags = args.join('')
  if (flags.includes('a')) {
    return OK(state, `Linux ${state.hostname} 6.1.0-starkid #1 SMP x86_64 GNU/Linux`)
  }
  if (flags.includes('r')) return OK(state, '6.1.0-starkid')
  return OK(state, 'Linux')
}

function grepStandalone(state: EmulatorState, args: string[]): CommandResult {
  const operands = args.filter((a) => !a.startsWith('-'))
  const pattern = operands[0]
  const file = operands[1]
  if (!pattern || !file) return ERR(state, 'usage: grep PATTERN FILE')
  const abs = normalizePath(state.cwd, file, state.home)
  const node = getNode(state.fs, abs)
  if (!node || node.type !== 'file') return ERR(state, `grep: ${file}: No such file or directory`, 2)
  const matched = (node.content ?? '')
    .split('\n')
    .filter((l) => l.includes(pattern))
    .join('\n')
  return matched ? OK(state, matched) : ERR(state, '', 1)
}

const HELP = [
  'Available commands (Linux Level I):',
  '  pwd ls cd whoami hostname clear echo',
  '  mkdir touch cp mv rm cat',
  '  chmod chown chgrp id groups useradd groupadd usermod',
  '  ps df free uptime uname grep help',
].join('\n')

export { getNode }
