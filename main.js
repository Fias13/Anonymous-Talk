/* =================== MAIN.JS =================== */

/* ---------- รายชื่อ / Friends Tab ---------- */

// ผู้ใช้ทั้งหมด (หาเพื่อนใหม่)
const allUsers = [
  //{ name: "Popmama",              status: "online"  },
  //{ name: "Popsiam",              status: "away"    },
  //{ name: "Boneca Ambalabu",      status: "online"  },
  //{ name: "Chimpanzini Bananini", status: "online" }
];

// เพื่อนที่แอดแล้ว (เก็บใน localStorage.friends)
let friends = [];
try {
  friends = JSON.parse(localStorage.getItem("friends") || "[]");
} catch {
  friends = [];
}



// DOM refs หลัก
const userListEl    = document.getElementById("userList");
const usernameInput = document.getElementById("usernameInput");
const tabNew        = document.getElementById("tabNew");
const tabOffline    = document.getElementById("tabOffline");
const joinBtn       = document.getElementById("joinBtn");
const onlineCountEl = document.querySelector(".online-count");

// Top-right
const coinBtn     = document.getElementById("coinBtn");
const coinCountEl = document.getElementById("coinCount");
const bellBtn     = document.getElementById("bellBtn");
const notifBadge  = document.getElementById("notifBadge");
// Notification dropdown element refs (HTML added if missing)
const notifDropdown = document.getElementById("notifDropdown");
const notifListEl   = document.getElementById("notifList");
const notifClearBtn = document.getElementById("notifClear");
const notifViewAll  = document.getElementById("notifViewAll");

// Profile
const avatarBtn       = document.getElementById("avatarBtn");
const profileMenu     = document.getElementById("profileMenu");
const logoutBtn       = document.getElementById("logoutBtn");
const menuProfileBtn  = document.getElementById("menuProfile"); // ⭐ ใช้ปุ่ม My Profile แทน
const menuSettingsBtn = document.getElementById("menuSettings"); // จะยังอยู่แต่ไม่ใช้เปิดรูป
const menuNameEl      = document.getElementById("menuName");
const menuMailEl      = document.getElementById("menuMail");

// Customize
const customModal    = document.getElementById("customModal");
const customBackdrop = document.getElementById("customBackdrop");
const customClose    = document.getElementById("customClose");
const customTabs     = document.getElementById("customTabs");
const customGrid     = document.getElementById("customGrid");
const costomBtn      = document.getElementById("costomBtn");
const customSave     = document.getElementById("customSave");

// Shop
const shopModal     = document.getElementById("shopModal");
const shopBackdrop  = document.getElementById("shopBackdrop");
const shopClose     = document.getElementById("shopClose");
const shopTabs      = document.getElementById("shopTabs");
const shopGrid      = document.getElementById("shopGrid");
const shopClaim     = document.getElementById("shopClaim");
const shopBtn       = document.getElementById("shopBtn");

// Daily
const dailyModal    = document.getElementById("dailyModal");
const dailyBackdrop = document.getElementById("dailyBackdrop");
const dailyClose    = document.getElementById("dailyClose");
const dailyGrid     = document.getElementById("dailyGrid");
const dailyClaimBtn = document.getElementById("dailyClaim");
const dailyBtn      = document.getElementById("dailyBtn");

// Settings (โปรไฟล์)
const settingsModal         = document.getElementById("settingsModal");
const settingsBackdrop      = document.getElementById("settingsBackdrop");
const settingsClose         = document.getElementById("settingsClose");
const settingsAvatarPreview = document.getElementById("settingsAvatarPreview");
const settingsAvatarUpload  = document.getElementById("settingsAvatarUpload");
const settingsAvatarReset   = document.getElementById("settingsAvatarReset");
const settingsSave          = document.getElementById("settingsSave");

// ====== Coin helpers: เก็บเหรียญลง localStorage ======
function getCoins() {
  // อ่านจาก DOM ก่อน ถ้าไม่มีค่อยอ่านจาก localStorage
  const fromText = parseInt(coinCountEl?.textContent || "0", 10);
  if (!Number.isNaN(fromText)) return fromText;

  const fromStorage = parseInt(localStorage.getItem("coins") || "0", 10);
  return Number.isNaN(fromStorage) ? 0 : fromStorage;
}

function setCoins(value) {
  const safe = Math.max(0, parseInt(value || 0, 10) || 0);
  if (coinCountEl) coinCountEl.textContent = safe;
  localStorage.setItem("coins", String(safe));
}

// โหลดเหรียญตอนเปิดหน้าเว็บ
(function initCoins() {
  const saved = parseInt(localStorage.getItem("coins") || "0", 10);
  const initial = Number.isNaN(saved) ? 0 : saved;
  if (coinCountEl) coinCountEl.textContent = initial;
})();


// ===== อัปเดตจำนวนคนออนไลน์ของ "เพื่อน" เท่านั้น =====
function updateOnlineCount() {
  if (!onlineCountEl) return;

  // นับเฉพาะเพื่อนที่ status === "online"
  const onlineFriends = friends.filter(f => f.status === "online").length;

  // ถ้าอยู่แท็บเพื่อน ค่อยแสดง badge
  if (currentTab === "friends") {
    onlineCountEl.textContent = `${onlineFriends} Friends Online`;
    onlineCountEl.style.visibility = "visible";
  } else {
    // แท็บหาเพื่อนใหม่: ซ่อน badge ไปเลย
    onlineCountEl.style.visibility = "hidden";
  }
}

// ========== Custom Alert UI แทน alert() แบบเดิม ==========
function showAlert(message) {
  const alertBox = document.getElementById("customAlert");
  const msgEl    = document.getElementById("customAlertMessage");
  const btn      = document.getElementById("customAlertBtn");

  if (!alertBox || !msgEl || !btn) return;

  msgEl.textContent = message;
  alertBox.style.display = "flex";

  btn.onclick = () => {
    alertBox.style.display = "none";
  };
}


// สถานะแท็บปัจจุบัน
let currentTab = "new"; // "new" = หาเพื่อนใหม่, "friends" = เพื่อน (ไม่ออนไลน์)

const DEFAULT_AVATAR = "./assets/images/default-profile.png";

/* ===== เปลี่ยนแท็บ ===== */
function setActiveTab(tab) {
  currentTab = tab;

  if (!tabNew || !tabOffline) return;

  if (tab === "new") {
    tabNew.classList.add("active");
    tabNew.classList.remove("inactive");

    tabOffline.classList.remove("active");
    tabOffline.classList.add("inactive");
  } else {
    tabOffline.classList.add("active");
    tabOffline.classList.remove("inactive");

    tabNew.classList.remove("active");
    tabNew.classList.add("inactive");
  }

  renderUsers();
  updateOnlineCount(); // ⭐ อัปเดตจำนวนเพื่อนออนไลน์ตามแท็บ
}


function renderUsers() {
  if (!userListEl) return;
  userListEl.innerHTML = "";

  const emptyEl = document.getElementById("userListEmpty");
  if (emptyEl) emptyEl.hidden = true;

  let list;
  if (currentTab === "new") {
    list = allUsers.filter(u => !friends.some(f => f.name === u.name));
  } else {
    list = friends;
  }

  if (currentTab === "friends" && (!list || list.length === 0)) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  list.forEach(u => {
    const li = document.createElement("li");
    li.className = "user-item";

    const status = u.status || "offline";
    const label =
      status === "online"  ? "Online"  :
      status === "away"    ? "Away"    :
      status === "offline" ? "Offline" : status;

    let rightPartHtml = "";

    if (currentTab === "new") {
      // Add-friend feature removed — no add button shown
      rightPartHtml = ``;
    } else {
      // แท็บเพื่อน = ปุ่มลบ
      rightPartHtml = `
        <div class="user-actions">
          <button class="user-action remove" title="ลบเพื่อน">✕</button>
        </div>
      `;
    }

    li.innerHTML = `
      <div class="user-left">
        <img src="./assets/images/default-profile.png" alt="${u.name}" class="user-avatar" />
        <div class="user-info">
          <span class="user-name">${u.name}</span>
          <span class="user-status ${status}">${label}</span>
        </div>
      </div>
      ${rightPartHtml}
    `;

    userListEl.appendChild(li);
  });

  // (add-friend UI removed) no add buttons or handlers

  // ปุ่มแชท (ถ้าอนาคตเพิ่ม)
  userListEl.querySelectorAll(".user-action.chat").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".user-item");
      const name = item.querySelector(".user-name").textContent;
      alert("เปิดแชทกับ " + name + " (demo)");
    });
  });

 // ปุ่มลบเพื่อน
  userListEl.querySelectorAll(".user-action.remove").forEach(btn => {
    btn.addEventListener("click", async () => {
      const item = btn.closest(".user-item");
      const name = item.querySelector(".user-name").textContent;

      // ลบจาก friends list
      friends = friends.filter(f => f.name !== name);
      localStorage.setItem("friends", JSON.stringify(friends));

      // ⭐ ลบ notifications ที่เกี่ยวข้องกับเพื่อนคนนี้
      notifications = notifications.filter(n => {
        const isRelated = 
          (n.type === 'friend_request' && n.fromName === name) ||
          (n.type === 'friend_accepted' && n.friendData?.name === name);
        return !isRelated;
      });
      saveNotifications();

      // ⭐ ลบใน Firebase ด้วย
      if (firebaseDb && firebaseNotifRef) {
        try {
          const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
          const snapshot = await dbMod.get(firebaseNotifRef);
          
          if (snapshot.exists()) {
            const allNotifs = snapshot.val();
            for (const key in allNotifs) {
              const notif = allNotifs[key];
              const isRelated = 
                (notif.type === 'friend_request' && notif.fromName === name) ||
                (notif.type === 'friend_accepted' && notif.friendData?.name === name);
              
              if (isRelated) {
                await dbMod.remove(dbMod.ref(firebaseDb, `notifications/${myUserId}/${key}`));
              }
            }
          }
        } catch (err) {
          console.error('Error removing notifications:', err);
        }
      }

      renderUsers();
      updateOnlineCount();
      renderNotifications();
      updateNotifBadge();
      
      showAlert(`ลบ ${name} ออกจากรายชื่อเพื่อนแล้ว`);
    });
  });
}

/* ===== ผูก event กับปุ่มแท็บ ===== */
tabNew?.addEventListener("click", () => setActiveTab("new"));
tabOffline?.addEventListener("click", () => setActiveTab("friends"));

// ⭐ เริ่มต้นที่แท็บ หาเพื่อนใหม่ + อัปเดตจำนวนคนออนไลน์
setActiveTab("new");
updateOnlineCount();

/* ---------- Greeting: กด Enter ทักชื่อ ---------- */

usernameInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const name = usernameInput.value.trim();
    if (name) alert("สวัสดี " + name + "!");
  }
});

/* ---------- Top-right: Coins / Noti ---------- */

// ปุ่มเหรียญ: ตอนนี้กดแล้ว "ไม่เพิ่มเหรียญ"
coinBtn?.addEventListener("click", () => {
  // ตั้งใจให้ไม่ทำอะไร
});

// -- Notifications implementation (dropdown)
let notifications = [];

// identify current user (ensure userId exists so we can use it for Firebase paths)
const myUserId = localStorage.getItem("userId") || (() => {
  const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2,9);
  localStorage.setItem("userId", id);
  return id;
})();

const myName = localStorage.getItem("chatUsername") || localStorage.getItem("username") || "ผู้ใช้ไม่ระบุชื่อ";

// firebase runtime variables (initialized asynchronously)
let firebaseDb = null;
let firebaseApp = null;
let firebaseNotifRef = null; // ref to `users/{myUserId}/notifications`

// Firebase config (same project used by test.html/chatpage)
const firebaseConfig = {
  apiKey: "AIzaSyAVnoP0I5eMuPLWfCZTagmuVKZgOFM-S6o",
  authDomain: "anonymous-talk-chat-67d1a.firebaseapp.com",
  databaseURL: "https://anonymous-talk-chat-67d1a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anonymous-talk-chat-67d1a",
  storageBucket: "anonymous-talk-chat-67d1a.firebasestorage.app",
  messagingSenderId: "1007242493297",
  appId: "1:1007242493297:web:1e0589e885c3cb80c40ad0"
};

// Initialize Firebase (dynamic import so main.js can stay a normal script)
async function initFirebaseNotifications() {
  try {
    // dynamic import firebase modules
    const appMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const dbMod  = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

    firebaseApp = appMod.initializeApp(firebaseConfig);
    firebaseDb  = dbMod.getDatabase(firebaseApp);

    // listen to notifications for this user under /notifications/{userId}
    firebaseNotifRef = dbMod.ref(firebaseDb, `notifications/${myUserId}`);

    // on new notification in per-user path
    dbMod.onChildAdded(firebaseNotifRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      data._key = snap.key;
      data._source = 'notifications';

      // ignore duplicates
      if (!notifications.some(n => n._key === data._key)) {
        console.log(`🆕 New notification received:`, data);
        
        // ⭐ ถ้าเป็น friend_accepted และมี addToFriends flag -> เพิ่มเพื่อนอัตโนมัติ
        if (data.type === 'friend_accepted' && data.addToFriends && data.friendData) {
          const friends = getFriends();
          if (!friends.some(f => f.name === data.friendData.name)) {
            friends.push(data.friendData);
            saveFriends(friends);
            renderUsers();
            updateOnlineCount();
            console.log('✅ Auto-added friend from accepted request:', data.friendData.name);
          }
        }
        
        // push to top
        notifications.unshift(data);
        renderNotifications();
        updateNotifBadge();
        saveNotifications();
      }
    });

    // (no global fallback listening needed — writing now goes to /notifications/{userId})

    // on changed (status changes) update local copy
    dbMod.onChildChanged(firebaseNotifRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      data._key = snap.key;
      const idx = notifications.findIndex(n => n._key === data._key);
      if (idx !== -1) {
        notifications[idx] = data;
        renderNotifications();
        updateNotifBadge();
      }
    });

    // on removed
    dbMod.onChildRemoved(firebaseNotifRef, (snap) => {
      const key = snap.key;
      notifications = notifications.filter(n => n._key !== key);
      renderNotifications();
      updateNotifBadge();
    });

    // initial load from Firebase path (also triggers child_added in many hosts)
    // but keep local storage fallback already present
  } catch (err) {
    console.warn('Firebase notifications not initialized:', err);
  }
}

// start Firebase notifications in background
initFirebaseNotifications();

function loadNotifications() {
  try {
    notifications = JSON.parse(localStorage.getItem("notifications") || "null") || [];
  } catch {
    notifications = [];
  }

  // ⭐ ใส่เฉพาะ Welcome notification ถ้ายังไม่มี
  if (notifications.length === 0) {
    notifications = [
      { 
        id: 1, 
        title: "Welcome!", 
        text: "Thanks for trying ANONYMOUS TALK", 
        unread: false  // ไม่มี badge
      }
    ];
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }
}

function saveNotifications() {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

function updateNotifBadge() {
  if (!notifBadge) return;
  const unread = notifications.filter(n => n.unread).length;
  if (unread > 0) {
    notifBadge.textContent = String(unread);
    notifBadge.hidden = false;
  } else {
    notifBadge.hidden = true;
  }
}

function renderNotifications() {
  if (!notifListEl) return;
  notifListEl.innerHTML = "";

  if (!notifications || notifications.length === 0) {
    const empty = document.createElement("div");
    empty.className = "notif-empty";
    empty.textContent = "ไม่มีการแจ้งเตือน";
    notifListEl.appendChild(empty);
    return;
  }

  notifications.forEach(n => {
    const el = document.createElement("div");
    // unread property might be boolean OR status === 'pending' for firebase friend_request
    const isUnread = n.unread || (n.status && n.status === 'pending');
    el.className = `notif-item ${isUnread ? 'unread' : ''}`.trim();

    // Render all notification types as generic items (friend_request actions removed)
    el.innerHTML = `
      <div class="notif-avatar" aria-hidden="true"></div>
      <div class="notif-body">
        <div class="notif-title">${escapeHtml(n.title || n.type || 'Notification')}</div>
        <div class="notif-text">${escapeHtml(n.text || n.message || '')}</div>
        <div class="notif-meta">${escapeHtml(n.time || n.createdAt ? (n.time || new Date(n.createdAt).toLocaleString()) : '')}</div>
      </div>
    `;

    el.addEventListener("click", () => {
        // generic click will mark as read if possible
        if (n._key && firebaseDb) {
          (async () => {
            try {
              const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
              await dbMod.update(dbMod.ref(firebaseDb, `notifications/${myUserId}/${n._key}`), { status: 'read' });
            } catch(err) { /* ignore */ }
          })();
        }

        // local fallback
        n.unread = false;
        saveNotifications();
        renderNotifications();
        updateNotifBadge();
        showAlert(`${n.title || n.type} — ${n.text || n.message || ''}`);
      });

    notifListEl.appendChild(el);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// load/render
loadNotifications();
updateNotifBadge();
renderNotifications();

// Toggle dropdown
bellBtn?.addEventListener("click", (e) => {
  e?.stopPropagation();
  if (!notifDropdown || !bellBtn) return;

  const opening = !notifDropdown.classList.contains("show");
  // Close other menus (profile) to avoid overlap
  profileMenu?.classList.remove("show");

  if (opening) {
    notifDropdown.classList.add("show");
    notifDropdown.setAttribute("aria-hidden", "false");
    bellBtn.setAttribute("aria-expanded", "true");
    // hide the counter badge when opened (behaviour like before)
    if (notifBadge) notifBadge.hidden = true;
  } else {
    notifDropdown.classList.remove("show");
    notifDropdown.setAttribute("aria-hidden", "true");
    bellBtn.setAttribute("aria-expanded", "false");
  }
});

notifClearBtn?.addEventListener("click", () => {
  notifications.forEach(n => (n.unread = false));
  saveNotifications();
  renderNotifications();
  updateNotifBadge();
});

notifViewAll?.addEventListener("click", () => {
  if (confirm("ต้องการลบการแจ้งเตือนทั้งหมดหรือไม่?")) {
    clearAllNotifications();
  }
});

function clearAllNotifications() {
  // เก็บเฉพาะ Welcome notification
  const welcomeNotif = notifications.find(n => n.title === "Welcome!");
  
  if (welcomeNotif) {
    notifications = [welcomeNotif];
  } else {
    notifications = [];
  }
  
  // ลบใน Firebase ด้วย (ยกเว้น Welcome)
  if (firebaseDb && firebaseNotifRef) {
    (async () => {
      try {
        const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        const snapshot = await dbMod.get(firebaseNotifRef);
        
        if (snapshot.exists()) {
          const allNotifs = snapshot.val();
          
          for (const key in allNotifs) {
            const notif = allNotifs[key];
            // ลบทุกอันที่ไม่ใช่ Welcome
            if (notif.title !== "Welcome!") {
              await dbMod.remove(dbMod.ref(firebaseDb, `notifications/${myUserId}/${key}`));
            }
          }
        }
      } catch (err) {
        console.error('Error clearing Firebase notifications:', err);
      }
    })();
  }
  
  saveNotifications();
  renderNotifications();
  updateNotifBadge();
  
  showAlert("ลบการแจ้งเตือนทั้งหมดแล้ว");
}

/* ---------- Profile dropdown ---------- */

function openProfileMenu(e) {
  e?.stopPropagation();
  if (!profileMenu) return;
  profileMenu.classList.toggle("show");
}

avatarBtn?.addEventListener("click", openProfileMenu);

document.addEventListener("click", (e) => {
  if (profileMenu?.classList.contains("show") && !e.target.closest(".profile-wrap")) {
    profileMenu.classList.remove("show");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (profileMenu?.classList.contains("show")) profileMenu.classList.remove("show");
    if (notifDropdown?.classList.contains("show")) {
      notifDropdown.classList.remove("show");
      bellBtn?.setAttribute("aria-expanded", "false");
    }
  }
});

// Logout - แก้ไขให้เก็บข้อมูลเหรียญและไอเทมไว้
logoutBtn?.addEventListener("click", () => {
  // ✅ เก็บข้อมูลสำคัญก่อน logout
  const coinsBackup = localStorage.getItem("coins");
  const inventoryBackup = localStorage.getItem("inventory");
  const equippedBackup = localStorage.getItem("avatar_equipped");
  const profileAvatarBackup = localStorage.getItem("profileAvatar");
  const dailyStateBackup = localStorage.getItem("daily_seq_state");
  const friendsBackup = localStorage.getItem("friends");
  const notificationsBackup = localStorage.getItem("notifications");
  
  // ลบข้อมูลผู้ใช้
  localStorage.removeItem("user");
  sessionStorage.clear();
  
  // ✅ คืนข้อมูลที่ต้องเก็บ
  if (coinsBackup) localStorage.setItem("coins", coinsBackup);
  if (inventoryBackup) localStorage.setItem("inventory", inventoryBackup);
  if (equippedBackup) localStorage.setItem("avatar_equipped", equippedBackup);
  if (profileAvatarBackup) localStorage.setItem("profileAvatar", profileAvatarBackup);
  if (dailyStateBackup) localStorage.setItem("daily_seq_state", dailyStateBackup);
  if (friendsBackup) localStorage.setItem("friends", friendsBackup);
  if (notificationsBackup) localStorage.setItem("notifications", notificationsBackup);
  
  showAlert("ออกจากระบบแล้ว");
  profileMenu?.classList.remove("show");
  window.location.href = "index.html";
});

/* ---------- โหลดรูปโปรไฟล์เริ่มต้น ---------- */

(() => {
  const savedAvatar = localStorage.getItem("profileAvatar");
  const targets = document.querySelectorAll(".avatar-img, .menu-avatar");
  if (savedAvatar) {
    targets.forEach(img => (img.src = savedAvatar));
  } else {
    targets.forEach(img => (img.src = DEFAULT_AVATAR));
  }
})();

/* ---------- Settings Modal (เปลี่ยนรูปโปรไฟล์) ---------- */

let pendingAvatarData = null;

function openSettingsModal() {
  if (!settingsModal) return;

  const currentAvatar = localStorage.getItem("profileAvatar") || DEFAULT_AVATAR;
  if (settingsAvatarPreview) {
    settingsAvatarPreview.src = currentAvatar;
  }
  pendingAvatarData = null;

  settingsModal.classList.add("open");
  settingsModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSettingsModal() {
  if (!settingsModal) return;
  settingsModal.classList.remove("open");
  settingsModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// เปิดเปลี่ยนรูป/โปรไฟล์ จาก My Profile แทน Settings
menuProfileBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  openSettingsModal();
});


settingsBackdrop?.addEventListener("click", closeSettingsModal);
settingsClose?.addEventListener("click", closeSettingsModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && settingsModal?.classList.contains("open")) {
    closeSettingsModal();
  }
});

settingsAvatarUpload?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.addEventListener("change", (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => {
      pendingAvatarData = r.target.result;
      if (settingsAvatarPreview) {
        settingsAvatarPreview.src = pendingAvatarData;
      }
    };
    reader.readAsDataURL(file);
  });
});

settingsAvatarReset?.addEventListener("click", () => {
  pendingAvatarData = "RESET";
  if (settingsAvatarPreview) {
    settingsAvatarPreview.src = DEFAULT_AVATAR;
  }
});

settingsSave?.addEventListener("click", () => {
  if (pendingAvatarData === null) {
    closeSettingsModal();
    return;
  }

  if (pendingAvatarData === "RESET") {
    localStorage.removeItem("profileAvatar");
    document.querySelectorAll(".avatar-img, .menu-avatar")
      .forEach(img => (img.src = DEFAULT_AVATAR));
  } else {
    localStorage.setItem("profileAvatar", pendingAvatarData);
    document.querySelectorAll(".avatar-img, .menu-avatar")
      .forEach(img => (img.src = pendingAvatarData));
  }

  alert("บันทึกการตั้งค่าเรียบร้อย!");
  closeSettingsModal();
});

/* ---------- เปลี่ยนสถานะแบบ dropdown ใต้ชื่อ ---------- */

const statusDotAvatar = document.querySelector(".avatar-btn .status-dot");
const statusDotMenu   = document.getElementById("statusDotMenu");
const statusTextEl    = document.getElementById("statusText");
const statusRowBtn    = document.getElementById("statusRow");
const statusListEl    = document.getElementById("statusList");

const STATUS_CONFIG = {
  online:  { key: "online",  label: "ออนไลน์",          className: "online"  },
  away:    { key: "away",    label: "ไม่อยู่",           className: "away"    },
  busy:    { key: "busy",    label: "ห้ามรบกวน",        className: "busy"    },
  offline: { key: "offline", label: "ออฟไลน์ / ซ่อนตัว", className: "offline" }
};

function applyStatus(statusKey) {
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.online;

  Object.values(STATUS_CONFIG).forEach(s => {
    statusDotAvatar?.classList.remove(s.className);
    statusDotMenu?.classList.remove(s.className);
  });

  statusDotAvatar?.classList.add(cfg.className);
  statusDotMenu?.classList.add(cfg.className);
  if (statusTextEl) statusTextEl.textContent = cfg.label;

  localStorage.setItem("userStatus", cfg.key);
}

const savedStatus = localStorage.getItem("userStatus") || "online";
applyStatus(savedStatus);

statusRowBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!statusListEl) return;
  statusListEl.classList.toggle("open");
});

statusListEl?.querySelectorAll(".status-option").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const key = btn.dataset.status;
    applyStatus(key);
    statusListEl.classList.remove("open");
  });
});

statusDotAvatar?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!statusListEl) return;
  statusListEl.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!statusListEl) return;
  const isInside = e.target.closest(".status-block");
  if (!isInside) statusListEl.classList.remove("open");
});

/* ---------- Customize Modal (แต่งตัว) ---------- */

let customCat = "skin";

function openCustom() {
  if (!customModal) return;
  setActiveCustomTab(customCat);
  renderCustomGrid(customCat);
  renderAvatar();

  customModal.classList.add("open");
  customModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCustom() {
  if (!customModal) return;
  customModal.classList.remove("open");
  customModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

costomBtn?.addEventListener("click", openCustom);
customBackdrop?.addEventListener("click", closeCustom);
customClose?.addEventListener("click", closeCustom);

/* Tabs */
function setActiveCustomTab(cat) {
  customCat = cat;
  document.querySelectorAll(".custom-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.cat === cat);
  });
}

customTabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".custom-tab");
  if (!btn) return;
  setActiveCustomTab(btn.dataset.cat);
  renderCustomGrid(btn.dataset.cat);
});

/* ---------- SHOP ITEMS ---------- */

const SHOP_ITEMS = {
  skin: [
    { 
      id: "skin-none",
      name: "ไม่ใส่สกิน",
      price: 0,
      img: "./assets/avatar/empty.png",
      hideInShop: true
    },
    { id: "skin-base",    
      name: "Base Skin",    
      price: 0, 
      img: "./assets/avatar/dino.png", 
      hideInShop: true 
    },
    { id: "skin-classic", 
      name: "Classic Skin", 
      price: 40, 
      img: "./assets/shop/skin1.png" ,
      avatarImg: "./assets/avatar/skin1.png",
      fullBody: true
    },
    { id: "skin-night",   
      name: "Night Skin",   
      price: 40, 
      img: "./assets/shop/skin2.png",
      avatarImg: "./assets/avatar/skin2.png",
      fullBody: true   
    },
    { id: "skin-pastel",  
      name: "Pastel Skin",  
      price: 40, 
      img: "./assets/shop/skin3.png",
      avatarImg: "./assets/avatar/skin3.png",
      fullBody: true  
    }
  ],
  hat: [
    { 
      id: "hat-none",
      name: "ไม่ใส่หมวก",
      price: 0,
      img: "./assets/avatar/empty.png",
      hideInShop: true
    },
    {
      id: "hat-top",
      name: "Top Hat",
      price: 20,
      img: "./assets/shop/hat1.png",
      avatarImg: "./assets/avatar/avatar_hat1.png",
      fullBody: true
    },
    {
      id: "hat-cap",
      name: "Cap",
      price: 20,
      img: "./assets/shop/hat2.png",
      avatarImg: "./assets/avatar/avatar_hat2.png",
      fullBody: true
    },
    {
      id: "hat-beret",
      name: "Straw Hat",
      price: 20,
      img: "./assets/shop/hat3.png",
      avatarImg: "./assets/avatar/avatar_hat3.png",
      fullBody: true
    }
  ],
  face: [
    { id: "face-cool", 
      name: "Cool Face", 
      price: 0, 
      img: "./assets/shop/face_cool.png" 
    },
    { id: "face-cute", 
      name: "Cute Face", 
      price: 0, 
      img: "./assets/shop/face_cute.png" 
    },
    { id: "face-mask", 
      name: "Mask",      
      price: 0, 
      img: "./assets/shop/face_mask.png" 
    }
  ],
  other: [
    { 
      id: "other-none",
      name: "ไม่ใส่ของ",
      price: 0,
      img: "./assets/avatar/empty.png",
      hideInShop: true
    },
    { id: "other-water", 
      name: "Water Gun", 
      price: 30, 
      img: "./assets/shop/gun.png",
      avatarImg: "./assets/avatar/avatar_gun.png",
      fullBody: true 
    },
    { id: "other-bag",   
      name: "Bag",       
      price: 30, 
      img: "./assets/shop/burger.png",   
      avatarImg: "./assets/avatar/avatar_burger.png",
      fullBody: true
    },
    { id: "other-flag",  
      name: "Flag",      
      price: 30, 
      img: "./assets/shop/joygame.png",
      avatarImg: "./assets/avatar/avatar_burger.png",
      fullBody: true  
    }
  ],
  coupon: [
    { id: "coupon-10", name: "Coupon 10%", price: 0, img: "./assets/shop/coupon_10.png" },
    { id: "coupon-20", name: "Coupon 20%", price: 0, img: "./assets/shop/coupon_20.png" },
    { id: "coupon-30", name: "Coupon 30%", price: 0, img: "./assets/shop/coupon_30.png" }
  ]
};

/* ---------- Avatar Equip & Render ---------- */

const EQUIPPED_KEY = "avatar_equipped";

let equipped = {
  skin: "skin-base",
  hat: null,
  face: null,
  other: null
};

// index: id -> { slot, img, fullBody? }
const AVATAR_ASSET_INDEX = (() => {
  const index = {};
  Object.entries(SHOP_ITEMS).forEach(([cat, items]) => {
    items.forEach((it) => {
      index[it.id] = {
        slot: cat,
        img: it.avatarImg || it.img,
        fullBody: !!it.fullBody
      };
    });
  });
  return index;
})();

// โหลดของที่ใส่ไว้จาก localStorage
(function loadEquipped() {
  try {
    const saved = JSON.parse(localStorage.getItem(EQUIPPED_KEY) || "null");
    if (saved) {
      equipped.skin  = saved.skin  || "skin-base";
      equipped.hat   = saved.hat   || null;
      equipped.face  = saved.face  || null;
      equipped.other = saved.other || null;
    }
  } catch (e) {
    // ใช้ค่า default
  }
})();

function renderAvatar() {
  const prefixes = ["avatar-main", "avatar-custom"];

  prefixes.forEach((prefix) => {
    const skinImg  = document.getElementById(`${prefix}-skin`);
    const faceImg  = document.getElementById(`${prefix}-face`);
    const hatImg   = document.getElementById(`${prefix}-hat`);
    const otherImg = document.getElementById(`${prefix}-other`);

    const hatAsset = equipped.hat ? AVATAR_ASSET_INDEX[equipped.hat] : null;
    const useHatAsFullBody = hatAsset?.fullBody;

    // ---------- ชั้นตัวพื้นฐาน (skin) ----------
    if (skinImg) {
      let skinAsset = equipped.skin ? AVATAR_ASSET_INDEX[equipped.skin] : null;
      if (useHatAsFullBody) {
        // ถ้าหมวกเป็น full body ให้ใช้รูปหมวกแทนทั้งตัว
        skinAsset = hatAsset;
      }
      skinImg.src = skinAsset?.img || "./assets/avatar/dino.png";
      skinImg.style.display = "block";
    }

    // ---------- ชั้นใบหน้า ----------
    if (faceImg) {
      const faceAsset = equipped.face ? AVATAR_ASSET_INDEX[equipped.face] : null;
      if (faceAsset?.img) {
        faceImg.src = faceAsset.img;
        faceImg.style.display = "block";
      } else {
        // ไม่มีไอเท็มหน้า → ซ่อน layer ไปเลย ไม่ใช้ empty.png
        faceImg.style.display = "none";
      }
    }

    // ---------- ชั้นหมวก ----------
    if (hatImg) {
      if (useHatAsFullBody) {
        // ถ้าหมวกเป็น full body แล้วใช้ที่ skin ไปแล้ว → ซ่อน layer หมวก
        hatImg.style.display = "none";
      } else if (hatAsset?.img) {
        hatImg.src = hatAsset.img;
        hatImg.style.display = "block";
      } else {
        hatImg.style.display = "none";
      }
    }

    // ---------- ชั้นของอื่น ๆ (other) ----------
    if (otherImg) {
      const otherAsset = equipped.other ? AVATAR_ASSET_INDEX[equipped.other] : null;
      if (otherAsset?.img) {
        otherImg.src = otherAsset.img;
        otherImg.style.display = "block";
      } else {
        otherImg.style.display = "none";
      }
    }
  });
}


function saveEquipped() {
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
  renderAvatar();
}

/* Render ไอเท็มแต่งตัวใน Custom Modal */
function renderCustomGrid(cat) {
  const inv = JSON.parse(localStorage.getItem("inventory") || "{}");
  const owned = inv[cat] || [];
  const extraAlwaysOwned = {
    hat: ["hat-none"],
    skin: ["skin-base"]
  };
  const availableIds = new Set([...(extraAlwaysOwned[cat] || []), ...owned]);

  const items = (SHOP_ITEMS[cat] || []).filter(it => availableIds.has(it.id));

  if (!items.length) {
    customGrid.innerHTML = `<div class="custom-empty">ยังไม่มีไอเท็มหมวดนี้</div>`;
    return;
  }

  customGrid.innerHTML = items.map(it => {
    const current = equipped[cat];
    const isSelected = it.id === "hat-none" ? !current : current === it.id;
    return `
      <div class="custom-item ${isSelected ? "equipped" : ""}" data-id="${it.id}">
        <img class="custom-thumb" src="${it.img}" />
        <div class="custom-name">${it.name}</div>
        ${isSelected ? `<div class="custom-tag">ใส่อยู่</div>` : ""}
      </div>
    `;
  }).join("");

  customGrid.querySelectorAll(".custom-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      equipped[cat] = (id === "hat-none") ? null : id;
      saveEquipped();
      renderCustomGrid(cat);
      renderAvatar();
    });
  });
}

customSave?.addEventListener("click", () => {
  showAlert("บันทึกชุดตัวละครเรียบร้อยแล้ว ✨");
  closeCustom();
});

/* ---------- Shopping Modal ---------- */

let currentCat = "skin";
let selectedId = null;

function openShop() {
  setActiveShopTab(currentCat);
  renderShop(currentCat);
  if (!shopModal) return;
  shopModal.classList.add("open");
  shopModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeShop() {
  if (!shopModal) return;
  shopModal.classList.remove("open");
  shopModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  selectedId = null;
}

shopBtn?.addEventListener("click", openShop);
shopBackdrop?.addEventListener("click", closeShop);
shopClose?.addEventListener("click", closeShop);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && shopModal?.classList.contains("open")) closeShop();
});

function setActiveShopTab(cat) {
  if (!shopTabs) return;
  currentCat = cat;
  [...shopTabs.querySelectorAll(".shop-tab")].forEach(btn => {
    const active = btn.dataset.cat === cat;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

shopTabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".shop-tab");
  if (!btn) return;
  setActiveShopTab(btn.dataset.cat);
  renderShop(btn.dataset.cat);
});

function renderShop(cat) {
  if (!shopGrid) return;
  const items = (SHOP_ITEMS[cat] || []).filter(it => !it.hideInShop);

  shopGrid.innerHTML = items.map(item => `
    <div class="shop-item" data-id="${item.id}" tabindex="0" aria-label="${item.name}">
      <img class="shop-thumb" src="${item.shopImg || item.img}" alt="${item.name}" />
      <div class="shop-name">${item.name}</div>
      ${item.price > 0
        ? `<div class="shop-price">${item.price} ฿</div>`
        : `<div class="shop-price">Free</div>`}
    </div>
  `).join("");

  selectedId = null;
  shopGrid.querySelectorAll(".shop-item").forEach(card => {
    const selectCard = () => {
      shopGrid.querySelectorAll(".shop-item").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedId = card.dataset.id;
    };
    card.addEventListener("click", selectCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") selectCard();
    });
  });
}

shopClaim?.addEventListener("click", () => {
  if (!selectedId) {
    showAlert("กรุณาเลือกไอเท็มก่อน");
    return;
  }

  const items = SHOP_ITEMS[currentCat] || [];
  const item = items.find(it => it.id === selectedId);

  if (!item) {
    alert("ไม่พบไอเท็มนี้");
    return;
  }

  const price = item.price || 0;
  const currentCoins = getCoins();

  if (price > 0 && currentCoins < price) {
    showAlert(`เหรียญไม่พอ! ต้องมีอย่างน้อย ${price} เหรียญ`);
    return;
  }

  if (price > 0) {
    setCoins(currentCoins - price);
  }

  const inv = JSON.parse(localStorage.getItem("inventory") || "{}");
  if (!inv[currentCat]) inv[currentCat] = [];
  if (!inv[currentCat].includes(selectedId)) inv[currentCat].push(selectedId);
  localStorage.setItem("inventory", JSON.stringify(inv));

  const asset = AVATAR_ASSET_INDEX[selectedId];
  if (asset && ["skin", "hat", "face", "other"].includes(asset.slot)) {
    equipped[asset.slot] = selectedId;
    saveEquipped();
  }

  if (price > 0) {
    alert(`ซื้อ ${item.name} สำเร็จ! ใช้เหรียญไป ${price} เหรียญ`);
  } else {
    alert(`รับไอเท็ม ${item.name} เรียบร้อย!`);
  }

  closeShop();
});

/* ---------- Daily Rewards: รับเรียงทีละวัน ห้ามข้าม + วันละ 1 ครั้ง ---------- */

// กำหนดชุดรางวัลแต่ละวัน (Day 1–5)
const DAILY_REWARD_STEPS = [
  { day: 1, amount: 5,  cls: "small"  },
  { day: 2, amount: 10, cls: ""       },
  { day: 3, amount: 15, cls: "stack2" },
  { day: 4, amount: 20, cls: "stack3" },
  { day: 5, amount: 25, cls: "stack4" }
];

const DAILY_STATE_KEY = "daily_seq_state";

let dailyState = {
  claimed: Array(DAILY_REWARD_STEPS.length).fill(false),
  lastClaimDate: null
};

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function saveDailyState() {
  localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(dailyState));
}

function loadDailyState() {
  const today = getTodayStr();
  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed &&
          Array.isArray(parsed.claimed) &&
          parsed.claimed.length === DAILY_REWARD_STEPS.length) {
        dailyState.claimed = parsed.claimed.map(Boolean);
        dailyState.lastClaimDate = parsed.lastClaimDate || null;
      }
    }
  } catch (e) {
    dailyState = {
      claimed: Array(DAILY_REWARD_STEPS.length).fill(false),
      lastClaimDate: null
    };
  }

  // ถ้ารับครบทุกวันแล้วและเป็นวันใหม่ ให้รีเซ็ตเป็นรอบใหม่
  const allClaimed = dailyState.claimed.every(v => v);
  if (allClaimed && dailyState.lastClaimDate !== today) {
    dailyState.claimed = Array(DAILY_REWARD_STEPS.length).fill(false);
    dailyState.lastClaimDate = null;
  }

  saveDailyState();
}

function getNextRewardIndex() {
  const idx = dailyState.claimed.findIndex(v => !v);
  return idx === -1 ? DAILY_REWARD_STEPS.length - 1 : idx;
}

function hasClaimedTodaySeq() {
  return dailyState.lastClaimDate === getTodayStr();
}

function renderDailyTiles() {
  if (!dailyGrid) return;

  const todayClaimed = hasClaimedTodaySeq();
  const nextIndex = getNextRewardIndex();
  const allClaimed = dailyState.claimed.every(v => v);

  dailyGrid.innerHTML = DAILY_REWARD_STEPS.map((step, index) => {
    let stateClass = "";
    let line2 = `+${step.amount} เหรียญ`;

    if (dailyState.claimed[index]) {
      stateClass = "claimed";
      line2 = "รับแล้ว";
    } else if (index === nextIndex && !allClaimed) {
      if (todayClaimed) {
        stateClass = "locked today-locked";
        line2 = "รอวันถัดไป";
      } else {
        stateClass = "active";
        line2 = `รับวันนี้ +${step.amount}`;
      }
    } else {
      stateClass = "locked";
    }

    return `
      <button
        type="button"
        class="daily-tile ${stateClass}"
        data-index="${index}"
        aria-label="Day ${step.day} ได้ ${step.amount} เหรียญ"
        disabled
      >
        <div class="daily-inner">
          <span class="reward-coin ${step.cls || ""}"></span>
          <span class="daily-day">Day ${step.day}</span>
          <span class="daily-amount">${line2}</span>
        </div>
      </button>
    `;
  }).join("");

  if (dailyClaimBtn) {
    if (allClaimed && DAILY_REWARD_STEPS.length && dailyState.claimed.every(v => v)) {
      dailyClaimBtn.disabled = true;
      dailyClaimBtn.textContent = "รับครบทุกวันแล้ว";
    } else if (todayClaimed) {
      dailyClaimBtn.disabled = true;
      dailyClaimBtn.textContent = "รับแล้ววันนี้";
    } else {
      const step = DAILY_REWARD_STEPS[nextIndex];
      dailyClaimBtn.disabled = false;
      dailyClaimBtn.textContent = `รับ Day ${step.day} (+${step.amount} เหรียญ)`;
    }
  }
}

function openDaily() {
  loadDailyState();
  renderDailyTiles();

  if (!dailyModal) return;
  dailyModal.classList.add("open");
  dailyModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDaily() {
  if (!dailyModal) return;
  dailyModal.classList.remove("open");
  dailyModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

dailyBtn?.addEventListener("click", openDaily);
dailyBackdrop?.addEventListener("click", closeDaily);
dailyClose?.addEventListener("click", closeDaily);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && dailyModal?.classList.contains("open")) closeDaily();
});

dailyClaimBtn?.addEventListener("click", () => {
  loadDailyState();

  if (hasClaimedTodaySeq()) {
    showAlert("วันนี้คุณรับรางวัลไปแล้ว 😊");
    renderDailyTiles();
    return;
  }

  const nextIndex = getNextRewardIndex();
  const allClaimed = dailyState.claimed.every(v => v);

  if (allClaimed) {
    showAlert("คุณรับครบทุกวันแล้ว 🎉");
    renderDailyTiles();
    return;
  }

  const step = DAILY_REWARD_STEPS[nextIndex];

  // เพิ่มเหรียญตามขั้นตอนปัจจุบัน
  setCoins(getCoins() + step.amount);

  // อัปเดตสถานะ daily
  dailyState.claimed[nextIndex] = true;
  dailyState.lastClaimDate = getTodayStr();
  saveDailyState();

  showAlert(`รับ Day ${step.day}: +${step.amount} เหรียญเรียบร้อย! ✨`);

  renderDailyTiles();
});

/* ---------- Join button / การส่งชื่อไป chatpage ---------- */

document.addEventListener("DOMContentLoaded", () => {
  const savedName   = localStorage.getItem("username");
  const googleName  = localStorage.getItem("googleName");
  const chatName    = localStorage.getItem("chatUsername");
  const userEmail   = localStorage.getItem("userEmail") ||
                      localStorage.getItem("googleEmail");

  if (usernameInput) {
    if (savedName) {
      usernameInput.value = savedName;
    } else if (googleName) {
      usernameInput.placeholder = googleName;
    }
  }

  const displayName = chatName || savedName || googleName || "Guest";
  if (menuNameEl) {
    menuNameEl.textContent = displayName;
  }

  if (menuMailEl) {
    menuMailEl.textContent = userEmail || "naomi@example.com";
  }

  if (joinBtn) {
    joinBtn.addEventListener("click", () => {
      const typedName = usernameInput ? usernameInput.value.trim() : "";
      const finalName = typedName || googleName || "ผู้ใช้ไม่ระบุชื่อ";

      localStorage.setItem("username", typedName || "");
      localStorage.setItem("chatUsername", finalName);

      if (menuNameEl) {
        menuNameEl.textContent = finalName;
      }

      window.location.href = "chatpage.html";
    });
  }

  // แสดง Avatar ตามของที่ใส่ไว้ล่าสุด
  renderAvatar();

  // เผื่อ safe อีกชั้น: อัปเดตจำนวนคนออนไลน์ตอน DOM พร้อม
  updateOnlineCount();
});

// Initialize Firebase (dynamic import so main.js can stay a normal script)
async function initFirebaseNotifications() {
  try {
    // dynamic import firebase modules
    const appMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const dbMod  = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

    firebaseApp = appMod.initializeApp(firebaseConfig);
    firebaseDb  = dbMod.getDatabase(firebaseApp);

    // listen to notifications for this user under /notifications/{userId}
    firebaseNotifRef = dbMod.ref(firebaseDb, `notifications/${myUserId}`);

    console.log(`🔔 Listening to Firebase notifications at: /notifications/${myUserId}`);

    // ✅ LOAD EXISTING NOTIFICATIONS FIRST
    const snapshot = await dbMod.get(firebaseNotifRef);
    if (snapshot.exists()) {
      const existingNotifs = snapshot.val();
      Object.keys(existingNotifs).forEach(key => {
        const data = existingNotifs[key];
        data._key = key;
        data._source = 'notifications';
        
        // ⭐ ตรวจสอบ friend_accepted ที่มีอยู่แล้วตอนโหลด
        if (data.type === 'friend_accepted' && data.status !== 'deleted' && data.addToFriends && data.friendData) {
          const friends = getFriends();
          if (!friends.some(f => f.name === data.friendData.name)) {
            friends.push(data.friendData);
            saveFriends(friends);
            console.log('✅ Auto-added existing friend:', data.friendData.name);
          }
        }
        
        // เพิ่มเฉพาะที่ยังไม่มี
        if (!notifications.some(n => n._key === key)) {
          notifications.push(data);
        }
      });
      
      // เรียงใหม่ตาม createdAt (ล่าสุดก่อน)
      notifications.sort((a, b) => {
        const aTime = a.createdAt || 0;
        const bTime = b.createdAt || 0;
        return bTime - aTime;
      });
      
      renderNotifications();
      updateNotifBadge();
      renderUsers();          // ⭐ อัปเดต UI
      updateOnlineCount();   // ⭐ อัปเดตจำนวน
      console.log(`✅ Loaded ${Object.keys(existingNotifs).length} existing notifications`);
    }

    // on new notification in per-user path
    dbMod.onChildAdded(firebaseNotifRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      data._key = snap.key;
      data._source = 'notifications';

      // ignore duplicates
      if (!notifications.some(n => n._key === data._key)) {
        console.log(`🆕 New notification received:`, data);
        
        // push to top
        notifications.unshift(data);
        renderNotifications();
        updateNotifBadge();
        
        // บันทึกลง localStorage
        saveNotifications();
      }
    });

    // on changed (status changes) update local copy
    dbMod.onChildChanged(firebaseNotifRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      data._key = snap.key;
      const idx = notifications.findIndex(n => n._key === data._key);
      if (idx !== -1) {
        console.log(`📝 Notification updated:`, data);
        notifications[idx] = data;
        renderNotifications();
        updateNotifBadge();
        saveNotifications();
      }
    });

    // on removed
    dbMod.onChildRemoved(firebaseNotifRef, (snap) => {
      const key = snap.key;
      console.log(`🗑️ Notification removed:`, key);
      notifications = notifications.filter(n => n._key !== key);
      renderNotifications();
      updateNotifBadge();
      saveNotifications();
    });

  } catch (err) {
    console.warn('Firebase notifications not initialized:', err);
  }
}

// start Firebase notifications in background
initFirebaseNotifications();

// ====== ฟังก์ชันช่วยเหลือสำหรับจัดการเพื่อน ======
function getFriends() {
  try {
    return JSON.parse(localStorage.getItem("friends") || "[]");
  } catch {
    return [];
  }
}

function saveFriends(friendsList) {
  localStorage.setItem("friends", JSON.stringify(friendsList));
}

// ====== ส่วนที่ต้องแทนที่ใน main.js ======
// ใส่ส่วนนี้แทนฟังก์ชัน renderNotifications() เดิม

function renderNotifications() {
  if (!notifListEl) return;
  notifListEl.innerHTML = "";

  if (!notifications || notifications.length === 0) {
    const empty = document.createElement("div");
    empty.className = "notif-empty";
    empty.textContent = "ไม่มีการแจ้งเตือน";
    notifListEl.appendChild(empty);
    return;
  }

  notifications.forEach(n => {
    const el = document.createElement("div");
    const isUnread = n.unread || (n.status && n.status === 'pending');
    el.className = `notif-item ${isUnread ? 'unread' : ''}`.trim();

    const isFriendRequest = n.type === 'friend_request';
    const isRoomInvite = n.type === 'room_invite';
    const isPending = n.status === 'pending';
    
    let actionsHtml = '';
    
    // Friend Request Actions
    if (isFriendRequest && isPending) {
      actionsHtml = `
        <div class="notif-actions" style="margin-top: 8px; display: flex; gap: 8px;">
          <button class="notif-action-btn accept" data-notif-key="${n._key}" data-from-id="${n.fromId}" data-from-name="${n.fromName}" 
                  style="flex: 1; padding: 6px 12px; border-radius: 8px; border: 2px solid #27ae60; background: #27ae60; color: white; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
            ✓ ตอบรับ
          </button>
          <button class="notif-action-btn decline" data-notif-key="${n._key}"
                  style="flex: 1; padding: 6px 12px; border-radius: 8px; border: 2px solid #e74c3c; background: #e74c3c; color: white; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
            ✕ ปฏิเสธ
          </button>
        </div>
      `;
    }
    
    // Room Invite Actions
    if (isRoomInvite && n.status === 'unread') {
      actionsHtml = `
        <div class="notif-actions" style="margin-top: 8px; display: flex; gap: 8px;">
          <button class="notif-action-btn join-room" data-notif-key="${n._key}" data-room-id="${n.roomId}" data-room-name="${n.roomName}"
                  style="flex: 1; padding: 6px 12px; border-radius: 8px; border: 2px solid #3498db; background: #3498db; color: white; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
            🚪 เข้าร่วมห้อง
          </button>
          <button class="notif-action-btn dismiss" data-notif-key="${n._key}"
                  style="flex: 1; padding: 6px 12px; border-radius: 8px; border: 2px solid #95a5a6; background: #95a5a6; color: white; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
            ✕ ปิด
          </button>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="notif-avatar" aria-hidden="true"></div>
      <div class="notif-body">
        <div class="notif-title">${escapeHtml(n.title || n.type || 'Notification')}</div>
        <div class="notif-text">${escapeHtml(n.text || n.message || (n.fromName ? `${n.fromName} ต้องการเป็นเพื่อนกับคุณ` : ''))}</div>
        ${actionsHtml}
      </div>
    `;

    // Friend Request Handlers
    const acceptBtn = el.querySelector('.notif-action-btn.accept');
    const declineBtn = el.querySelector('.notif-action-btn.decline');
    
    // Room Invite Handlers
    const joinRoomBtn = el.querySelector('.notif-action-btn.join-room');
    const dismissBtn = el.querySelector('.notif-action-btn.dismiss');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const notifKey = acceptBtn.dataset.notifKey;
        const fromId = acceptBtn.dataset.fromId;
        const fromName = acceptBtn.dataset.fromName;
        
        acceptBtn.disabled = true;
        acceptBtn.textContent = '⏳ กำลังประมวลผล...';
        
        try {
          const myFriends = getFriends();
          if (!myFriends.some(f => f.name === fromName)) {
            myFriends.push({ name: fromName, status: 'online' });
            saveFriends(myFriends);
            console.log('✅ Added friend on accepter side:', fromName);
          }
          
          if (firebaseDb && fromId) {
            const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            
            const responseNotifRef = dbMod.ref(firebaseDb, `notifications/${fromId}`);
            
            const responsePayload = {
              type: 'friend_accepted',
              fromId: myUserId,
              fromName: myName,
              toId: fromId,
              status: 'unread',
              message: `${myName} ได้ตอบรับคำขอเป็นเพื่อนของคุณแล้ว!`,
              createdAt: Date.now(),
              unread: true,
              addToFriends: true,
              friendData: {
                name: myName,
                status: 'online'
              }
            };
            
            await dbMod.push(responseNotifRef, responsePayload);
            console.log('✅ Sent friend_accepted notification to:', fromId);
          
            if (notifKey) {
              const updateRef = dbMod.ref(firebaseDb, `notifications/${myUserId}/${notifKey}`);
              await dbMod.update(updateRef, { 
                status: 'accepted',
                unread: false 
              });
            }
          }
          
          const idx = notifications.findIndex(notif => notif._key === notifKey);
          if (idx !== -1) {
            notifications[idx].status = 'accepted';
            notifications[idx].unread = false;
          }
          
          saveNotifications();
          renderNotifications();
          updateNotifBadge();
          renderUsers();
          updateOnlineCount();
          
          showAlert(`✓ คุณและ ${fromName} เป็นเพื่อนกันแล้ว!`);
        } catch (err) {
          console.error('Error accepting friend request:', err);
          acceptBtn.disabled = false;
          acceptBtn.textContent = '✓ ตอบรับ';
          showAlert('เกิดข้อผิดพลาด: ' + err.message);
        }
      });
    }

    // Room Invite: Join Room Button
    if (joinRoomBtn) {
      joinRoomBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const notifKey = joinRoomBtn.dataset.notifKey;
        const roomId = joinRoomBtn.dataset.roomId;
        const roomName = joinRoomBtn.dataset.roomName;
        
        console.log('🚪 Joining room:', { roomId, roomName });
        
        try {
          // ✅ ดึงข้อมูลห้องจาก Firebase ก่อน
          const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
          const roomSnapshot = await dbMod.get(dbMod.ref(firebaseDb, `rooms/${roomId}`));
          
          if (!roomSnapshot.exists()) {
            showAlert('❌ ไม่พบห้องนี้แล้ว อาจถูกลบไปแล้ว');
            return;
          }
          
          const roomData = roomSnapshot.val();
          
          // ตรวจสอบว่าห้องเต็มหรือไม่
          if (roomData.currentPlayers >= roomData.limit) {
            showAlert('❌ ห้องเต็มแล้ว');
            return;
          }
          
          // ✅ เพิ่มจำนวนผู้เล่นในห้อง
          await dbMod.update(dbMod.ref(firebaseDb, `rooms/${roomId}`), {
            currentPlayers: roomData.currentPlayers + 1
          });
          
          // ✅ บันทึกข้อมูลห้องพร้อม flag playerJoined
          localStorage.setItem('currentRoomId', roomId);
          localStorage.setItem('playerJoined', 'true');
          localStorage.setItem('currentRoom', JSON.stringify({ 
            id: roomId, 
            name: roomData.name,
            owner: roomData.owner,
            ownerName: roomData.ownerName
          }));
          
          // อัปเดตสถานะ notification
          if (notifKey) {
            await dbMod.update(dbMod.ref(firebaseDb, `notifications/${myUserId}/${notifKey}`), { 
              status: 'accepted',
              unread: false 
            });
          }
          
          console.log('✅ Room data saved, redirecting to test.html...');
          
          // ✅ เด้งเข้าห้องแชทจริง (test.html) ทันที
          window.location.href = 'test.html';
        } catch (err) {
          console.error('Error joining room:', err);
          showAlert('เกิดข้อผิดพลาดในการเข้าห้อง: ' + err.message);
        }
      });
    }

    // Room Invite: Dismiss Button
    if (dismissBtn) {
      dismissBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const notifKey = dismissBtn.dataset.notifKey;
        
        try {
          if (firebaseDb && notifKey) {
            const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            await dbMod.update(dbMod.ref(firebaseDb, `notifications/${myUserId}/${notifKey}`), { 
              status: 'dismissed',
              unread: false 
            });
          }
          
          const idx = notifications.findIndex(notif => notif._key === notifKey);
          if (idx !== -1) {
            notifications[idx].status = 'dismissed';
            notifications[idx].unread = false;
          }
          
          saveNotifications();
          renderNotifications();
          updateNotifBadge();
          
          showAlert('ปิดการแจ้งเตือนแล้ว');
        } catch (err) {
          console.error('Error dismissing notification:', err);
          showAlert('เกิดข้อผิดพลาด');
        }
      });
    }

    // ไม่แสดง popup สำหรับ Welcome
    if (!isFriendRequest || !isPending) {
      el.addEventListener("click", async () => {
        if (n.title === "Welcome!") return;
        
        if (n._key && firebaseDb) {
          try {
            const dbMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            await dbMod.update(dbMod.ref(firebaseDb, `notifications/${myUserId}/${n._key}`), { status: 'read', unread: false });
          } catch(err) { 
            console.log('Could not mark as read:', err);
          }
        }

        n.unread = false;
        saveNotifications();
        renderNotifications();
        updateNotifBadge();
      });
    }

    notifListEl.appendChild(el);
  });
}

// ====== ส่วนสำหรับจัดการ friend_accepted notification ======
// เพิ่มส่วนนี้ใน initFirebaseNotifications()
// ใส่หลังจาก onChildAdded listener

async function initFirebaseNotifications() {
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const dbMod  = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');

    firebaseApp = appMod.initializeApp(firebaseConfig);
    firebaseDb  = dbMod.getDatabase(firebaseApp);

    firebaseNotifRef = dbMod.ref(firebaseDb, `notifications/${myUserId}`);

    console.log(`🔔 Listening to Firebase notifications at: /notifications/${myUserId}`);

    // โหลด notifications ที่มีอยู่แล้วก่อน
    const snapshot = await dbMod.get(firebaseNotifRef);
    if (snapshot.exists()) {
      const existingNotifs = snapshot.val();
      Object.keys(existingNotifs).forEach(key => {
        const data = existingNotifs[key];
        data._key = key;
        data._source = 'notifications';
        
        if (!notifications.some(n => n._key === key)) {
          notifications.push(data);
        }
      });
      
      notifications.sort((a, b) => {
        const aTime = a.createdAt || 0;
        const bTime = b.createdAt || 0;
        return bTime - aTime;
      });
      
      renderNotifications();
      updateNotifBadge();
      console.log(`✅ Loaded ${Object.keys(existingNotifs).length} existing notifications`);
    }

    // Listen for new notifications
    dbMod.onChildAdded(firebaseNotifRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      data._key = snap.key;
      data._source = 'notifications';

      if (!notifications.some(n => n._key === data._key)) {
        console.log(`🆕 New notification received:`, data);
        
      // ⭐ ถ้าเป็น friend_accepted และมี addToFriends flag -> เพิ่มเพื่อนอัตโนมัติ
        if (data.type === 'friend_accepted' && data.status !== 'deleted' && data.addToFriends && data.friendData) {
          const friends = getFriends();
          if (!friends.some(f => f.name === data.friendData.name)) {
            friends.push(data.friendData);
            saveFriends(friends);
            renderUsers();
            updateOnlineCount();
            console.log('✅ Auto-added friend from accepted request:', data.friendData.name);
          }
        }
        
        notifications.unshift(data);
        renderNotifications();
        updateNotifBadge();
        saveNotifications();
      }
    });

    // on changed
    dbMod.onChildChanged(firebaseNotifRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      data._key = snap.key;
      const idx = notifications.findIndex(n => n._key === data._key);
      if (idx !== -1) {
        console.log(`🔄 Notification updated:`, data);
        notifications[idx] = data;
        renderNotifications();
        updateNotifBadge();
        saveNotifications();
      }
    });

    // on removed
    dbMod.onChildRemoved(firebaseNotifRef, (snap) => {
      const key = snap.key;
      console.log(`🗑️ Notification removed:`, key);
      notifications = notifications.filter(n => n._key !== key);
      renderNotifications();
      updateNotifBadge();
      saveNotifications();
    });

  } catch (err) {
    console.warn('Firebase notifications not initialized:', err);
  }
}

// เพิ่มฟังก์ชันช่วยเหลือ
function getFriends() {
  try {
    return JSON.parse(localStorage.getItem("friends") || "[]");
  } catch {
    return [];
  }
}

function saveFriends(friends) {
  localStorage.setItem("friends", JSON.stringify(friends));
}