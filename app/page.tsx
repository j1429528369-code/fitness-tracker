"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Kind = "workout" | "weight" | "meal";
type RecordItem = { id: number; kind: Kind; date: string; title: string; detail: string; value?: number | null };

const tabs: { id: Kind; label: string; icon: string }[] = [
  { id: "workout", label: "训练记录", icon: "⚡" },
  { id: "weight", label: "体重记录", icon: "↘" },
  { id: "meal", label: "饮食记录", icon: "◎" },
];

const today = new Date().toISOString().slice(0, 10);

export default function Home() {
  const [active, setActive] = useState<Kind>("workout");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/records");
      if (!res.ok) throw new Error();
      setRecords(await res.json());
    } catch {
      setNotice("暂时无法读取记录，请稍后再试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const todayRecords = useMemo(() => records.filter((r) => r.date === today), [records]);
  const latestWeight = records.find((r) => r.kind === "weight");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, kind: active }),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setNotice("打卡成功，继续保持！");
      await loadRecords();
    } catch {
      setNotice("保存失败，请检查后重试");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/records?id=${id}`, { method: "DELETE" });
    await loadRecords();
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top"><span>J</span> 嘉玮健身志</a>
        <nav><a href="#checkin">今日打卡</a><a href="#history">历史记录</a></nav>
        <div className="avatar">嘉</div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">DAY BY DAY · STRONGER</p>
          <h1>今天，也比昨天<br/><em>更强一点。</em></h1>
          <p className="lead">记录每一次训练、每一公斤变化、每一餐选择。看得见的坚持，才更有力量。</p>
        </div>
        <div className="streak"><b>{todayRecords.length}</b><span>今日完成记录</span><small>每一次打卡都算数</small></div>
      </section>

      <section className="stats" aria-label="健身概览">
        <div><span>今日训练</span><b>{todayRecords.filter(r => r.kind === "workout").length}</b><small>次</small></div>
        <div><span>最新体重</span><b>{latestWeight?.value ?? "--"}</b><small>kg</small></div>
        <div><span>饮食打卡</span><b>{todayRecords.filter(r => r.kind === "meal").length}</b><small>餐</small></div>
        <div><span>累计记录</span><b>{records.length}</b><small>条</small></div>
      </section>

      <section className="workspace" id="checkin">
        <div className="section-heading"><div><p className="eyebrow">QUICK CHECK-IN</p><h2>记录今天</h2></div><p>选一项，花不到一分钟完成打卡。</p></div>
        <div className="tabs" role="tablist">
          {tabs.map(tab => <button key={tab.id} className={active === tab.id ? "active" : ""} onClick={() => { setActive(tab.id); setNotice(""); }}><i>{tab.icon}</i>{tab.label}</button>)}
        </div>

        <form className="card form-card" onSubmit={submit}>
          <input type="hidden" name="date" value={today}/>
          {active === "workout" && <>
            <label>训练项目<input name="title" required placeholder="例如：胸部训练" /></label>
            <div className="form-row"><label>训练时长（分钟）<input name="value" type="number" min="1" placeholder="45" /></label><label>动作与组数<input name="detail" required placeholder="哑铃飞鸟 4组 × 12次" /></label></div>
          </>}
          {active === "weight" && <>
            <label>当前体重（kg）<input name="value" required type="number" step="0.1" min="20" max="300" placeholder="70.5" /></label>
            <label>状态备注<input name="detail" placeholder="例如：晨起空腹测量" /></label><input type="hidden" name="title" value="体重记录" />
          </>}
          {active === "meal" && <>
            <label>餐次<select name="title" defaultValue="午餐"><option>早餐</option><option>午餐</option><option>晚餐</option><option>加餐</option></select></label>
            <label>吃了什么<input name="detail" required placeholder="鸡胸肉、糙米、西兰花" /></label>
          </>}
          <div className="form-footer"><span className={notice.includes("成功") ? "success" : "message"}>{notice}</span><button className="primary" disabled={saving}>{saving ? "保存中…" : "+ 完成打卡"}</button></div>
        </form>
      </section>

      <section className="history" id="history">
        <div className="section-heading"><div><p className="eyebrow">YOUR PROGRESS</p><h2>最近记录</h2></div></div>
        <div className="record-list">
          {loading && <div className="empty">正在读取记录…</div>}
          {!loading && records.length === 0 && <div className="empty"><b>从今天开始吧</b><span>完成上方第一条打卡，你的坚持会出现在这里。</span></div>}
          {records.map(record => {
            const tab = tabs.find(t => t.id === record.kind)!;
            return <article className="record" key={record.id}><div className={`record-icon ${record.kind}`}>{tab.icon}</div><div><span>{record.date}</span><h3>{record.title}</h3><p>{record.detail || "无备注"}{record.value ? ` · ${record.value}${record.kind === "weight" ? " kg" : record.kind === "workout" ? " 分钟" : ""}` : ""}</p></div><button className="delete" onClick={() => remove(record.id)} aria-label={`删除${record.title}`}>×</button></article>
          })}
        </div>
      </section>

      <footer>嘉玮健身志 <span>·</span> 坚持不是口号，是每天留下的记录。</footer>
    </main>
  );
}
