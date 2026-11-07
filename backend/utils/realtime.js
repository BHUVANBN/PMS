import EventEmitter from 'events';
import jwt from 'jsonwebtoken';

// Global event bus for backend modules to publish events
export const eventBus = new EventEmitter();

// Keep listeners high for app-wide usage
eventBus.setMaxListeners(1000);

// In-memory registry of SSE clients keyed by channels
// Channels can be: user:<userId>, project:<projectId>, role:<role>, broadcast
const sseClients = new Map();

function addClient(channel, res) {
  if (!sseClients.has(channel)) sseClients.set(channel, new Set());
  sseClients.get(channel).add(res);
}

function removeClient(channel, res) {
  const set = sseClients.get(channel);
  if (set) {
    set.delete(res);
    if (set.size === 0) sseClients.delete(channel);
  }
}

function send(channel, payload) {
  const set = sseClients.get(channel);
  if (!set) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try { res.write(data); } catch (_) {}
  }
}

// Subscribe controllers to eventBus to fan-out to SSE channels
function setupEventFanout() {
  if (setupEventFanout.initialized) return;
  setupEventFanout.initialized = true;

  eventBus.on('broadcast', (payload) => send('broadcast', payload));
  eventBus.on('project', ({ projectId, ...payload }) => send(`project:${projectId}`, payload));
  eventBus.on('user', ({ userId, ...payload }) => send(`user:${userId}`, payload));
  eventBus.on('role', ({ role, ...payload }) => send(`role:${role}`, payload));

  eventBus.on('multicast', ({ users = [], projects = [], roles = [], payload }) => {
    users.forEach((u) => send(`user:${u}`, payload));
    projects.forEach((p) => send(`project:${p}`, payload));
    roles.forEach((r) => send(`role:${r}`, payload));
  });
}
setupEventFanout.initialized = false;

// ─── Authenticated SSE middleware ─────────────────────────────────────────────
const authenticateSSE = (req, res) => {
  // Try JWT from cookie first, then Authorization header
  const token = req.cookies?.token
    || req.headers.authorization?.replace('Bearer ', '')
    || req.query.token; // fallback for EventSource (which can't set headers)

  if (!token) {
    res.status(401).end('Unauthorized');
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    res.status(401).end('Invalid or expired token');
    return null;
  }
};

export function initRealtime(app) {
  setupEventFanout();

  // SSE endpoint: /api/events — requires authentication
  app.get('/api/events', (req, res) => {
    const user = authenticateSSE(req, res);
    if (!user) return; // response already ended

    // Derive channel from authenticated user identity (not from query params)
    const userId = user.id;
    const role = user.role;
    const projectId = req.query.projectId;

    // Priority: projectId channel → user channel
    const channel = projectId
      ? `project:${projectId}`
      : `user:${userId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Heartbeat to keep connections alive
    const heartbeat = setInterval(() => {
      try { res.write(':heartbeat\n\n'); } catch (_) {}
    }, 25000);

    addClient(channel, res);
    // Also subscribe to role-based channel
    addClient(`role:${role}`, res);

    res.write(`data: ${JSON.stringify({ type: 'connected', channel, userId })}\n\n`);

    req.on('close', () => {
      clearInterval(heartbeat);
      removeClient(channel, res);
      removeClient(`role:${role}`, res);
      try { res.end(); } catch (_) {}
    });
  });
}

// ─── Helper emitters for controllers ──────────────────────────────────────────
export function emitTicketEvent({ projectId, userIds = [], type, data }) {
  if (projectId) eventBus.emit('project', { projectId, type, data });
  if (userIds.length) eventBus.emit('multicast', { users: userIds, payload: { type, data, projectId } });
  eventBus.emit('broadcast', { type, data, projectId });
}

export function emitBugEvent({ projectId, userIds = [], type, data }) {
  emitTicketEvent({ projectId, userIds, type, data });
}

export function emitTesterKanbanUpdate({ projectId, testerId, ticketId, bug }) {
  emitTicketEvent({
    projectId,
    userIds: testerId ? [testerId] : [],
    type: 'kanban.tester.bug_created',
    data: { ticketId, bug },
  });
}

// Standup notifications
export function emitStandupEvent({ userId, type, data }) {
  if (userId) eventBus.emit('user', { userId, type, data });
  eventBus.emit('broadcast', { type, data });
}
