(()=>{
  const MASTER_KEY = "cozyCatSaveV2";
  const BACKUP_KEY = "cozyCatSaveBackupV2";
  const PROFILE_KEYS = [
    "cozy9Mood","cozy9Fullness","cozy9Fish","cozy9Inventory",
    "cozy10LastCheckin","cozy10CheckinStreak"
  ];
  const DAILY_RE = /^(cozy9Learned-|cozy9Claimed-|cozy10QuizReward-|cozy10EventApplied-)(\d{4}-\d{2}-\d{2})$/;

  const safeJSON = (text, fallback) => {
    try { return text ? JSON.parse(text) : fallback; }
    catch (_) { return fallback; }
  };

  function dayObject(){
    return { learned:[], claimed:[], quizRewarded:false, eventApplied:false };
  }

  function collectCurrent(){
    const current = {
      schema:"cozy-cat-save-v2",
      version:2,
      updatedAt:new Date().toISOString(),
      profile:{
        mood:Number(localStorage.getItem("cozy9Mood") ?? 80),
        fullness:Number(localStorage.getItem("cozy9Fullness") ?? 60),
        fish:Number(localStorage.getItem("cozy9Fish") ?? 30),
        inventory:safeJSON(localStorage.getItem("cozy9Inventory"), {milk:0,chicken:0,cake:0,beef:0}),
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
      const date = m[2];
      const day = current.days[date] || dayObject();
      const raw = localStorage.getItem(key);
      if(m[1] === "cozy9Learned-") day.learned = safeJSON(raw, []);
      if(m[1] === "cozy9Claimed-") day.claimed = safeJSON(raw, []);
      if(m[1] === "cozy10QuizReward-") day.quizRewarded = raw === "1";
      if(m[1] === "cozy10EventApplied-") day.eventApplied = raw === "1";
      current.days[date] = day;
    }
    return current;
  }

  function validSave(data){
    return !!(data && data.schema === "cozy-cat-save-v2" && Number(data.version) === 2 && data.profile && data.days);
  }

  function writeMaster(data){
    if(!validSave(data)) return false;
    const old = localStorage.getItem(MASTER_KEY);
    if(old) localStorage.setItem(BACKUP_KEY, old);
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(MASTER_KEY, JSON.stringify(data));
    updateStatus(data.updatedAt);
    return true;
  }

  function restore(data){
    if(!validSave(data)) return false;
    const p = data.profile || {};
    localStorage.setItem("cozy9Mood", String(p.mood ?? 80));
    localStorage.setItem("cozy9Fullness", String(p.fullness ?? 60));
    localStorage.setItem("cozy9Fish", String(p.fish ?? 30));
    localStorage.setItem("cozy9Inventory", JSON.stringify(p.inventory || {milk:0,chicken:0,cake:0,beef:0}));
    localStorage.setItem("cozy10LastCheckin", p.lastCheckin || "");
    localStorage.setItem("cozy10CheckinStreak", String(p.checkinStreak ?? 0));

    for(const [date, day] of Object.entries(data.days || {})){
      localStorage.setItem("cozy9Learned-"+date, JSON.stringify(day.learned || []));
      localStorage.setItem("cozy9Claimed-"+date, JSON.stringify(day.claimed || []));
      if(day.quizRewarded) localStorage.setItem("cozy10QuizReward-"+date, "1");
      if(day.eventApplied) localStorage.setItem("cozy10EventApplied-"+date, "1");
    }
    return true;
  }

  function migrateOldMaster(){
    const old = safeJSON(localStorage.getItem("cozyCatSaveV1"), null);
    if(!old || !old.profile) return null;
    const migrated = {
      schema:"cozy-cat-save-v2",
      version:2,
      updatedAt:new Date().toISOString(),
      profile:{...old.profile},
      days:{...(old.days || {})}
    };
    return migrated;
  }

  function initData(){
    try{
      const existing = safeJSON(localStorage.getItem(MASTER_KEY), null);
      if(validSave(existing)){
        const hasLegacy = PROFILE_KEYS.some(k => localStorage.getItem(k) !== null);
        if(!hasLegacy) restore(existing);
        else writeMaster(collectCurrent());
        return;
      }

      const migrated = migrateOldMaster();
      if(migrated){
        const hasLegacy = PROFILE_KEYS.some(k => localStorage.getItem(k) !== null);
        if(!hasLegacy) restore(migrated);
        writeMaster(hasLegacy ? collectCurrent() : migrated);
      } else {
        writeMaster(collectCurrent());
      }
    } catch (_) {}
  }

  function sync(){
    try { writeMaster(collectCurrent()); } catch (_) {}
  }

  function formatTime(iso){
    try{
      return new Intl.DateTimeFormat("zh-CN", {month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));
    }catch(_){ return "刚刚"; }
  }

  function updateStatus(iso){
    const el = document.getElementById("saveGuardStatus");
    if(el) el.textContent = "自动保存开启 · 最近保存 " + formatTime(iso || new Date().toISOString());
  }

  function showToast(text){
    const el = document.getElementById("toast");
    if(el){
      el.textContent = text;
      el.classList.add("show");
      setTimeout(()=>el.classList.remove("show"), 2200);
    } else alert(text);
  }

  function exportSave(){
    sync();
    const data = safeJSON(localStorage.getItem(MASTER_KEY), null);
    if(!validSave(data)) return showToast("存档读取失败，请刷新后再试。");
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cozy-cat-save-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1200);
    showToast("猫猫存档已经导出啦 ♡");
  }

  function importSave(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const data = safeJSON(String(reader.result || ""), null);
      if(!validSave(data)) return showToast("这个文件不是有效的猫猫存档。");
      if(!confirm("导入会覆盖当前猫猫存档。确定继续吗？")) return;
      const current = localStorage.getItem(MASTER_KEY);
      if(current) localStorage.setItem(BACKUP_KEY, current);
      restore(data);
      writeMaster(data);
      showToast("存档恢复成功，正在重新载入……");
      setTimeout(()=>location.reload(), 500);
    };
    reader.onerror = ()=>showToast("读取存档失败，请再试一次。");
    reader.readAsText(file,"utf-8");
  }

  function installCard(){
    try{
      const page = document.querySelector('.page[data-page="me"]');
      if(!page) return;

      [...page.querySelectorAll('.card.section')].forEach(card=>{
        const text = card.textContent || "";
        if(text.includes("小提醒") && text.includes("真正分页")) card.remove();
      });

      if(document.getElementById("saveGuardCard")){
        updateStatus(safeJSON(localStorage.getItem(MASTER_KEY),{})?.updatedAt);
        return;
      }

      const card = document.createElement("section");
      card.className = "card section";
      card.id = "saveGuardCard";
      card.innerHTML = `
        <div class="small-title">💾 猫猫存档</div>
        <div class="helper" style="margin-bottom:12px">
          网页更新会继续保留签到、连续天数、零食和学习进度。换手机、换浏览器或清理浏览器数据前，可以先导出一份存档。
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="subbtn event-btn" id="exportSaveBtn" type="button" style="margin:0;max-width:none">📤 导出存档</button>
          <button class="subbtn checkin-btn" id="importSaveBtn" type="button" style="margin:0;max-width:none">📥 导入存档</button>
        </div>
        <input id="importSaveInput" type="file" accept="application/json,.json" hidden>
        <div id="saveGuardStatus" class="helper" style="margin-top:10px;font-size:12px;opacity:.8"></div>
      `;
      page.appendChild(card);

      document.getElementById("exportSaveBtn")?.addEventListener("click", exportSave);
      const input = document.getElementById("importSaveInput");
      document.getElementById("importSaveBtn")?.addEventListener("click", ()=>{ input.value=""; input.click(); });
      input?.addEventListener("change", ()=>importSave(input.files?.[0]));
      updateStatus(safeJSON(localStorage.getItem(MASTER_KEY),{})?.updatedAt);
    } catch (_) {}
  }

  initData();

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", installCard, {once:true});
  else installCard();

  setInterval(sync, 1200);
  window.addEventListener("pagehide", sync);
  document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState === "hidden") sync(); });
})();
