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
const onlineCountEl = document.querySelector(".online-count");


const modal    = document.getElementById("loginModal");
const openBtn  = document.getElementById("openLogin");
const closeBtn = document.getElementById("closeLogin");
const backdrop = document.getElementById("loginBackdrop");
const joinBtn  = document.getElementById("joinBtn");
const fbBtn    = document.getElementById("fbBtn");

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

// ----- ปุ่มกดทั่วไป (เดโม) -----
document.getElementById("costomBtn").onclick = () => alert("Costom click");
document.getElementById("shopBtn").onclick   = () => alert("Shop click");
document.getElementById("dailyBtn").onclick  = () => alert("Daily click");

// พิมพ์ชื่อแล้วกด Enter
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const name = usernameInput.value.trim();
    if (name) alert("สวัสดี " + name + "!");
  }
});

// ----- Modal open/close -----
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

// ----- Join ปกติ (พิมพ์ชื่อเอง) -----
joinBtn.addEventListener("click", () => {
  const nameInput = usernameInput.value.trim();
  if (!nameInput) {
    alert("กรุณาใส่ชื่อก่อนเข้าสู่ระบบ");
    return;
  }
  localStorage.setItem("username", nameInput);
  localStorage.setItem("chatUsername", nameInput);
  window.location.href = "main.html";
});

// ================= Google Identity Services =================
const GOOGLE_CLIENT_ID =
  "486200366023-g5gsb7jr5k85npcfjpddg44klp56rngj.apps.googleusercontent.com";
// ↑ ใช้ Client ID ตัวนี้ตัวเดียว (จากหน้า Credentials ของคุณ)

/** callback จาก Google Identity Services */
window.handleCredentialResponse = function (response) {
  try {
    const idToken = response.credential;              // JWT
    const payload = JSON.parse(atob(idToken.split(".")[1] || ""));

    const name    = payload.name    || "ผู้ใช้ไม่ระบุชื่อ";
    const email   = payload.email   || "";
    const picture = payload.picture || "";

    // เก็บไว้ใช้ใน main.html / chat
    localStorage.setItem("googleName",  name);
    localStorage.setItem("googleEmail", email);
    localStorage.setItem("chatUsername", name);
    if (picture) {
      localStorage.setItem("profileAvatar", picture);
    }

    alert("สวัสดี " + name + "!");

    closeModal();
    window.location.href = "main.html";
  } catch (err) {
    console.error(err);
    alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
  }
};

// init GIS และ render ปุ่ม
window.addEventListener("DOMContentLoaded", () => {
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      ux_mode: "popup"
    });

    const mount = document.getElementById("googleBtn");
    if (mount) {
      google.accounts.id.renderButton(mount, {
        type: "standard",
        size: "large",
        theme: "outline",
        shape: "pill",
        logo_alignment: "left",
        text: "signin_with"
      });
    }
  } else {
    console.warn("Google Identity Services script not loaded.");
  }
});

// ----- Facebook button (เดโม UI) -----
fbBtn.addEventListener("click", () => {
  alert("Facebook login clicked (demo)");
  // TODO: ต่อ Facebook SDK จริงในอนาคต
  const nameInput = usernameInput.value.trim() || "ผู้ใช้ไม่ระบุชื่อ";
  localStorage.setItem("username", nameInput);
  localStorage.setItem("chatUsername", nameInput);
  closeModal();
  window.location.href = "main.html";
});
