import { FormEvent, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
type User = { id: string; name: string; email: string };
type Member = { id: string; role: string; user: User };
type Column = { id: string; name: string; position: number };
type Task = { id: string; title: string; description?: string | null; priority: string; dueDate?: string | null; position: number; columnId: string; column: Column; assignee?: User | null; creator: User; _count: { comments: number } };
type Project = { id: string; name: string; description?: string | null; members: Member[]; columns: Column[]; tasks: Task[]; _count?: { tasks: number } };
type Notification = { id: string; message: string; read: boolean; createdAt: string };
type Comment = { id: string; body: string; createdAt: string; author: User };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('projectflow_token') ?? '');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem('projectflow_token', token);
    request<User>('/api/auth/me', {}, token).then(setUser).catch(() => { localStorage.removeItem('projectflow_token'); setToken(''); });
    request<Project[]>('/api/projects', {}, token).then(setProjects).catch(e => setError(e.message));
    request<Notification[]>('/api/notifications', {}, token).then(setNotifications).catch(() => undefined);
    const s = io(API, { auth: { token } });
    s.on('notification:created', (n: Notification) => setNotifications(prev => [n, ...prev]));
    s.on('task:updated', (task: Task) => setActive(prev => prev ? { ...prev, tasks: prev.tasks.map(t => t.id === task.id ? task : t) } : prev));
    s.on('task:created', (task: Task) => setActive(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : prev));
    s.on('comment:created', () => setSelectedTask(prev => prev ? { ...prev } : prev));
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [token]);

  const openProject = async (id: string) => {
    try { const project = await request<Project>(`/api/projects/${id}`, {}, token); setActive(project); socket?.emit('project:join', id); }
    catch (e) { setError((e as Error).message); }
  };
  const logout = () => { localStorage.removeItem('projectflow_token'); setToken(''); setUser(null); setActive(null); setProjects([]); };

  if (!token || !user) return <Auth mode={authMode} setMode={setAuthMode} onAuth={(t, u) => { setToken(t); setUser(u); }} error={error} />;

  return <div className="app-shell">
    <header className="topbar"><div><strong>ProjectFlow</strong><span className="muted"> / collaborative workspace</span></div><div className="top-actions"><button className="notification" onClick={() => setNotificationsOpen(setNotifications)}>{notifications.filter(n => !n.read).length} notifications</button><span>{user.name}</span><button className="ghost" onClick={logout}>Log out</button></div></header>
    {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}
    <div className="layout">
      <aside className="sidebar"><div className="sidebar-title">Your projects <button className="plus" onClick={() => setShowCreateProject(true)}>+</button></div>{projects.map(p => <button className={`project-link ${active?.id === p.id ? 'active' : ''}`} key={p.id} onClick={() => openProject(p.id)}><span>{p.name}</span><small>{p._count?.tasks ?? ''}</small></button>)}{projects.length === 0 && <p className="muted small">Create your first project.</p>}</aside>
      <main className="main">{active ? <Board project={active} token={token} user={user} onRefresh={() => openProject(active.id)} onTask={setSelectedTask} onCreate={setShowCreateTask} /> : <EmptyState onCreate={() => setShowCreateProject(true)} />}</main>
    </div>
    {showCreateProject && <CreateProject token={token} onClose={() => setShowCreateProject(false)} onCreated={p => { setProjects(prev => [p, ...prev]); setShowCreateProject(false); openProject(p.id); }} />}
    {showCreateTask && active && <CreateTask token={token} project={active} columnId={showCreateTask} onClose={() => setShowCreateTask(null)} onCreated={() => { setShowCreateTask(null); openProject(active.id); }} />}
    {selectedTask && active && <TaskModal token={token} task={selectedTask} project={active} onClose={() => setSelectedTask(null)} onChanged={() => openProject(active.id)} />}
  </div>;
}

function setNotificationsOpen(setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>) {
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
}

function Auth({ mode, setMode, onAuth, error }: { mode: 'login'|'register'; setMode: (m:'login'|'register')=>void; onAuth:(token:string,user:User)=>void; error:string }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState('demo@projectflow.local'); const [password, setPassword] = useState('ProjectFlow123!'); const [busy, setBusy] = useState(false); const [localError, setLocalError] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); setBusy(true); setLocalError(''); try { const data = await request<{token:string,user:User}>(`/api/auth/${mode}`, { method:'POST', body: JSON.stringify(mode === 'login' ? {email,password} : {name,email,password}) }); onAuth(data.token,data.user); } catch(e) { setLocalError((e as Error).message); } finally { setBusy(false); } };
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}><div className="brand">ProjectFlow</div><h1>{mode === 'login' ? 'Welcome back' : 'Create your workspace account'}</h1><p className="muted">Manage projects, tasks, comments and team updates in one place.</p>{mode === 'register' && <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" /></label>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>{(localError || error) && <div className="form-error">{localError || error}</div>}<button className="primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button><button type="button" className="link-button" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login' ? 'Need an account? Register' : 'Already have an account? Sign in'}</button></form></div>;
}

function EmptyState({onCreate}:{onCreate:()=>void}) { return <section className="empty"><div className="empty-icon">▦</div><h1>Build a project workspace</h1><p>Create a project, invite your team, and manage work from a live Kanban board.</p><button className="primary" onClick={onCreate}>Create project</button></section>; }

function Board({project,token,user,onRefresh,onTask,onCreate}:{project:Project;token:string;user:User;onRefresh:()=>void;onTask:(t:Task)=>void;onCreate:(columnId:string)=>void}) {
  const grouped = useMemo(()=>project.columns.map(c=>({...c,tasks:project.tasks.filter(t=>t.columnId===c.id).sort((a,b)=>a.position-b.position)})),[project]);
  const [dragged, setDragged] = useState<string|null>(null);
  const move = async (columnId:string) => { if(!dragged) return; const task=project.tasks.find(t=>t.id===dragged); if(!task || task.columnId===columnId) return; try { await request(`/api/tasks/${task.id}`, {method:'PATCH',body:JSON.stringify({columnId,position:Date.now()})},token); onRefresh(); } catch(e) {} setDragged(null); };
  return <div className="board-page"><div className="board-head"><div><div className="eyebrow">PROJECT</div><h1>{project.name}</h1><p>{project.description || 'Team project board'}</p></div><div className="members">{project.members.slice(0,5).map(m=><span title={m.user.email} className="avatar" key={m.id}>{m.user.name.slice(0,1).toUpperCase()}</span>)}<span className="member-count">{project.members.length} members</span></div></div><div className="board-grid">{grouped.map(column=><section className="column" key={column.id} onDragOver={e=>e.preventDefault()} onDrop={()=>move(column.id)}><div className="column-head"><span>{column.name}</span><span className="count">{column.tasks.length}</span><button className="plus" onClick={()=>onCreate(column.id)}>+</button></div><div className="task-list">{column.tasks.map(task=><article className="task-card" key={task.id} draggable onDragStart={()=>setDragged(task.id)} onClick={()=>onTask(task)}><div className="task-top"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>{task.assignee && <span className="avatar small-avatar">{task.assignee.name.slice(0,1)}</span>}</div><h3>{task.title}</h3>{task.description && <p>{task.description.slice(0,90)}{task.description.length>90?'…':''}</p>}<div className="task-meta"><span>💬 {task._count.comments}</span>{task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}</div></article>)}{column.tasks.length===0 && <div className="drop-hint">Drop tasks here</div>}</div></section>)}</div><div className="board-footer">Signed in as {user.email} · Drag cards between columns for real-time status changes.</div></div>;
}

function CreateProject({token,onClose,onCreated}:{token:string;onClose:()=>void;onCreated:(p:Project)=>void}) { const [name,setName]=useState('');const [description,setDescription]=useState('');const submit=async(e:FormEvent)=>{e.preventDefault();try{const p=await request<Project>('/api/projects',{method:'POST',body:JSON.stringify({name,description})},token);onCreated(p);}catch(e){alert((e as Error).message)}};return <Modal title="Create project" onClose={onClose}><form onSubmit={submit} className="form"><label>Project name<input autoFocus value={name} onChange={e=>setName(e.target.value)} required /></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What is this team working on?" /></label><button className="primary">Create project</button></form></Modal>; }

function CreateTask({token,project,columnId,onClose,onCreated}:{token:string;project:Project;columnId:string;onClose:()=>void;onCreated:()=>void}) { const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [priority,setPriority]=useState('MEDIUM');const [assigneeId,setAssigneeId]=useState('');const submit=async(e:FormEvent)=>{e.preventDefault();try{await request(`/api/projects/${project.id}/tasks`,{method:'POST',body:JSON.stringify({title,description,priority,columnId,assigneeId:assigneeId||null})},token);onCreated();}catch(e){alert((e as Error).message)}};return <Modal title="Create task" onClose={onClose}><form onSubmit={submit} className="form"><label>Task title<input autoFocus value={title} onChange={e=>setTitle(e.target.value)} required /></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} /></label><div className="two"><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option></select></label><label>Assignee<select value={assigneeId} onChange={e=>setAssigneeId(e.target.value)}><option value="">Unassigned</option>{project.members.map(m=><option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</select></label></div><button className="primary">Create task</button></form></Modal>; }

function TaskModal({token,task,project,onClose,onChanged}:{token:string;task:Task;project:Project;onClose:()=>void;onChanged:()=>void}) { const [comments,setComments]=useState<Comment[]>([]);const [body,setBody]=useState('');const [saving,setSaving]=useState(false);useEffect(()=>{request<Comment[]>(`/api/tasks/${task.id}/comments`,{},token).then(setComments).catch(()=>undefined)},[task.id,token]);const save=async(e:FormEvent)=>{e.preventDefault();if(!body.trim())return;setSaving(true);try{const c=await request<Comment>(`/api/tasks/${task.id}/comments`,{method:'POST',body:JSON.stringify({body})},token);setComments(p=>[...p,c]);setBody('');}finally{setSaving(false)}};const update=async(patch:Record<string,unknown>)=>{await request(`/api/tasks/${task.id}`,{method:'PATCH',body:JSON.stringify(patch)},token);onChanged()};return <Modal title={task.title} onClose={onClose}><div className="task-detail"><div className="detail-grid"><div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><p className="detail-description">{task.description || 'No description.'}</p></div><div className="detail-controls"><label>Status<select value={task.columnId} onChange={e=>update({columnId:e.target.value})}>{project.columns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Assignee<select value={task.assignee?.id ?? ''} onChange={e=>update({assigneeId:e.target.value||null})}><option value="">Unassigned</option>{project.members.map(m=><option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</select></label></div></div><hr/><h3>Comments</h3><div className="comments">{comments.map(c=><div className="comment" key={c.id}><div className="comment-head"><strong>{c.author.name}</strong><span>{new Date(c.createdAt).toLocaleString()}</span></div><p>{c.body}</p></div>)}{comments.length===0&&<p className="muted">No comments yet.</p>}</div><form onSubmit={save} className="comment-form"><input value={body} onChange={e=>setBody(e.target.value)} placeholder="Write a comment…" /><button className="primary" disabled={saving}>Send</button></form></div></Modal>; }

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="ghost" onClick={onClose}>✕</button></div>{children}</div></div>}
