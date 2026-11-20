"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, WandSparkles, LayoutDashboard, History, Heart, Settings, LogIn,
  LogOut, Copy, Download, Plus, Search, Menu, X, ShieldCheck, UserRound,
  Gamepad2, Smartphone, Globe, Bot, Palette, Rocket, Image as ImageIcon,
  Film, Trash2, Save, ChevronRight, Zap, Database, BookOpen, Check
} from "lucide-react";
import { supabase, supabaseReady } from "../lib/supabase";
import { categories, buildPrompt } from "../lib/prompt-templates";

const iconMap = { game: Gamepad2, apk: Smartphone, website: Globe, chatbot: Bot, uiux: Palette, business: Rocket, image: ImageIcon, video: Film, custom: WandSparkles };
const emptyForm = { category: "game", title: "", description: "", audience: "", platform: "", constraints: "", detail: "Lengkap", language: "Bahasa Indonesia" };

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState("builder");
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [templatesQuery, setTemplatesQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    if (!supabaseReady) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadUserData();
    else { setProfile(null); setHistory([]); setFavorites([]); }
  }, [user]);

  async function loadUserData() {
    const [{ data: p }, { data: h }, { data: f }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("prompts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("prompts").select("*").eq("user_id", user.id).eq("is_favorite", true).order("created_at", { ascending: false })
    ]);
    setProfile(p || null); setHistory(h || []); setFavorites(f || []);
  }

  async function handleAuth(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    if (!supabaseReady) { setMessage("Supabase belum dikonfigurasi. Isi environment variables terlebih dahulu."); setBusy(false); return; }
    let result;
    if (authMode === "signup") {
      result = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authName } } });
      if (!result.error) setMessage("Pendaftaran berhasil. Jika konfirmasi email aktif, cek inbox untuk verifikasi.");
    } else result = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (result?.error) setMessage(result.error.message);
    setBusy(false);
  }

  async function logout() { await supabase?.auth.signOut(); setActive("builder"); setMessage("Kamu sudah logout."); }

  async function savePrompt(text = prompt, favorite = false) {
    if (!user) { setMessage("Login terlebih dahulu untuk menyimpan prompt."); return; }
    if (!text.trim()) return;
    const { error } = await supabase.from("prompts").insert({
      user_id: user.id, title: form.title || "Prompt tanpa judul",
      category: form.category, content: text, is_favorite: favorite
    });
    if (error) setMessage(error.message);
    else { setMessage("Prompt berhasil disimpan."); await loadUserData(); }
  }

  async function toggleFavorite(item) {
    const { error } = await supabase.from("prompts").update({ is_favorite: !item.is_favorite }).eq("id", item.id);
    if (error) setMessage(error.message); else await loadUserData();
  }

  async function deletePrompt(id) {
    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (error) setMessage(error.message); else { setMessage("Prompt dihapus."); await loadUserData(); }
  }

  async function openAdmin() {
    setActive("admin");
    const { data, error } = await supabase.rpc("admin_overview");
    if (error) { setMessage("Akses admin ditolak atau fungsi admin_overview belum dibuat."); return; }
    setAdminStats(data);
    const { data: users } = await supabase.rpc("admin_list_profiles");
    setAdminUsers(users || []);
  }

  function generate() {
    const text = buildPrompt(form);
    setPrompt(text); setMessage("Master prompt berhasil dibuat.");
  }

  async function copyPrompt(text = prompt) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setMessage("Prompt berhasil disalin."); }
    catch { setMessage("Clipboard tidak tersedia. Pilih dan salin teks secara manual."); }
  }

  function downloadPrompt(text = prompt, title = form.title || "master-prompt") {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`; a.click(); URL.revokeObjectURL(url);
  }

  const filteredCategories = useMemo(() => categories.filter(c => (c.name + c.desc).toLowerCase().includes(templatesQuery.toLowerCase())), [templatesQuery]);
  const nav = [
    ["builder", "Prompt Builder", WandSparkles], ["templates", "Template Library", BookOpen],
    ["history", "Riwayat Prompt", History], ["favorites", "Favorit", Heart]
  ];

  function Sidebar() {
    return <aside className={`${mobileNav ? "fixed inset-0 z-50 flex" : "hidden"} lg:flex lg:static lg:w-64 lg:shrink-0`}>
      <div className="absolute inset-0 bg-black/60 lg:hidden" onClick={() => setMobileNav(false)} />
      <div className="relative flex w-72 flex-col border-r border-slate-800 bg-[#0b1020] p-4 lg:w-64">
        <div className="mb-8 flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-600 p-2"><Sparkles size={21}/></div><div><div className="font-black tracking-wide">MY CUSTOM</div><div className="text-xs font-bold text-violet-400">PROMPT BUILDER</div></div></div>
          <button className="lg:hidden text-slate-400" onClick={() => setMobileNav(false)}><X/></button>
        </div>
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Workspace</div>
        {nav.map(([id, label, Icon]) => <button key={id} onClick={() => { setActive(id); setMobileNav(false); }} className={`nav-item ${active === id ? "active" : ""}`}><Icon size={18}/>{label}</button>)}
        {user && <button onClick={openAdmin} className={`nav-item ${active === "admin" ? "active" : ""}`}><LayoutDashboard size={18}/>Admin Dashboard</button>}
        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3"><div className="flex items-center gap-2 text-sm font-bold text-violet-200"><Zap size={16}/> Prompt Studio</div><p className="mt-1 text-xs leading-relaxed text-slate-400">Ubah ide menjadi instruksi AI yang terstruktur.</p></div>
          {user ? <div className="rounded-xl border border-slate-800 p-3"><div className="flex items-center gap-2"><UserRound size={17}/><div className="min-w-0"><div className="truncate text-sm font-semibold">{profile?.full_name || user.email}</div><div className="text-xs text-slate-500">{profile?.role || "user"}</div></div></div><button onClick={logout} className="mt-3 flex w-full items-center gap-2 text-xs text-slate-400 hover:text-white"><LogOut size={14}/> Keluar</button></div> : <button className="btn btn-primary w-full" onClick={() => { setActive("auth"); setMobileNav(false); }}><LogIn size={16}/> Login / Register</button>}
        </div>
      </div>
    </aside>;
  }

  function AuthPanel() {
    return <div className="mx-auto max-w-md panel p-6 sm:p-8"><div className="mb-6 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600"><UserRound/></div><h2 className="text-2xl font-black">{authMode === "login" ? "Selamat datang kembali" : "Buat akun baru"}</h2><p className="mt-2 text-sm text-slate-400">Simpan dan kelola prompt milikmu.</p></div>
      {!supabaseReady && <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">Konfigurasi Supabase belum diisi. Fitur login dan database belum aktif.</div>}
      <form onSubmit={handleAuth} className="space-y-4">
        {authMode === "signup" && <div><label className="small-label">Nama lengkap</label><input className="field" value={authName} onChange={e=>setAuthName(e.target.value)} required placeholder="Nama kamu"/></div>}
        <div><label className="small-label">Email</label><input className="field" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required placeholder="nama@email.com"/></div>
        <div><label className="small-label">Password (minimal 6 karakter)</label><input className="field" type="password" minLength={6} value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required placeholder="••••••••"/></div>
        <button disabled={busy || !supabaseReady} className="btn btn-primary w-full disabled:opacity-40">{busy ? "Memproses..." : authMode === "login" ? "Login" : "Daftar akun"}</button>
      </form>
      <button className="mt-4 w-full text-sm text-violet-300" onClick={()=>setAuthMode(authMode==="login"?"signup":"login")}>{authMode==="login"?"Belum punya akun? Daftar":"Sudah punya akun? Login"}</button>
    </div>;
  }

  function Builder() {
    return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)]">
      <section className="panel p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between"><div><div className="text-sm font-bold text-violet-300">AI PROMPT GENERATOR</div><h2 className="mt-1 text-2xl font-black">Bangun master prompt</h2><p className="mt-1 text-sm text-slate-400">Isi detail proyek, lalu buat prompt terstruktur.</p></div><div className="rounded-xl bg-violet-500/15 p-3 text-violet-300"><WandSparkles/></div></div>
        <label className="small-label">Pilih kategori proyek</label>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">{categories.map(c=>{const Icon=iconMap[c.id]||Sparkles;return <button key={c.id} onClick={()=>setForm({...form,category:c.id})} className={`rounded-xl border p-3 text-left transition ${form.category===c.id?"border-violet-500 bg-violet-500/15":"border-slate-700 bg-slate-900/60 hover:border-slate-500"}`}><Icon size={20} className="mb-2 text-violet-300"/><div className="text-sm font-bold">{c.name}</div></button>})}</div>
        <div className="space-y-4">
          <div><label className="small-label">Nama proyek</label><input className="field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Contoh: Game RPG Open World"/></div>
          <div><label className="small-label">Jelaskan ide dan tujuan proyek</label><textarea className="field min-h-28" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Jelaskan apa yang ingin kamu bangun, fitur utama, cara kerja, dan hasil yang diharapkan..."/></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="small-label">Target pengguna</label><input className="field" value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})} placeholder="Contoh: gamer remaja"/></div><div><label className="small-label">Platform / teknologi</label><input className="field" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})} placeholder="Contoh: Android, Unity, Next.js"/></div></div>
          <div><label className="small-label">Batasan / referensi tambahan</label><textarea className="field min-h-20" value={form.constraints} onChange={e=>setForm({...form,constraints:e.target.value})} placeholder="Budget, gaya desain, fitur wajib, teknologi yang dihindari..."/></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="small-label">Tingkat detail</label><select className="field" value={form.detail} onChange={e=>setForm({...form,detail:e.target.value})}><option>Ringkas</option><option>Lengkap</option><option>Sangat detail / Master</option></select></div><div><label className="small-label">Bahasa output</label><select className="field" value={form.language} onChange={e=>setForm({...form,language:e.target.value})}><option>Bahasa Indonesia</option><option>English</option><option>Indonesia + English</option></select></div></div>
          <button onClick={generate} className="btn btn-primary w-full py-3"><Sparkles size={18}/> Generate Master Prompt</button>
        </div>
      </section>
      <section className="panel flex min-h-[520px] flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><div><div className="text-sm font-bold text-emerald-300">OUTPUT</div><h2 className="text-xl font-black">Prompt kamu</h2></div><span className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400">{prompt ? prompt.length+" karakter" : "Belum dibuat"}</span></div>
        <textarea className="field min-h-[390px] flex-1 resize-y font-mono text-xs leading-relaxed" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Hasil master prompt akan muncul di sini. Kamu juga bisa mengeditnya langsung..."/>
        <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={()=>copyPrompt()} disabled={!prompt} className="btn btn-muted disabled:opacity-40"><Copy size={16}/> Copy</button><button onClick={()=>downloadPrompt()} disabled={!prompt} className="btn btn-muted disabled:opacity-40"><Download size={16}/> Download TXT</button><button onClick={()=>savePrompt(prompt,false)} disabled={!prompt} className="btn btn-muted disabled:opacity-40"><Save size={16}/> Simpan</button><button onClick={()=>savePrompt(prompt,true)} disabled={!prompt} className="btn btn-muted disabled:opacity-40"><Heart size={16}/> Favorit</button></div>
      </section>
    </div>;
  }

  function Library() {
    return <div><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="text-sm font-bold text-violet-300">LIBRARY</div><h2 className="text-2xl font-black">Template prompt</h2><p className="text-sm text-slate-400">Pilih blueprint sesuai proyek yang ingin dibuat.</p></div><div className="relative sm:w-72"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input className="field pl-10" value={templatesQuery} onChange={e=>setTemplatesQuery(e.target.value)} placeholder="Cari kategori..."/></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredCategories.map(c=>{const Icon=iconMap[c.id]||Sparkles;return <button key={c.id} onClick={()=>{setForm({...form,category:c.id});setActive("builder");}} className="panel card-hover p-5 text-left"><div className="mb-4 flex items-center justify-between"><div className="rounded-xl bg-violet-500/15 p-3 text-violet-300"><Icon/></div><ChevronRight className="text-slate-500"/></div><h3 className="font-bold">{c.name}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{c.desc}</p><div className="mt-4 text-xs font-bold text-violet-300">GUNAKAN TEMPLATE →</div></button>})}</div></div>;
  }

  function PromptList({ items, title, subtitle }) {
    return <div><div className="mb-5"><div className="text-sm font-bold text-violet-300">YOUR WORKSPACE</div><h2 className="text-2xl font-black">{title}</h2><p className="text-sm text-slate-400">{subtitle}</p></div>{!user ? <div className="panel p-8 text-center"><p className="text-slate-300">Login untuk melihat prompt yang tersimpan.</p><button className="btn btn-primary mt-4" onClick={()=>setActive("auth")}>Login sekarang</button></div> : items.length===0 ? <div className="panel p-10 text-center"><Database className="mx-auto mb-3 text-slate-500"/><p className="font-bold">Belum ada prompt</p><p className="mt-1 text-sm text-slate-400">Buat dan simpan prompt pertamamu.</p><button className="btn btn-primary mt-4" onClick={()=>setActive("builder")}><Plus size={16}/> Buat prompt</button></div> : <div className="space-y-3">{items.map(item=><div key={item.id} className="panel p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="font-bold">{item.title}</div><div className="mt-1 text-xs text-slate-500">{categories.find(c=>c.id===item.category)?.name || item.category} · {new Date(item.created_at).toLocaleString("id-ID")}</div></div><div className="flex gap-2"><button className="btn btn-muted !p-2" title="Copy" onClick={()=>copyPrompt(item.content)}><Copy size={15}/></button><button className="btn btn-muted !p-2" title="Download" onClick={()=>downloadPrompt(item.content,item.title)}><Download size={15}/></button><button className="btn btn-muted !p-2" title="Favorit" onClick={()=>toggleFavorite(item)}><Heart size={15} fill={item.is_favorite?"currentColor":"none"}/></button><button className="btn btn-danger !p-2" title="Hapus" onClick={()=>deletePrompt(item.id)}><Trash2 size={15}/></button></div></div><p className="mt-3 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">{item.content}</p><button className="mt-3 text-xs font-bold text-violet-300" onClick={()=>{setPrompt(item.content);setForm({...form,title:item.title,category:item.category});setActive("builder");}}>Buka di editor →</button></div>)}</div>}</div>;
  }

  function Admin() {
    if (!user) return <AuthPanel/>;
    if (profile?.role !== "admin") return <div className="panel p-8 text-center"><ShieldCheck className="mx-auto mb-3 text-amber-300"/><h2 className="text-xl font-bold">Area khusus admin</h2><p className="mt-2 text-sm text-slate-400">Akun ini belum memiliki role admin. Atur role melalui SQL Editor Supabase.</p></div>;
    return <div><div className="mb-5"><div className="text-sm font-bold text-violet-300">CONTROL CENTER</div><h2 className="text-2xl font-black">Admin Dashboard</h2><p className="text-sm text-slate-400">Ringkasan aktivitas platform.</p></div><div className="mb-5 grid gap-3 sm:grid-cols-3">{[["Total pengguna",adminStats?.users ?? "—"],["Total prompt",adminStats?.prompts ?? "—"],["Prompt favorit",adminStats?.favorites ?? "—"]].map(([k,v])=><div className="panel p-5" key={k}><div className="text-sm text-slate-400">{k}</div><div className="mt-2 text-3xl font-black">{v}</div></div>)}</div><div className="panel overflow-hidden"><div className="border-b border-slate-800 p-4 font-bold">Pengguna terbaru</div>{adminUsers.length===0?<p className="p-4 text-sm text-slate-400">Belum ada data atau RPC belum tersedia.</p>:adminUsers.map(u=><div key={u.id} className="flex items-center justify-between border-b border-slate-800/70 p-4 text-sm"><div><div className="font-semibold">{u.full_name || "Pengguna"}</div><div className="text-xs text-slate-500">{u.id}</div></div><span className="rounded-lg bg-slate-800 px-2 py-1 text-xs">{u.role}</span></div>)}</div></div>;
  }

  const pageTitle = { builder:"Prompt Builder", templates:"Template Library", history:"Riwayat Prompt", favorites:"Prompt Favorit", admin:"Admin Dashboard", auth:"Account" }[active] || "Workspace";
  return <div className="flex min-h-screen">
    <Sidebar/>
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-800/80 bg-[#080b14]/90 px-4 backdrop-blur-xl sm:px-7">
        <div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden" onClick={()=>setMobileNav(true)}><Menu/></button><div><div className="text-xs text-slate-500">MY CUSTOM WEBSITE / WORKSPACE</div><div className="font-bold">{pageTitle}</div></div></div>
        <div className="flex items-center gap-2">{user ? <div className="hidden items-center gap-2 rounded-full border border-slate-800 px-3 py-2 text-xs text-slate-300 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400"/>{user.email}</div> : <button onClick={()=>setActive("auth")} className="btn btn-primary !px-3 !py-2 text-sm"><LogIn size={15}/> Masuk</button>}</div>
      </header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-7">
        {message && <div className="mb-4 flex items-center justify-between rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100"><span>{message}</span><button onClick={()=>setMessage("")}><X size={16}/></button></div>}
        {active==="builder" && <><div className="mb-6 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/70 via-[#17152e] to-slate-900 p-5 sm:p-7"><div className="max-w-2xl"><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200"><Sparkles size={13}/> YOUR AI CREATIVE STUDIO</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Ide jadi prompt.<br/><span className="text-violet-300">Prompt jadi karya.</span></h1><p className="mt-3 text-sm leading-relaxed text-slate-300">Buat master prompt untuk game, APK, website, chatbot, desain, dan proyek digital lainnya.</p></div></div><Builder/></>}
        {active==="templates" && <Library/>}
        {active==="history" && <PromptList items={history} title="Riwayat Prompt" subtitle="Semua prompt yang pernah kamu simpan."/>}
        {active==="favorites" && <PromptList items={favorites} title="Prompt Favorit" subtitle="Kumpulan prompt pilihanmu."/>}
        {active==="auth" && <AuthPanel/>}
        {active==="admin" && <Admin/>}
        <footer className="mt-10 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">© {new Date().getFullYear()} MY CUSTOM WEBSITE · AI PROMPT BUILDER</footer>
      </div>
    </main>
  </div>;
}
