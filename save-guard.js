(()=>{
  "use strict";

  const MASTER_KEY = "cozyCatSaveV1";
  const BACKUP_KEY = "cozyCatSaveBackupV1";
  const SCHEMA = "cozy-cat-save";
  const VERSION = 1;
  const LEGACY_PROFILE_KEYS = [
    "cozy9Mood","cozy9Fullness","cozy9Fish","cozy9Inventory",
    "cozy10LastCheckin","cozy10CheckinStreak"
  ];
  const DAILY_RE = /^(cozy9Learned-|cozy9Claimed-|cozy10QuizReward-|cozy10EventApplied-)(\d{4}-\d{2}-\d{2})$/;

  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;

  const nativeSet = (key, value) => originalSetItem.call(localStorage, key, String(value));
  const nativeRemove = key => originalRemoveItem.call(localStorage, key);

  function safeParse(text, fallback){
    try { return text ? JSON.parse(text) : fallback; }
    catch { return fallback; }
  }
  function defaultSave(){
    return {
      schema: SCHEMA,
      version: VERSION,
      updatedAt: new Date().toISOString(),
      profile: {
        mood: 80,
        fullness: 60,
        fish: 30,
        inventory: {milk:0,chicken:0,cake:0,beef:0},
        lastCheckin: "",
        checkinStreak: 0
      },
      days: {}
    };
  }
  function normalizeSave(raw){
    if(!raw || raw.schema !== SCHEMA || Number(raw.version) !== VERSION) return null;
    const d = defaultSave();
    const p = raw.profile || {};
    d.updatedAt = raw.updatedAt || d.updatedAt;
    d.profile.mood = Number.isFinite(Number(p.mood)) ? Number(p.mood) : d.profile.mood;
    d.profile.fullness = Number.isFinite(Number(p.fullness)) ? Number(p.fullness) : d.profile.fullness;
    d.profile.fish = Number.isFinite(Number(p.fish)) ? Number(p.fish) : d.profile.fish;
    d.profile.inventory = Object.assign({}, d.profile.inventory, p.inventory || {});
    d.profile.lastCheckin = typeof p.lastCheckin === "string" ? p.lastCheckin : "";
    d.profile.checkinStreak = Number.isFinite(Number(p.checkinStreak)) ? Number(p.checkinStreak) : 0;
    d.days = {};
    for(const [date, day] of Object.entries(raw.days || {})){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      d.days[date] = {
        learned: Array.isArray(day?.learned) ? day.learned : [],
        claimed: Array.isArray(day?.claimed) ? day.claimed : [],
        quizRewarded: Boolean(day?.quizRewarded),
        eventApplied: Boolean(day?.eventApplied)
      };
    }
    return d;
  }
  function currentMaster(){
    return normalizeSave(safeParse(localStorage.getItem(MASTER_KEY), null));
  }
  function collectLegacy(base){
    const out = normalizeSave(base) || defaultSave();
    const readNumber = (key, fallback) => {
      const raw = localStorage.getItem(key);
      if(raw === null) return fallback;
      const n = Number(raw);
      return Number.isFinite(n) ? n : fallback;
    };

    out.profile.mood = readNumber("cozy9Mood", out.profile.mood);
    out.profile.fullness = readNumber("cozy9Fullness", out.profile.fullness);
    out.profile.fish = readNumber("cozy9Fish", out.profile.fish);

    const invRaw = localStorage.getItem("cozy9Inventory");
    if(invRaw !== null){
      out.profile.inventory = Object.assign(
        {milk:0,chicken:0,cake:0,beef:0},
        safeParse(invRaw, {}) || {}
      );
    }
    const last = localStorage.getItem("cozy10LastCheckin");
    if(last !== null) out.profile.lastCheckin = last;
    out.profile.checkinStreak = readNumber("cozy10CheckinStreak", out.profile.checkinStreak);

    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      if(!key) continue;
      const match = key.match(DAILY_RE);
      if(!match) continue;
      const prefix = match[1];
      const date = match[2];
      const day = out.days[date] || {learned:[],claimed:[],quizRewarded:false,eventApplied:false};
      const raw = localStorage.getItem(key);
      if(prefix === "cozy9Learned-") day.learned = safeParse(raw, []) || [];
      else if(prefix === "cozy9Claimed-") day.claimed = safeParse(raw, []) || [];
      else if(prefix === "cozy10QuizReward-") day.quizRewarded = raw === "1";
      else if(prefix === "cozy10EventApplied-") day.eventApplied = raw === "1";
      out.days[date] = day;
    }
    out.updatedAt = new Date().toISOString();
    return out;
  }
  function saveMaster(data, keepPrevious=true){
    const normalized = normalizeSave(data);
    if(!normalized) return false;
    normalized.updatedAt = new Date().toISOString();
    if(keepPrevious){
      const previous = localStorage.getItem(MASTER_KEY);
      if(previous) nativeSet(BACKUP_KEY, previous);
    }
    nativeSet(MASTER_KEY, JSON.stringify(normalized));
    updateSaveStatus(normalized.updatedAt);
    return true;
  }
  function isManagedLegacyKey(key){
    return LEGACY_PROFILE_KEYS.includes(key) || DAILY_RE.test(key);
  }
  function clearLegacyDailyKeys(){
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key && DAILY_RE.test(key)) keys.push(key);
    }
    keys.forEach(nativeRemove);
  }
  function restoreToLegacy(data, replaceDaily=false){
    const save = normalizeSave(data);
    if(!save) return false;
    if(replaceDaily) clearLegacyDailyKeys();

    nativeSet("cozy9Mood", save.profile.mood);
    nativeSet("cozy9Fullness", save.profile.fullness);
    nativeSet("cozy9Fish", save.profile.fish);
    nativeSet("cozy9Inventory", JSON.stringify(save.profile.inventory));
    nativeSet("cozy10LastCheckin", save.profile.lastCheckin);
    nativeSet("cozy10CheckinStreak", save.profile.checkinStreak);

    for(const [date, day] of Object.entries(save.days)){
      nativeSet("cozy9Learned-"+date, JSON.stringify(day.learned || []));
      nativeSet("cozy9Claimed-"+date, JSON.stringify(day.claimed || []));
      if(day.quizRewarded) nativeSet("cozy10QuizReward-"+date, "1");
      else nativeRemove("cozy10QuizReward-"+date);
      if(day.eventApplied) nativeSet("cozy10EventApplied-"+date, "1");
      else nativeRemove("cozy10EventApplied-"+date);
    }
    return true;
  }

  let master = currentMaster();
  if(master){
    restoreToLegacy(master, false);
  } else {
    master = collectLegacy(defaultSave());
    saveMaster(master, false);
  }

  let syncQueued = false;
  function syncFromLegacy(){
    syncQueued = false;
    const latest = collectLegacy(currentMaster() || defaultSave());
    saveMaster(latest, true);
  }
  function queueSync(){
    if(syncQueued) return;
    syncQueued = true;
    queueMicrotask(syncFromLegacy);
  }

  Storage.prototype.setItem = function(key, value){
    originalSetItem.call(this, key, value);
    if(this === localStorage && isManagedLegacyKey(String(key))) queueSync();
  };
  Storage.prototype.removeItem = function(key){
    originalRemoveItem.call(this, key);
    if(this === localStorage && isManagedLegacyKey(String(key))) queueSync();
  };
  Storage.prototype.clear = function(){
    originalClear.call(this);
    if(this === localStorage){
      master = defaultSave();
      saveMaster(master, false);
    }
  };

  window.addEventListener("pagehide", ()=>{
    try { syncFromLegacy(); } catch {}
  });
  document.addEventListener("visibilitychange", ()=>{
    if(document.visibilityState === "hidden"){
      try { syncFromLegacy(); } catch {}
    }
  });

  function formatTime(iso){
    try{
      return new Intl.DateTimeFormat("zh-CN", {
        month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"
      }).format(new Date(iso));
    }catch{return "刚刚";}
  }
  function updateSaveStatus(iso){
    const el = document.getElementById("saveGuardStatus");
    if(el) el.textContent = "自动保存开启 · 最近保存 " + formatTime(iso || new Date().toISOString());
  }
  function toast(text){
    const appToast = document.getElementById("toast");
    if(appToast){
      appToast.textContent = text;
      appToast.classList.add("show");
      setTimeout(()=>appToast.classList.remove("show"), 2200);
    } else {
      alert(text);
    }
  }
  function exportSave(){
    syncFromLegacy();
    const data = currentMaster();
    if(!data) return toast("存档读取失败，请刷新后再试。");
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `cozy-cat-save-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1500);
    toast("猫猫存档已经导出啦 ♡");
  }
  function importSave(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const parsed = normalizeSave(safeParse(String(reader.result || ""), null));
      if(!parsed){
        toast("这个文件不是有效的猫猫存档。");
        return;
      }
      if(!confirm("导入会覆盖当前猫猫存档。确定继续吗？")) return;
      const existing = localStorage.getItem(MASTER_KEY);
      if(existing) nativeSet(BACKUP_KEY, existing);
      saveMaster(parsed, false);
      restoreToLegacy(parsed, true);
      toast("存档恢复成功，正在重新载入……");
      setTimeout(()=>location.reload(), 550);
    };
    reader.onerror = ()=>toast("读取存档文件失败，请再试一次。");
    reader.readAsText(file, "utf-8");
  }

  function installSaveCard(){
    const page = document.querySelector('.page[data-page="me"]');
    if(!page) return;

    [...page.querySelectorAll(".card.section")].forEach(card=>{
      const title = card.querySelector(".small-title");
      if(title && title.textContent.includes("小提醒")) card.remove();
    });

    if(document.getElementById("saveGuardCard")) return;
    const card = document.createElement("section");
    card.className = "card section";
    card.id = "saveGuardCard";
    card.innerHTML = `
      <div class="small-title">💾 猫猫存档</div>
      <div class="helper" style="margin-bottom:12px">
        网页更新会保留签到、连续天数、零食和学习进度。换手机、换浏览器或清理浏览器数据前，建议先导出一份存档。
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="subbtn event-btn" id="exportSaveBtn" type="button" style="margin:0;max-width:none">📤 导出存档</button>
        <button class="subbtn checkin-btn" id="importSaveBtn" type="button" style="margin:0;max-width:none">📥 导入存档</button>
      </div>
      <input id="importSaveInput" type="file" accept="application/json,.json" hidden>
      <div id="saveGuardStatus" class="helper" style="margin-top:10px;font-size:12px;opacity:.8"></div>
    `;
    page.appendChild(card);

    document.getElementById("exportSaveBtn").addEventListener("click", exportSave);
    const input = document.getElementById("importSaveInput");
    document.getElementById("importSaveBtn").addEventListener("click", ()=>{
      input.value = "";
      input.click();
    });
    input.addEventListener("change", ()=>importSave(input.files?.[0]));
    updateSaveStatus((currentMaster() || {}).updatedAt);
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", installSaveCard, {once:true});
  else installSaveCard();
})();
