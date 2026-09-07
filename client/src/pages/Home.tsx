// Green Project visual reminder: Obsidian Emerald, gothic editorial, planner-first, calm and supportive.
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleDot, Clock3, Droplets, Flame, HeartPulse, ListChecks, Moon, Plus, Sparkles,
  Target, Trash2, Trophy, Utensils, Zap,
} from "lucide-react";

type Tab = "overview" | "planner" | "training" | "health";
type Intensity = "ringan" | "sedang" | "berat";
type Mood = "tenang" | "netral" | "lelah" | "berat";
type StreakTone = "ember" | "neon" | "deep" | "legend";

type Workout = { id: string; date: string; activity: string; duration: number; intensity: Intensity; note: string };
type PlannerTask = { id: string; date: string; time: string; title: string; note: string; completed: boolean };
type GreenState = { water: number; sleep: number; mood: Mood | null; healthNote: string; workouts: Workout[]; planner: PlannerTask[] };

const STORAGE_KEY = "green-project-planner-v1";
const LEGACY_STORAGE_KEY = "raga-hijau-mvp-v1";
const AVATAR_URL = "https://ruangtumbuh-7wc6sasx.manus.space/manus-storage/avatar-icon_f141168e.jpg";
const initialState: GreenState = { water: 0, sleep: 7, mood: null, healthNote: "", workouts: [], planner: [] };
const intensityLabels: Record<Intensity, string> = { ringan: "Ringan", sedang: "Sedang", berat: "Berat" };
const moodLabels: Record<Exclude<Mood, null>, string> = { tenang: "Tenang", netral: "Netral", lelah: "Lelah", berat: "Berat" };
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" });
const dayFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "short" });

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function dateFromKey(key: string) { const [year, month, day] = key.split("-").map(Number); return new Date(year, month - 1, day); }
function shiftDate(key: string, amount: number) { const next = dateFromKey(key); next.setDate(next.getDate() + amount); return dateKey(next); }
function sameMonth(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
function readState(): GreenState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored);
    return { ...initialState, ...parsed, planner: Array.isArray(parsed.planner) ? parsed.planner : [] };
  } catch { return initialState; }
}
function monthCalendar(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; });
}
function calculateStreak(planner: PlannerTask[], today = dateKey()) {
  const dates = new Set(planner.filter((task) => task.completed).map((task) => task.date));
  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) { streak += 1; cursor = shiftDate(cursor, -1); }
  return streak;
}
function streakTone(streak: number): StreakTone { if (streak >= 100) return "legend"; if (streak >= 50) return "deep"; if (streak >= 7) return "neon"; return "ember"; }
function streakMessage(streak: number) { if (streak >= 100) return "Api legenda. Kamu sudah membangun ritme yang dalam."; if (streak >= 50) return "Api dark green neon. Kebiasaanmu mulai berakar."; if (streak >= 7) return "Api hijau neon. Seminggu pertama terjaga."; if (streak >= 3) return "Api putih-hijau. Tiga hari pertama menyala."; return "Mulai dari satu hari yang kamu jalani."; }
function nextMilestone(streak: number) { if (streak < 3) return 3; if (streak < 7) return 7; if (streak < 50) return 50; if (streak < 100) return 100; return Math.ceil((streak + 1) / 50) * 50; }

function MetricCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone: string }) {
  return <article className={`metric-card metric-card--${tone}`}><div className="metric-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}
function ProgressRing({ value, max, label }: { value: number; max: number; label: string }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  return <div className="progress-ring" style={{ "--progress": `${percentage * 3.6}deg` } as React.CSSProperties}><div className="progress-ring__inner"><strong>{percentage}%</strong><span>{label}</span></div></div>;
}
function WorkoutRow({ workout, onDelete }: { workout: Workout; onDelete: (id: string) => void }) {
  return <article className="workout-row"><div className="workout-symbol"><Activity size={16} /></div><div className="workout-copy"><h4>{workout.activity}</h4><p><Clock3 size={12} /> {workout.duration} menit <span>·</span> {intensityLabels[workout.intensity]}</p>{workout.note && <small>{workout.note}</small>}</div><button type="button" className="icon-button" aria-label={`Hapus ${workout.activity}`} onClick={() => onDelete(workout.id)}><Trash2 size={15} /></button></article>;
}
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return <div className="empty-state"><div className="empty-symbol"><Target size={20} /></div><div><h3>Belum ada jejak hari ini.</h3><p>Mulai dari sesuatu yang terasa mungkin dilakukan.</p></div><button type="button" className="text-button" onClick={onAdd}>Tambah <ChevronRight size={15} /></button></div>;
}
function StreakCard({ streak }: { streak: number }) {
  const tone = streakTone(streak);
  const next = nextMilestone(streak);
  return <article className={`streak-card streak-card--${tone}`}><div className="streak-flame"><Flame size={39} fill="currentColor" /></div><div className="streak-copy"><p className="eyebrow">STREAK PELAKSANAAN</p><strong>{streak}<small> hari</small></strong><p>{streakMessage(streak)}</p><span className="streak-next">Milestone berikutnya: {next} hari</span></div><div className="streak-sparks"><i /><i /><i /></div></article>;
}

export default function Home() {
  const today = dateKey();
  const [tab, setTab] = useState<Tab>("overview");
  const [state, setState] = useState<GreenState>(readState);
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarAnchor, setCalendarAnchor] = useState(() => dateFromKey(today));
  const [savedPulse, setSavedPulse] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  const todayWorkouts = useMemo(() => state.workouts.filter((workout) => workout.date === today), [state.workouts, today]);
  const selectedTasks = useMemo(() => state.planner.filter((task) => task.date === selectedDate).sort((a, b) => (a.completed === b.completed ? (a.time || "99:99").localeCompare(b.time || "99:99") : Number(a.completed) - Number(b.completed))), [state.planner, selectedDate]);
  const scheduledDates = useMemo(() => new Set(state.planner.map((task) => task.date)), [state.planner]);
  const completedDates = useMemo(() => new Set(state.planner.filter((task) => task.completed).map((task) => task.date)), [state.planner]);
  const totalMinutes = todayWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
  const streak = calculateStreak(state.planner, today);
  const calendarDays = monthCalendar(calendarAnchor);

  function pulse() { setSavedPulse(true); window.setTimeout(() => setSavedPulse(false), 700); }
  function updateState(patch: Partial<GreenState>) { setState((current) => ({ ...current, ...patch })); pulse(); }
  function addWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const activity = String(form.get("activity") || "").trim(); const duration = Number(form.get("duration") || 0); if (!activity || !duration) return;
    const workout: Workout = { id: `${Date.now()}`, date: today, activity, duration, intensity: (form.get("intensity") as Intensity) || "sedang", note: String(form.get("note") || "").trim() };
    updateState({ workouts: [workout, ...state.workouts] }); event.currentTarget.reset();
  }
  function addPlannerTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") || "").trim(); if (!title) return;
    const id = `${Date.now()}`; const task: PlannerTask = { id, date: selectedDate, time: String(form.get("time") || ""), title, note: String(form.get("note") || "").trim(), completed: false };
    setState((current) => ({ ...current, planner: [task, ...current.planner] })); setNewlyAddedId(id); pulse(); event.currentTarget.reset();
  }
  function toggleTask(id: string) { setState((current) => ({ ...current, planner: current.planner.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) })); pulse(); }
  function deleteTask(id: string) { updateState({ planner: state.planner.filter((task) => task.id !== id) }); }
  function removeWorkout(id: string) { updateState({ workouts: state.workouts.filter((workout) => workout.id !== id) }); }
  function addWater(amount: number) { updateState({ water: Math.max(0, Math.min(8, state.water + amount)) }); }
  function selectDate(key: string) { setSelectedDate(key); setNewlyAddedId(null); const date = dateFromKey(key); if (!sameMonth(date, calendarAnchor)) setCalendarAnchor(new Date(date.getFullYear(), date.getMonth(), 1)); }
  function resetToToday() { setSelectedDate(today); setCalendarAnchor(dateFromKey(today)); }

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [{ id: "overview", label: "Ringkasan", icon: <Sparkles size={16} /> }, { id: "planner", label: "Planner", icon: <CalendarDays size={16} /> }, { id: "training", label: "Latihan", icon: <Activity size={16} /> }, { id: "health", label: "Kesehatan", icon: <HeartPulse size={16} /> }];
  const pageTitle = tab === "overview" ? "Ruang tenang untuk bergerak." : tab === "planner" ? "Rencanakan ritmemu." : tab === "training" ? "Latihan yang bisa kamu jalani." : "Dengarkan sinyal tubuh.";

  return <div className={`raga-app ${savedPulse ? "raga-app--saved" : ""}`}>
    <aside className="sidebar"><div className="brand-lockup"><img src={AVATAR_URL} alt="Ikon karakter Green Project" /><div><span>GREEN</span><strong>Project</strong></div></div><div className="sidebar-note"><CircleDot size={13} /> <span>Rencana hijau, langkah nyata.</span></div><nav className="side-nav" aria-label="Navigasi utama">{tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)}>{item.icon}<span>{item.label}</span></button>)}</nav><div className="sidebar-footer"><span className="status-dot" /> Disimpan di perangkatmu<div className="sidebar-quote">"Kebiasaan tumbuh dari rencana yang mau kamu jalani."</div></div></aside>
    <main className="main-content"><header className="topbar"><div><p className="eyebrow">{longDateFormatter.format(new Date())}</p><h1>{pageTitle}</h1></div><div className="topbar-actions"><span className="offline-badge"><span className="status-dot" /> Offline ready</span><img src={AVATAR_URL} alt="Profil Green Project" /></div></header><div className="mobile-tabs">{tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)}>{item.icon}{item.label}</button>)}</div>
      {tab === "overview" && <><section className="hero-panel"><div className="hero-copy"><p className="eyebrow">GREEN PROJECT · 01</p><h2>Rencana kecil, jejak yang nyata.</h2><p>Atur gerakmu untuk hari ini atau hari yang akan datang. Ketika terlaksana, centang dengan tenang dan biarkan ritmemu menyala.</p><button type="button" className="primary-button" onClick={() => setTab("planner")}>Buka planner <ArrowUpRight size={16} /></button></div><div className="hero-art"><div className="glow-orb" /><img src={AVATAR_URL} alt="Karakter Green Project" /><span className="hero-tag hero-tag--one">rencanakan</span><span className="hero-tag hero-tag--two">laksanakan</span><span className="hero-tag hero-tag--three">ulang</span></div></section><StreakCard streak={streak} /><section className="section-block"><div className="section-heading"><div><p className="eyebrow">PEMETAAN HARI INI</p><h2>Bagaimana ragamu?</h2></div><span className="section-caption">data pribadi, tanpa penilaian</span></div><div className="metric-grid"><MetricCard icon={<Flame size={17} />} label="Gerak" value={`${totalMinutes} m`} detail={`${todayWorkouts.length} sesi hari ini`} tone="lime" /><MetricCard icon={<Droplets size={17} />} label="Hidrasi" value={`${state.water}/8`} detail="gelas tercatat" tone="teal" /><MetricCard icon={<Moon size={17} />} label="Tidur" value={`${state.sleep}j`} detail={state.sleep >= 8 ? "cukup untuk hari ini" : "beri ruang untuk pulih"} tone="moss" /></div></section><section className="split-grid"><article className="dark-panel"><div className="panel-heading"><div><p className="eyebrow">RITME LATIHAN</p><h2>Intensitas hari ini</h2></div><ProgressRing value={totalMinutes} max={60} label="target" /></div><div className="intensity-track"><span style={{ width: `${Math.min(100, (totalMinutes / 60) * 100)}%` }} /></div><div className="track-labels"><span>0 menit</span><span>60 menit</span></div><p className="panel-note">Tidak perlu mengejar angka. Perhatikan bagaimana tubuhmu terasa setelah bergerak.</p></article><article className="quote-panel"><span className="quote-mark">✦</span><p>“Konsistensi bukan berarti selalu kuat. Kadang ia hanya berarti kembali dengan lembut.”</p><button type="button" className="text-button" onClick={() => setTab("planner")}>Lihat rencana <ChevronRight size={15} /></button></article></section></>}
      {tab === "planner" && <PlannerView selectedDate={selectedDate} today={today} calendarAnchor={calendarAnchor} calendarDays={calendarDays} scheduledDates={scheduledDates} completedDates={completedDates} selectedTasks={selectedTasks} newlyAddedId={newlyAddedId} streak={streak} onSelectDate={selectDate} onMonthChange={(amount) => setCalendarAnchor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))} onToday={resetToToday} onAdd={addPlannerTask} onToggle={toggleTask} onDelete={deleteTask} />}
      {tab === "training" && <section className="page-layout"><div className="section-heading"><div><p className="eyebrow">JURNAL OLAHRAGA</p><h2>Masukkan gerakmu.</h2><p className="section-intro">Simpan sesi olahraga secara sederhana. Data ini hanya tinggal di perangkatmu.</p></div><div className="training-count"><strong>{todayWorkouts.length}</strong><span>sesi hari ini</span></div></div><div className="training-layout"><form className="form-panel" onSubmit={addWorkout}><div className="panel-heading"><div><span className="number-badge">01</span><h3>Tambahkan sesi</h3></div><Zap size={19} /></div><label>Jenis aktivitas<input name="activity" required placeholder="Contoh: Jalan sore, yoga, gym" /></label><div className="form-row"><label>Durasi (menit)<input name="duration" required min="1" type="number" placeholder="30" /></label><label>Intensitas<select name="intensity" defaultValue="sedang"><option value="ringan">Ringan</option><option value="sedang">Sedang</option><option value="berat">Berat</option></select></label></div><label>Catatan kecil<textarea name="note" rows={3} placeholder="Apa yang kamu rasakan setelah bergerak?" /></label><button className="primary-button" type="submit"><Plus size={16} /> Simpan sesi</button></form><div className="workout-history"><div className="panel-heading"><div><p className="eyebrow">{todayWorkouts.length ? "HARI INI" : "RUANG KOSONG"}</p><h3>{todayWorkouts.length ? "Jejak gerakmu" : "Belum ada sesi"}</h3></div><Trophy size={19} /></div>{todayWorkouts.length ? <div className="workout-list">{todayWorkouts.map((workout) => <WorkoutRow key={workout.id} workout={workout} onDelete={removeWorkout} />)}</div> : <EmptyState onAdd={() => document.querySelector<HTMLInputElement>('input[name="activity"]')?.focus()} />}</div></div></section>}
      {tab === "health" && <section className="page-layout"><div className="section-heading"><div><p className="eyebrow">CHECK-IN TUBUH</p><h2>Bagaimana rasanya hari ini?</h2><p className="section-intro">Tidak semua hal harus diperbaiki. Beberapa cukup didengarkan.</p></div><HeartPulse className="heading-symbol" size={30} /></div><div className="health-grid"><article className="health-panel health-panel--water"><div className="panel-heading"><div><p className="eyebrow">HIDRASI</p><h3>Air yang masuk</h3></div><Droplets size={20} /></div><div className="water-number"><strong>{state.water}</strong><span>/ 8 gelas</span></div><div className="water-bar"><span style={{ width: `${(state.water / 8) * 100}%` }} /></div><div className="quick-actions"><button type="button" onClick={() => addWater(-1)} disabled={state.water === 0}>−</button><button type="button" className="water-add" onClick={() => addWater(1)}>+ 1 gelas</button><button type="button" onClick={() => addWater(1)} aria-label="Tambah segelas air">+</button></div></article><article className="health-panel health-panel--sleep"><div className="panel-heading"><div><p className="eyebrow">ISTIRAHAT</p><h3>Jam tidur</h3></div><Moon size={20} /></div><div className="sleep-control"><strong>{state.sleep}</strong><span>jam</span></div><input aria-label="Jam tidur" type="range" min="0" max="12" step="0.5" value={state.sleep} onChange={(event) => updateState({ sleep: Number(event.target.value) })} /><div className="track-labels"><span>0j</span><span>12j</span></div><p className="panel-note">Geser sesuai tidurmu semalam. Tidak apa-apa jika belum ideal.</p></article><article className="health-panel health-panel--mood"><div className="panel-heading"><div><p className="eyebrow">SUASANA</p><h3>Energi emosimu</h3></div><Sparkles size={20} /></div><div className="mood-grid">{(Object.keys(moodLabels) as Exclude<Mood, null>[]).map((mood) => <button type="button" key={mood} className={state.mood === mood ? "is-selected" : ""} onClick={() => updateState({ mood })}><span className={`mood-orb mood-orb--${mood}`} />{moodLabels[mood]}{state.mood === mood && <Check size={14} />}</button>)}</div></article><article className="health-panel health-panel--note"><div className="panel-heading"><div><p className="eyebrow">CATATAN TUBUH</p><h3>Satu kalimat yang jujur</h3></div><Utensils size={20} /></div><textarea value={state.healthNote} onChange={(event) => updateState({ healthNote: event.target.value })} rows={5} placeholder="Contoh: Bahuku lebih ringan setelah jalan pagi." /><span className="save-hint">Tersimpan otomatis di perangkat</span></article></div></section>}
    </main>
  </div>;
}

function PlannerView({ selectedDate, today, calendarAnchor, calendarDays, scheduledDates, completedDates, selectedTasks, newlyAddedId, streak, onSelectDate, onMonthChange, onToday, onAdd, onToggle, onDelete }: { selectedDate: string; today: string; calendarAnchor: Date; calendarDays: Date[]; scheduledDates: Set<string>; completedDates: Set<string>; selectedTasks: PlannerTask[]; newlyAddedId: string | null; streak: number; onSelectDate: (date: string) => void; onMonthChange: (amount: number) => void; onToday: () => void; onAdd: (event: FormEvent<HTMLFormElement>) => void; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return <section className="planner-page page-layout"><div className="section-heading"><div><p className="eyebrow">PLANNER + TRACKER</p><h2>Rencanakan, lalu jalani.</h2><p className="section-intro">Pilih hari untuk menyiapkan aktivitas. Centang saat benar-benar terlaksana agar api streak-mu menyala.</p></div><div className="planner-streak-mini"><Flame size={17} /><strong>{streak}</strong><span>hari</span></div></div><div className="planner-layout"><article className="calendar-panel"><div className="calendar-header"><button type="button" className="icon-button" onClick={() => onMonthChange(-1)} aria-label="Bulan sebelumnya"><ChevronLeft size={17} /></button><h3>{monthFormatter.format(calendarAnchor)}</h3><button type="button" className="icon-button" onClick={() => onMonthChange(1)} aria-label="Bulan berikutnya"><ChevronRight size={17} /></button></div><button type="button" className="calendar-today" onClick={onToday}>Kembali ke hari ini</button><div className="calendar-weekdays">{calendarDays.slice(0, 7).map((day) => <span key={weekdayFormatter.format(day)}>{weekdayFormatter.format(day)}</span>)}</div><div className="calendar-grid">{calendarDays.map((day) => { const key = dateKey(day); const isSelected = key === selectedDate; const isToday = key === today; const hasPlan = scheduledDates.has(key); const hasDone = completedDates.has(key); return <button type="button" key={key} className={`calendar-day ${day.getMonth() !== calendarAnchor.getMonth() ? "is-outside" : ""} ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}`} onClick={() => onSelectDate(key)}><span>{dayFormatter.format(day)}</span>{hasPlan && <i className={hasDone ? "has-done" : ""} />}</button>; })}</div></article><div className="planner-side"><StreakCard streak={streak} /><form className="planner-form" onSubmit={onAdd}><div className="panel-heading"><div><p className="eyebrow">{selectedDate === today ? "HARI INI" : longDateFormatter.format(dateFromKey(selectedDate))}</p><h3>Tambah rencana</h3></div><ListChecks size={19} /></div><label>Aktivitas<input name="title" required placeholder="Contoh: Jalan pagi 20 menit" /></label><div className="form-row"><label>Jam<input name="time" type="time" /></label><label>Catatan<input name="note" placeholder="opsional" /></label></div><button className="primary-button" type="submit"><Plus size={16} /> Simpan ke hari ini</button></form></div></div><article className="planner-tasks"><div className="section-heading"><div><p className="eyebrow">CHECKLIST PELAKSANAAN</p><h3>{selectedDate === today ? "Yang akan kamu jalani hari ini" : `Rencana untuk ${longDateFormatter.format(dateFromKey(selectedDate))}`}</h3></div><span className="section-caption">{selectedTasks.filter((task) => task.completed).length}/{selectedTasks.length} selesai</span></div>{selectedTasks.length ? <div className="planner-task-list">{selectedTasks.map((task) => <article key={task.id} className={`planner-task ${task.completed ? "is-completed" : ""} ${task.id === newlyAddedId ? "is-new" : ""}`}><button type="button" className="task-check" onClick={() => onToggle(task.id)} aria-label={task.completed ? `Batalkan ${task.title}` : `Tandai ${task.title} selesai`}>{task.completed ? <Check size={15} /> : <span />}</button><div className="task-time">{task.time || "kapan saja"}</div><div className="task-body"><h4>{task.title}</h4>{task.note && <p>{task.note}</p>}</div><button type="button" className="icon-button" onClick={() => onDelete(task.id)} aria-label={`Hapus ${task.title}`}><Trash2 size={15} /></button></article>)}</div> : <div className="planner-empty"><CalendarDays size={21} /><div><h4>Belum ada rencana untuk tanggal ini.</h4><p>Tambahkan satu aktivitas yang terasa masuk akal.</p></div></div>}</article></section>;
}
