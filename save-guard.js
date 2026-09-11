(()=>{
  const MASTER_KEY = "cozyCatSaveV3";
  const BACKUP_KEY = "cozyCatSaveBackupV3";
  const PROFILE_KEYS = ["cozy9Mood","cozy9Fullness","cozy9Fish","cozy9Inventory","cozy10LastCheckin","cozy10CheckinStreak"];
  const DAILY_RE = /^(cozy9Learned-|cozy9Claimed-|cozy10QuizReward-|cozy10EventApplied-)(\d{4}-\d{2}-\d{2})$/;

  function parse(text, fallback){
    try { return text ? JSON.parse(text) : fallback; }
    catch (_) { return fallback; }
  }

  function emptyDay(){
    return {learned:[], claimed:[], quizRewarded:false, eventApplied:false};
  }

  function collect(){
    const save = {
      schema:"cozy-cat-save",
      version:3,
      updatedAt:new Date().toISOString(),
      profile:{
        mood:Number(localStorage.getItem("cozy9Mood") ?? 80),
        fullness:Number(localStorage.getItem("cozy9Fullness") ?? 60),
        fish:Number(localStorage.getItem("cozy9Fish") ?? 30),
        inventory:parse(localStorage.getItem("cozy9Inventory"), {milk:0,chicken:0,cake:0,beef:0}),
        lastCheckin:localStorage.getItem("cozy10LastCheckin") || "",
        checkinStreak:Number(localStorage.getItem("cozy10CheckinStreak") ?? 0)
      },
      days:{}
    };

    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      if(!key) continue;
      const m = key.match(DAILY_RE);
      if(!m) continue;
      const day = save.days[m[2]] || emptyDay();
      const raw = localStorage.getItem(key);
      if(m[1] === "cozy9Learned-") day.learned = parse(raw, []);
      if(m[1] === "cozy9Claimed-") day.claimed = parse(raw, []);
      if(m[1] === "cozy10QuizReward-") day.quizRewarded = raw === "1";
      if(m[1] === "cozy10EventApplied-") day.eventApplied = raw === "1";
      save.days[m[2]] = day;
    }
    return save;
  }

  function normalize(data){
    if(!data || !data.profile) return null;
    const out = {
      schema:"cozy-cat-save",
      version:3,
      updatedAt:data.updatedAt || new Date().toISOString(),
      profile:{
        mood:Number(data.profile.mood ?? 80),
        fullness:Number(data.profile.fullness ?? 60),
        fish:Number(data.profile.fish ?? 30),
        inventory:Object.assign({milk:0,chicken:0,cake:0,beef:0}, data.profile.inventory || {}),
        lastCheckin:String(data.profile.lastCheckin || ""),
        checkinStreak:Number(data.profile.checkinStreak ?? 0)
      },
      days:{}
    };
    for(const [date,d] of Object.entries(data.days || {})){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      out.days[date] = {
        learned:Array.isArray(d?.learned) ? d.learned : [],
        claimed:Array.isArray(d?.claimed) ? d.claimed : [],
        quizRewarded:Boolean(d?.quizRewarded),
        eventApplied:Boolean(d?.eventApplied)
      };
    }
    return out;
  }

  function saveMaster(data, backup=true){
    const normalized = normalize(data);
    if(!normalized) return false;
    if(backup){
      const old = localStorage.getItem(MASTER_KEY);
      if(old) localStorage.setItem(BACKUP_KEY, old);
    }
    normalized.updatedAt = new Date().toISOString();
    localStorage.setItem(MASTER_KEY, JSON.stringify(normalized));
    updateStatus(normalized.updatedAt);
    return true;
  }

  function restore(data){
    const s = normalize(data);
    if(!s) return false;
    const p = s.profile;
    localStorage.setItem("cozy9Mood", String(p.mood));
    localStorage.setItem("cozy9Fullness", String(p.fullness));
    localStorage.setItem("cozy9Fish", String(p.fish));
    localStorage.setItem("cozy9Inventory", JSON.stringify(p.inventory));
    localStorage.setItem("cozy10LastCheckin", p.lastCheckin);
    localStorage.setItem("cozy10CheckinStreak", String(p.checkinStreak));
    for(const [date,d] of Object.entries(s.days)){
      localStorage.setItem("cozy9Learned-"+date, JSON.stringify(d.learned));
      localStorage.setItem("cozy9Claimed-"+date, JSON.stringify(d.claimed));
      if(d.quizRewarded) localStorage.setItem("cozy10QuizReward-"+date, "1");
      if(d.eventApplied) localStorage.setItem("cozy10EventApplied-"+date, "1");
    }
    return true;
  }

  function hasCurrentData(){
    return PROFILE_KEYS.some(k => localStorage.getItem(k) !== null);
  }

  function findOlderMaster(){
    const v2 = parse(localStorage.getItem("cozyCatSaveV2"), null);
    if(v2?.profile) return v2;
    const v1 = parse(localStorage.getItem("cozyCatSaveV1"), null);
    if(v1?.profile) return v1;
    return null;
  }

  function initialize(){
    try{
      const master = normalize(parse(localStorage.getItem(MASTER_KEY), null));
      if(hasCurrentData()){
        saveMaster(collect(), false);
      } else if(master){
        restore(master);
      } else {
        const older = normalize(findOlderMaster());
        if(older){ restore(older); saveMaster(older, false); }
        else saveMaster(collect(), false);
      }
    }catch(_){}
  }

  function sync(){
    try { saveMaster(collect(), true); } catch(_){}
  }

  function formatTime(iso){
    try{
      return new Intl.DateTimeFormat("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));
    }catch(_){ return "刚刚"; }
  }

  function updateStatus(iso){
    const el = document.getElementById("saveGuardStatus");
    if(el) el.textContent = "自动保存开启 · 最近保存 " + formatTime(iso || new Date().toISOString());
  }

  function toast(text){
    const el = document.getElementById("toast");
    if(el){
      el.textContent = text;
      el.classList.add("show");
      setTimeout(()=>el.classList.remove("show"),2200);
    } else alert(text);
  }

  function exportSave(){
    sync();
    const data = normalize(parse(localStorage.getItem(MASTER_KEY), null));
    if(!data) return toast("存档读取失败，请刷新后再试。");
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cozy-cat-save-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
    toast("猫猫存档已经导出啦 ♡");
  }

  function importSave(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const data = normalize(parse(String(reader.result || ""), null));
      if(!data) return toast("这个文件不是有效的猫猫存档。");
      if(!confirm("导入会覆盖当前猫猫存档。确定继续吗？")) return;
      const current = localStorage.getItem(MASTER_KEY);
      if(current) localStorage.setItem(BACKUP_KEY, current);
      restore(data);
      saveMaster(data, false);
      toast("存档恢复成功，正在重新载入……");
      setTimeout(()=>location.reload(),500);
    };
    reader.onerror = ()=>toast("读取存档失败，请再试一次。");
    reader.readAsText(file,"utf-8");
  }

  function bindUI(){
    const exportBtn = document.getElementById("exportSaveBtn");
    const importBtn = document.getElementById("importSaveBtn");
    const input = document.getElementById("importSaveInput");
    if(exportBtn && !exportBtn.dataset.bound){
      exportBtn.dataset.bound = "1";
      exportBtn.addEventListener("click", exportSave);
    }
    if(importBtn && input && !importBtn.dataset.bound){
      importBtn.dataset.bound = "1";
      importBtn.addEventListener("click", ()=>{ input.value=""; input.click(); });
      input.addEventListener("change", ()=>importSave(input.files?.[0]));
    }
    const master = normalize(parse(localStorage.getItem(MASTER_KEY), null));
    updateStatus(master?.updatedAt);
  }

  initialize();
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindUI, {once:true});
  else bindUI();
  setInterval(sync, 1500);
  window.addEventListener("pagehide", sync);
  document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState === "hidden") sync(); });
})();
