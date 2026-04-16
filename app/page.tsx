import Link from 'next/link';
import { modules } from '../lib/modules';

export default function Page(){
 const ready=modules.filter(m=>m.status==='ready');
 return <main className="shell"><nav className="nav"><div className="brand">Vercel by Auréliya</div><div className="links"><Link className="pill" href="/modules">Modules</Link><Link className="pill" href="/assistant">Assistant</Link><Link className="pill" href="/files">Files</Link><Link className="pill" href="/settings">Settings</Link></div></nav><section className="hero"><span className="badge">Private AI operating system</span><h1>Welcome back, Sabrina ✨</h1><p className="lead">A realistic, deployable Auréliya platform for workflows, files, modules, outreach, planning, and AI-supported operations.</p><div className="row"><Link className="button" href="/modules">Open modules</Link><Link className="btn" href="/assistant">Ask assistant</Link></div></section><section className="grid">{ready.map(m=><Link className="card" key={m.id} href={m.id==='home'?'/':`/${m.id}`}><h3>{m.name}</h3><p className="muted">{m.description}</p><span className="badge">{m.category}</span></Link>)}</section></main>
}
