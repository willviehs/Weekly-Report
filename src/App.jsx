import { useState, useEffect } from "react";
import {
  saveReport, getReport, getAllReports,
  saveComment, getAllComments
} from "./supabase.js";

const USERS = [
  { id: "song",  name: "송병학", role: "both",     avatar: "송" },
  { id: "kim1",  name: "김능현", role: "writer",   avatar: "김" },
  { id: "kim2",  name: "김현수", role: "writer",   avatar: "김" },
  { id: "lee",   name: "이준형", role: "writer",   avatar: "이" },
  { id: "kim3",  name: "김혜현", role: "writer",   avatar: "김" },
  { id: "moon",  name: "이월재", role: "reviewer", avatar: "이" },
];

const fmtFull = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmt = d => `${d.getMonth()+1}/${d.getDate()}`;
const DAY_KR = ["일","월","화","수","목","금","토"];
const dayKr = (dateStr) => DAY_KR[new Date(dateStr).getDay()];

function buildWeekInfo(mon) {
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const prevMon = new Date(mon); prevMon.setDate(mon.getDate() - 7);
  const label = `${fmt(mon)}~${fmt(sun)}`;
  const key = `W${fmtFull(mon)}`;
  const thisWeekDates = Array.from({length:7}, (_,i) => { const d = new Date(mon); d.setDate(mon.getDate()+i); return fmtFull(d); });
  const prevWeekDates = Array.from({length:7}, (_,i) => { const d = new Date(prevMon); d.setDate(prevMon.getDate()+i); return fmtFull(d); });
  return { label, key, thisWeekDates, prevWeekDates };
}

function thisMonday() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
  mon.setHours(0,0,0,0);
  return mon;
}

function getWeekList() {
  const mon = thisMonday();
  return Array.from({length:8}, (_,i) => {
    const d = new Date(mon); d.setDate(mon.getDate() - i * 7);
    return buildWeekInfo(d);
  });
}

function WeekSelector({ weekList, currentKey, onChange, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:11, fontWeight:700, color:C.faint, letterSpacing:0.5 }}>주차</span>
      <select value={currentKey} onChange={e => onChange(e.target.value)}
        style={{ border:`1.5px solid ${color==="purple"?"#ddd6fe":"#bfdbfe"}`, borderRadius:8, padding:"5px 10px", fontSize:13, fontWeight:700, color:color==="purple"?C.purple:C.blue, background:color==="purple"?C.purpleSoft:C.blueSoft, fontFamily:"inherit", cursor:"pointer", outline:"none" }}>
        {weekList.map((w, i) => (
          <option key={w.key} value={w.key}>{i===0 ? `이번 주 (${w.label})` : w.label}</option>
        ))}
      </select>
    </div>
  );
}

const C = {
  bg:"#f0f4f8", card:"#fff", border:"#e2e8f0",
  blue:"#2563eb", blueSoft:"#eff6ff", blueHeader:"#1e3a5f",
  text:"#1e293b", muted:"#64748b", faint:"#94a3b8",
  green:"#16a34a", greenSoft:"#dcfce7",
  red:"#dc2626", redSoft:"#fee2e2",
  purple:"#7c3aed", purpleSoft:"#f5f3ff",
  tableAlt:"#f8fafc", tableBorder:"#cbd5e1",
};
const cardStyle = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" };

// ── 로그인
function LoginScreen({ onLogin }) {
  const [sel, setSel] = useState(null);
  const [mode, setMode] = useState(null);
  const writers = USERS.filter(u => u.role==="writer" || u.role==="both");
  const reviewers = USERS.filter(u => u.role==="reviewer");
  const selUser = USERS.find(u => u.id===sel);
  const canLogin = sel && !(selUser?.role==="both" && !mode);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:460 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:`linear-gradient(135deg,${C.blue},#38bdf8)`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <span style={{ color:"#fff", fontSize:22, fontWeight:800 }}>W</span>
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:C.text }}>FM사업본부 주간업무일지</div>
          <div style={{ fontSize:13, color:C.faint, marginTop:4 }}>{getWeekInfo().label} 주차</div>
        </div>
        <div style={{ ...cardStyle, padding:28 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.faint, marginBottom:10, letterSpacing:1 }}>팀원</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
            {writers.map(u => (
              <button key={u.id} onClick={() => { setSel(u.id); setMode(null); }} style={{
                border:`2px solid ${sel===u.id ? C.blue : C.border}`,
                background:sel===u.id ? C.blueSoft : "#f8fafc",
                borderRadius:10, padding:"10px 14px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:10, transition:"all 0.15s"
              }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:sel===u.id ? C.blue : "#e2e8f0", color:sel===u.id ? "#fff" : C.muted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{u.avatar}</div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:sel===u.id ? C.blue : C.text }}>{u.name}</div>
                  {u.role==="both" && <div style={{ fontSize:10, color:C.faint }}>팀원 / 검토자</div>}
                </div>
              </button>
            ))}
          </div>

          <div style={{ fontSize:12, fontWeight:700, color:C.faint, marginBottom:10, letterSpacing:1 }}>검토자</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
            {reviewers.map(u => (
              <button key={u.id} onClick={() => { setSel(u.id); setMode("reviewer"); }} style={{
                border:`2px solid ${sel===u.id ? C.purple : C.border}`,
                background:sel===u.id ? C.purpleSoft : "#f8fafc",
                borderRadius:10, padding:"10px 14px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:10, transition:"all 0.15s"
              }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:sel===u.id ? C.purple : "#e2e8f0", color:sel===u.id ? "#fff" : C.muted, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{u.avatar}</div>
                <div style={{ fontSize:13, fontWeight:700, color:sel===u.id ? C.purple : C.text }}>{u.name}</div>
              </button>
            ))}
          </div>

          {selUser?.role==="both" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.faint, marginBottom:8 }}>접속 모드</div>
              <div style={{ display:"flex", gap:8 }}>
                {[{v:"writer",l:"✍ 작성자"},{v:"reviewer",l:"🔍 검토자"}].map(o => (
                  <button key={o.v} onClick={() => setMode(o.v)} style={{
                    flex:1, border:`2px solid ${mode===o.v ? C.blue : C.border}`,
                    background:mode===o.v ? C.blueSoft : "#f8fafc",
                    borderRadius:9, padding:"9px 0", fontSize:13, fontWeight:700,
                    color:mode===o.v ? C.blue : C.muted, cursor:"pointer"
                  }}>{o.l}</button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => canLogin && onLogin({ ...selUser, activeRole: selUser.role==="both" ? mode : selUser.role })}
            disabled={!canLogin}
            style={{ width:"100%", background:canLogin ? C.blue : "#cbd5e1", color:"#fff", border:"none", borderRadius:10, padding:"13px 0", fontWeight:700, fontSize:15, cursor:canLogin?"pointer":"not-allowed" }}>
            입장하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 테이블 입력 셀
function TCell({ value, onChange, placeholder, readOnly }) {
  if (readOnly) return (
    <td style={{ border:`1px solid ${C.tableBorder}`, padding:"8px 10px", fontSize:13, color:C.text, verticalAlign:"top", whiteSpace:"pre-wrap", lineHeight:1.6 }}>
      {value || <span style={{color:"#d1d5db"}}>-</span>}
    </td>
  );
  return (
    <td style={{ border:`1px solid ${C.tableBorder}`, padding:0, verticalAlign:"top" }}>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
        style={{ width:"100%", border:"none", background:"transparent", padding:"7px 10px", fontSize:13, resize:"vertical", outline:"none", boxSizing:"border-box", minHeight:36, lineHeight:1.6, color:C.text, fontFamily:"inherit" }} />
    </td>
  );
}

// ── 작성자 화면
function WriterView({ user, onLogout }) {
  const weekList = getWeekList();
  const currentWeekKey = weekList[0].key;
  const [selectedKey, setSelectedKey] = useState(currentWeekKey);
  const weekInfo = weekList.find(w => w.key === selectedKey) || weekList[0];
  const { label, key:weekKey, thisWeekDates, prevWeekDates } = weekInfo;
  const isCurrentWeek = selectedKey === currentWeekKey;

  const initRows = (dates) => dates.map(date => ({ date, site:"", planned:"", detail:"", result:"", note:"" }));

  const [thisRows, setThisRows] = useState(initRows(thisWeekDates));
  const [prevRows, setPrevRows] = useState(initRows(prevWeekDates));
  const [extras, setExtras] = useState([{id:1,content:""},{id:2,content:""},{id:3,content:""}]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoaded(false); setError(null);
    getReport(user.id, weekKey).then(d => {
      if (d) {
        setThisRows(d.this_rows || initRows(thisWeekDates));
        setPrevRows(d.prev_rows || initRows(prevWeekDates));
        setExtras(d.extras || [{id:1,content:""},{id:2,content:""},{id:3,content:""}]);
        setSubmitted(d.submitted || false);
      } else {
        setThisRows(initRows(thisWeekDates));
        setPrevRows(initRows(prevWeekDates));
        setExtras([{id:1,content:""},{id:2,content:""},{id:3,content:""}]);
        setSubmitted(false);
      }
      setLoaded(true);
    }).catch(e => { setError(e.message); setLoaded(true); });
  }, [weekKey]);

  const save = async (submit=false) => {
    if (!isCurrentWeek) return;
    setSaving(true); setError(null);
    try {
      await saveReport({
        userId: user.id, userName: user.name, weekKey, weekLabel: label,
        thisRows, prevRows, extras,
        submitted: submit || submitted,
        submittedAt: submit ? new Date().toISOString() : undefined,
      });
      if (submit) setSubmitted(true);
    } catch(e) { setError(e.message); }
    setSaving(false);
  };

  const updThis = (idx,f,v) => setThisRows(r => r.map((x,i) => i===idx?{...x,[f]:v}:x));
  const updPrev = (idx,f,v) => setPrevRows(r => r.map((x,i) => i===idx?{...x,[f]:v}:x));
  const updExtra = (id,v) => setExtras(e => e.map(x => x.id===id?{...x,content:v}:x));
  const today = new Date().toISOString().split("T")[0];

  const thS = { background:C.blueHeader, color:"#fff", padding:"9px 10px", fontSize:12, fontWeight:700, border:"1px solid #1e3a5f", textAlign:"center" };
  const tdN = { background:"#e8f0fe", color:C.blueHeader, textAlign:"center", fontSize:13, fontWeight:700, border:`1px solid ${C.tableBorder}`, padding:"7px 8px", verticalAlign:"middle", width:36 };
  const tdD = (date) => ({ background:date===today?"#fef9c3":C.tableAlt, color:date===today?C.blue:C.muted, textAlign:"center", fontSize:12, border:`1px solid ${C.tableBorder}`, padding:"7px 8px", verticalAlign:"middle", whiteSpace:"nowrap", fontWeight:date===today?700:400, width:80 });

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      {/* 헤더 */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:54, display:"flex", alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:"auto" }}>
          <div style={{ width:28,height:28,background:`linear-gradient(135deg,${C.blue},#38bdf8)`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ color:"#fff",fontSize:13,fontWeight:800 }}>W</span>
          </div>
          <span style={{ fontWeight:800,fontSize:15,color:C.text }}>FM사업본부 주간업무일지</span>
          <WeekSelector weekList={weekList} currentKey={selectedKey} onChange={setSelectedKey} color="blue" />
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {submitted && isCurrentWeek && <span style={{ fontSize:12,fontWeight:700,color:C.green,background:C.greenSoft,padding:"4px 12px",borderRadius:20 }}>✓ 제출완료</span>}
          {!isCurrentWeek && <span style={{ fontSize:12,fontWeight:600,color:C.faint,background:"#f1f5f9",padding:"4px 12px",borderRadius:20 }}>👁 조회 모드</span>}
          <div style={{ width:30,height:30,borderRadius:"50%",background:C.blue,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0 }}>{user.avatar}</div>
          <span style={{ fontSize:14,fontWeight:600,color:C.text }}>{user.name}</span>
          <button onClick={onLogout} style={{ display:"flex",alignItems:"center",gap:5,background:C.blueSoft,border:"1.5px solid #bfdbfe",borderRadius:8,padding:"5px 13px",fontSize:12,color:C.blue,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
            <span style={{fontSize:14}}>⌂</span> 처음으로
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1000,margin:"0 auto",padding:"22px 18px" }}>
        {error && <div style={{ background:C.redSoft,border:"1px solid #fca5a5",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:C.red }}>⚠ {error}</div>}
        {!isCurrentWeek && (
          <div style={{ background:"#f8fafc",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"12px 18px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{fontSize:16}}>📅</span>
              <span style={{ fontSize:13,fontWeight:700,color:C.muted }}>{label} 주차 기록 조회 중</span>
              {submitted ? <span style={{ fontSize:12,fontWeight:700,color:C.green,background:C.greenSoft,padding:"2px 10px",borderRadius:20 }}>✓ 제출완료</span>
                         : <span style={{ fontSize:12,fontWeight:600,color:C.faint,background:"#f1f5f9",padding:"2px 10px",borderRadius:20 }}>미제출</span>}
            </div>
            <button onClick={() => setSelectedKey(currentWeekKey)} style={{ background:C.blue,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>이번 주로 돌아가기</button>
          </div>
        )}
        {submitted && isCurrentWeek && <div style={{ background:C.greenSoft,border:"1px solid #86efac",borderRadius:10,padding:"11px 16px",marginBottom:14,fontSize:13,fontWeight:700,color:C.green }}>✅ 제출 완료! 수정 후 재제출도 가능해요.</div>}

        {/* 작성자 정보 */}
        <div style={{ ...cardStyle,padding:"13px 20px",marginBottom:14,display:"flex",gap:20,alignItems:"center",flexWrap:"wrap" }}>
          {[["해당 주간",label,true],["작성자",user.name,false]].map(([k,v,hl]) => (
            <div key={k} style={{ display:"flex",gap:8,alignItems:"center" }}>
              <span style={{ fontSize:12,color:C.faint,fontWeight:600,background:C.blueSoft,padding:"3px 10px",borderRadius:6 }}>{k}</span>
              <span style={{ fontSize:13,fontWeight:700,color:hl?C.blue:C.text }}>{v}</span>
            </div>
          ))}
        </div>

        {!loaded ? <div style={{ textAlign:"center",padding:"60px 0",color:C.faint }}>불러오는 중...</div> : (
        <>
        <div style={{ ...cardStyle,marginBottom:14,overflow:"hidden" }}>
          <div style={{ background:C.blueHeader,color:"#fff",padding:"9px 16px",fontSize:14,fontWeight:800 }}>▶ 금주 활동계획</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:600 }}>
              <thead><tr>
                <th style={{...thS,width:36}}>구분</th>
                <th style={{...thS,width:80}}>요일</th>
                <th style={{...thS,width:"18%"}}>방문사업장</th>
                <th style={{...thS,width:"25%"}}>예정업무</th>
                <th style={{...thS}}>상세내용</th>
              </tr></thead>
              <tbody>
                {thisRows.map((row,idx) => (
                  <tr key={row.date} style={{ background:row.date===today?"#fffbeb":idx%2===0?"#fff":C.tableAlt }}>
                    <td style={tdN}>{idx+1}</td>
                    <td style={tdD(row.date)}>{row.date.slice(5)}<br/><span style={{fontSize:11}}>({dayKr(row.date)})</span></td>
                    <TCell value={row.site} onChange={v=>updThis(idx,"site",v)} placeholder="사업장명" readOnly={!isCurrentWeek} />
                    <TCell value={row.planned} onChange={v=>updThis(idx,"planned",v)} placeholder="예정업무" readOnly={!isCurrentWeek} />
                    <TCell value={row.detail} onChange={v=>updThis(idx,"detail",v)} placeholder="상세내용" readOnly={!isCurrentWeek} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ ...cardStyle,marginBottom:14,overflow:"hidden" }}>
          <div style={{ background:C.blueHeader,color:"#fff",padding:"9px 16px",fontSize:14,fontWeight:800 }}>▶ 전주 활동내역</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:660 }}>
              <thead><tr>
                <th style={{...thS,width:36}}>구분</th>
                <th style={{...thS,width:80}}>요일</th>
                <th style={{...thS,width:"16%"}}>방문사업장</th>
                <th style={{...thS,width:"20%"}}>예정업무</th>
                <th style={{...thS,width:"20%"}}>업무 결과</th>
                <th style={{...thS}}>비고</th>
              </tr></thead>
              <tbody>
                {prevRows.map((row,idx) => (
                  <tr key={row.date} style={{ background:idx%2===0?"#fff":C.tableAlt }}>
                    <td style={tdN}>{idx+1}</td>
                    <td style={tdD(row.date)}>{row.date.slice(5)}<br/><span style={{fontSize:11}}>({dayKr(row.date)})</span></td>
                    <TCell value={row.site} onChange={v=>updPrev(idx,"site",v)} placeholder="사업장명" readOnly={!isCurrentWeek} />
                    <TCell value={row.planned} onChange={v=>updPrev(idx,"planned",v)} placeholder="예정업무" readOnly={!isCurrentWeek} />
                    <TCell value={row.result} onChange={v=>updPrev(idx,"result",v)} placeholder="업무 결과" readOnly={!isCurrentWeek} />
                    <TCell value={row.note} onChange={v=>updPrev(idx,"note",v)} placeholder="비고" readOnly={!isCurrentWeek} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ ...cardStyle,marginBottom:18,overflow:"hidden" }}>
          <div style={{ background:C.blueHeader,color:"#fff",padding:"9px 16px",fontSize:14,fontWeight:800 }}>▶ 기타</div>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <tbody>
              {extras.map((ex,idx) => (
                <tr key={ex.id} style={{ background:idx%2===0?"#fff":C.tableAlt }}>
                  <td style={{...tdN}}>{idx+1}</td>
                  <TCell value={ex.content} onChange={v=>updExtra(ex.id,v)} placeholder="기타 사항 입력..." readOnly={!isCurrentWeek} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isCurrentWeek && (
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={() => save(false)} disabled={saving} style={{ flex:1,border:`1.5px solid ${C.border}`,background:"#fff",color:C.muted,borderRadius:10,padding:"12px 0",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>{saving?"저장 중...":"임시 저장"}</button>
            <button onClick={() => save(true)} disabled={saving} style={{ flex:2,background:C.blue,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>{saving?"제출 중...":submitted?"✓ 재제출":"제출하기"}</button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

// ── 검토자 화면
function ReviewerView({ user, onLogout }) {
  const weekList = getWeekList();
  const currentWeekKey = weekList[0].key;
  const [selectedKey, setSelectedKey] = useState(currentWeekKey);
  const weekInfo = weekList.find(w => w.key === selectedKey) || weekList[0];
  const { label, key:weekKey } = weekInfo;
  const writers = USERS.filter(u => u.role==="writer" || u.role==="both");
  const [reports, setReports] = useState({});
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const [reps, cmts] = await Promise.all([getAllReports(weekKey), getAllComments(weekKey)]);
      const map = {};
      reps.forEach(r => { map[r.user_id] = r; });
      setReports(map);
      setComments(cmts);
    } catch(e) { setError(e.message); }
    setLoaded(true);
  };

  useEffect(() => { load(); }, [weekKey]);

  const handleSaveComment = async (userId, text) => {
    await saveComment(weekKey, userId, text, user.name);
    setComments(c => ({ ...c, [userId]: { text, reviewerName: user.name, at: new Date().toISOString() } }));
  };

  const submittedCount = writers.filter(w => reports[w.id]?.submitted).length;
  const rep = selected ? reports[selected] : null;
  const selUser = selected ? USERS.find(u => u.id===selected) : null;

  const thS = { background:C.blueHeader,color:"#fff",padding:"8px 10px",fontSize:12,fontWeight:700,border:"1px solid #1e3a5f",textAlign:"center" };
  const tdN = { background:"#e8f0fe",color:C.blueHeader,textAlign:"center",fontSize:13,fontWeight:700,border:`1px solid ${C.tableBorder}`,padding:"7px 8px",verticalAlign:"middle",width:36 };
  const tdD = { background:C.tableAlt,color:C.muted,textAlign:"center",fontSize:12,border:`1px solid ${C.tableBorder}`,padding:"7px 8px",verticalAlign:"middle",whiteSpace:"nowrap",width:80 };
  const tdV = (v) => <td style={{ border:`1px solid ${C.tableBorder}`,padding:"8px 10px",fontSize:13,color:C.text,verticalAlign:"top",whiteSpace:"pre-wrap",lineHeight:1.6 }}>{v||<span style={{color:"#d1d5db"}}>-</span>}</td>;

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <div style={{ background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginRight:"auto" }}>
          <div style={{ width:28,height:28,background:`linear-gradient(135deg,${C.purple},#a78bfa)`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ color:"#fff",fontSize:13,fontWeight:800 }}>R</span>
          </div>
          <span style={{ fontWeight:800,fontSize:15,color:C.text }}>검토자 대시보드</span>
          <WeekSelector weekList={weekList} currentKey={selectedKey} onChange={setSelectedKey} color="purple" />
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={load} style={{ background:C.purpleSoft,border:"1px solid #ddd6fe",borderRadius:7,padding:"5px 12px",fontSize:12,color:C.purple,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>🔄 새로고침</button>
          <span style={{ fontSize:12,color:C.muted }}>제출 <b style={{ color:submittedCount===writers.length?C.green:C.blue }}>{submittedCount}/{writers.length}</b></span>
          <div style={{ width:30,height:30,borderRadius:"50%",background:C.purple,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0 }}>{user.avatar}</div>
          <span style={{ fontSize:14,fontWeight:600,color:C.text }}>{user.name}</span>
          <button onClick={onLogout} style={{ display:"flex",alignItems:"center",gap:5,background:"#f5f3ff",border:"1.5px solid #ddd6fe",borderRadius:8,padding:"5px 13px",fontSize:12,color:C.purple,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
            <span style={{fontSize:14}}>⌂</span> 처음으로
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"22px 18px",display:"flex",gap:16 }}>
        {/* 팀원 목록 */}
        <div style={{ flex:"0 0 190px",display:"flex",flexDirection:"column",gap:8 }}>
          <div style={{ fontSize:12,fontWeight:700,color:C.faint,marginBottom:2,letterSpacing:1 }}>팀원 현황</div>
          {writers.map(w => {
            const r=reports[w.id]; const isOk=r?.submitted; const isSel=selected===w.id;
            return (
              <button key={w.id} onClick={() => setSelected(isSel?null:w.id)} style={{
                ...cardStyle,padding:"12px 14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",
                border:`2px solid ${isSel?C.purple:isOk?"#86efac":C.border}`,
                background:isSel?C.purpleSoft:"#fff",transition:"all 0.15s"
              }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:30,height:30,borderRadius:"50%",background:isOk?C.green:"#e2e8f0",color:isOk?"#fff":C.faint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>{w.avatar}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{w.name}</div>
                    <div style={{ fontSize:11,color:isOk?C.green:C.faint,fontWeight:600 }}>{isOk?"✓ 제출완료":"미제출"}</div>
                  </div>
                </div>
                {comments[w.id] && <div style={{ marginTop:6,fontSize:11,color:C.purple,background:C.purpleSoft,borderRadius:6,padding:"2px 8px" }}>코멘트 완료</div>}
              </button>
            );
          })}
          <div style={{ marginTop:4,display:"flex",flexDirection:"column",gap:6 }}>
            {[{l:"제출완료",v:submittedCount,c:C.green,bg:C.greenSoft},{l:"미제출",v:writers.length-submittedCount,c:C.red,bg:C.redSoft},{l:"코멘트",v:Object.keys(comments).length,c:C.purple,bg:C.purpleSoft}].map(s=>(
              <div key={s.l} style={{ background:s.bg,borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:12,color:s.c,fontWeight:600 }}>{s.l}</span>
                <span style={{ fontSize:16,fontWeight:800,color:s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 */}
        <div style={{ flex:1,minWidth:0 }}>
          {error && <div style={{ background:C.redSoft,border:"1px solid #fca5a5",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:C.red }}>⚠ {error}</div>}
          {!selected && (
            <div style={{ ...cardStyle,padding:48,textAlign:"center" }}>
              <div style={{ fontSize:36,marginBottom:12 }}>👈</div>
              <div style={{ fontSize:15,fontWeight:700,color:C.text }}>팀원을 선택하면 업무일지를 확인할 수 있어요</div>
            </div>
          )}
          {selected && !rep && (
            <div style={{ ...cardStyle,padding:48,textAlign:"center" }}>
              <div style={{ fontSize:32,marginBottom:10 }}>📭</div>
              <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{selUser?.name}님이 아직 제출하지 않았어요</div>
            </div>
          )}
          {selected && rep && (
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <div style={{ ...cardStyle,padding:"13px 18px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap" }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:C.green,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700 }}>{selUser?.avatar}</div>
                <div>
                  <div style={{ fontSize:15,fontWeight:800,color:C.text }}>{rep.user_name}</div>
                  <div style={{ fontSize:12,color:C.faint }}>제출: {rep.submitted_at?new Date(rep.submitted_at).toLocaleString("ko-KR"):"-"}</div>
                </div>
                <div style={{ marginLeft:"auto",fontSize:12,color:C.faint }}>해당 주간: <b style={{color:C.blue}}>{rep.week_label}</b></div>
              </div>

              <div style={{ ...cardStyle,overflow:"hidden" }}>
                <div style={{ background:C.blueHeader,color:"#fff",padding:"9px 16px",fontSize:13,fontWeight:800 }}>▶ 금주 활동계획</div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",minWidth:560 }}>
                    <thead><tr>
                      <th style={{...thS,width:36}}>구분</th><th style={{...thS,width:80}}>요일</th>
                      <th style={{...thS,width:"18%"}}>방문사업장</th><th style={{...thS,width:"25%"}}>예정업무</th><th style={{...thS}}>상세내용</th>
                    </tr></thead>
                    <tbody>{(rep.this_rows||[]).map((row,idx)=>(
                      <tr key={row.date} style={{background:idx%2===0?"#fff":C.tableAlt}}>
                        <td style={tdN}>{idx+1}</td>
                        <td style={tdD}>{row.date.slice(5)}<br/><span style={{fontSize:11}}>({dayKr(row.date)})</span></td>
                        {tdV(row.site)}{tdV(row.planned)}{tdV(row.detail)}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>

              <div style={{ ...cardStyle,overflow:"hidden" }}>
                <div style={{ background:C.blueHeader,color:"#fff",padding:"9px 16px",fontSize:13,fontWeight:800 }}>▶ 전주 활동내역</div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",minWidth:620 }}>
                    <thead><tr>
                      <th style={{...thS,width:36}}>구분</th><th style={{...thS,width:80}}>요일</th>
                      <th style={{...thS,width:"16%"}}>방문사업장</th><th style={{...thS,width:"20%"}}>예정업무</th>
                      <th style={{...thS,width:"20%"}}>업무 결과</th><th style={{...thS}}>비고</th>
                    </tr></thead>
                    <tbody>{(rep.prev_rows||[]).map((row,idx)=>(
                      <tr key={row.date} style={{background:idx%2===0?"#fff":C.tableAlt}}>
                        <td style={tdN}>{idx+1}</td>
                        <td style={tdD}>{row.date.slice(5)}<br/><span style={{fontSize:11}}>({dayKr(row.date)})</span></td>
                        {tdV(row.site)}{tdV(row.planned)}{tdV(row.result)}{tdV(row.note)}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>

              {rep.extras?.some(e=>e.content) && (
                <div style={{ ...cardStyle,overflow:"hidden" }}>
                  <div style={{ background:C.blueHeader,color:"#fff",padding:"9px 16px",fontSize:13,fontWeight:800 }}>▶ 기타</div>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <tbody>{rep.extras.filter(e=>e.content).map((ex,idx)=>(
                      <tr key={ex.id} style={{background:idx%2===0?"#fff":C.tableAlt}}>
                        <td style={{...tdN}}>{idx+1}</td>{tdV(ex.content)}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              <div style={{ ...cardStyle,padding:18 }}>
                <div style={{ fontSize:13,fontWeight:700,color:C.muted,marginBottom:10 }}>✏️ 검토 코멘트</div>
                <CommentBox userId={selected} existing={comments[selected]} onSave={handleSaveComment} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentBox({ userId, existing, onSave }) {
  const [text, setText] = useState(existing?.text||"");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setText(existing?.text||""); }, [existing]);
  const handle = async () => {
    setSaving(true);
    await onSave(userId, text);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
    setSaving(false);
  };
  return (
    <div>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="피드백, 수정 요청 등을 작성하세요..."
        style={{ width:"100%",border:`1.5px solid ${C.border}`,borderRadius:9,padding:"10px 12px",fontSize:13,fontFamily:"inherit",background:"#f8fafc",boxSizing:"border-box",resize:"vertical",outline:"none",lineHeight:1.7 }} />
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8 }}>
        {existing?.at ? <span style={{fontSize:11,color:C.faint}}>저장: {new Date(existing.at).toLocaleString("ko-KR")}</span> : <span/>}
        <button onClick={handle} disabled={saving||!text.trim()} style={{ background:saved?C.green:C.purple,color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
          {saved?"✓ 저장됨":saving?"저장 중...":"코멘트 저장"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginScreen onLogin={setUser} />;
  if (user.activeRole==="writer") return <WriterView user={user} onLogout={()=>setUser(null)} />;
  if (user.activeRole==="reviewer") return <ReviewerView user={user} onLogout={()=>setUser(null)} />;
}
