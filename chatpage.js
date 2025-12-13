// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, remove, get, update, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
 
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVnoP0I5eMuPLWfCZTagmuVKZgOFM-S6o",
  authDomain: "anonymous-talk-chat-67d1a.firebaseapp.com",
  databaseURL: "https://anonymous-talk-chat-67d1a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anonymous-talk-chat-67d1a",
  storageBucket: "anonymous-talk-chat-67d1a.firebasestorage.app",
  messagingSenderId: "1007242493297",
  appId: "1:1007242493297:web:1e0589e885c3cb80c40ad0"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
 

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

// DOM Elements
const createBtn   = document.getElementById('create-room-btn');
const container   = document.getElementById('room-container');
const modal       = document.getElementById('room-modal');
const confirmBtn  = document.getElementById('confirm-create');
const cancelBtn   = document.getElementById('cancel-create');
 
// ✅ element ใหม่สำหรับ password
const roomTypeSelect   = document.getElementById('room-type');
const passwordWrapper  = document.getElementById('password-wrapper');
const roomPasswordInput = document.getElementById('room-password');
 
// Alert popup
const alertModal   = document.getElementById('alert-modal');
const alertMessage = document.getElementById('alert-message');
const alertClose   = document.getElementById('alert-close');

// Settings (โปรไฟล์)
const settingsModal         = document.getElementById("settingsModal");
const settingsBackdrop      = document.getElementById("settingsBackdrop");
const settingsClose         = document.getElementById("settingsClose");
const settingsAvatarPreview = document.getElementById("settingsAvatarPreview");
const settingsAvatarUpload  = document.getElementById("settingsAvatarUpload");
const settingsAvatarReset   = document.getElementById("settingsAvatarReset");
const settingsSave          = document.getElementById("settingsSave");


// Profile
const avatarBtn       = document.getElementById("avatarBtn");
const profileMenu     = document.getElementById("profileMenu");
const logoutBtn       = document.getElementById("logoutBtn");
const menuProfileBtn  = document.getElementById("menuProfile"); // ⭐ ใช้ปุ่ม My Profile แทน
const menuSettingsBtn = document.getElementById("menuSettings"); // จะยังอยู่แต่ไม่ใช้เปิดรูป
const menuNameEl      = document.getElementById("menuName");
const menuMailEl      = document.getElementById("menuMail");


function showAlert(message, type = 'info') {
  alertMessage.textContent = message;
  alertModal.classList.add(type);
  alertModal.style.display = 'flex';
}
 
alertClose.addEventListener('click', () => {
  alertModal.style.display = 'none';
  alertModal.classList.remove('info', 'success', 'error', 'warning');
});
 
alertModal.addEventListener('click', (e) => {
  if (e.target === alertModal) {
    alertModal.style.display = 'none';
    alertModal.classList.remove('info', 'success', 'error', 'warning');
  }
});
 
// ตรวจสอบว่าได้ล็อกอินแล้วหรือไม่
const username = localStorage.getItem("chatUsername");
if (!username) {
  alert("กรุณาใส่ชื่อในหน้า Main ก่อนเข้าสู่ระบบ");
  window.location.href = "index.html";
}
 
// สร้าง userId แบบ unique
const userId = localStorage.getItem("userId") || (() => {
  const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("userId", id);
  return id;
})();
 
// References
const roomsRef     = ref(database, 'rooms');
const userRoomsRef = ref(database, `userRooms/${userId}`);
 
// ตรวจสอบว่าผู้ใช้มีห้องอยู่แล้วหรือไม่
async function checkUserHasRoom() {
  const snapshot = await get(userRoomsRef);
  return snapshot.exists();
}
 
/* ====== toggle แสดง/ซ่อนช่องรหัสผ่านตามประเภทห้อง ====== */
if (roomTypeSelect && passwordWrapper) {
  roomTypeSelect.addEventListener('change', () => {
    if (roomTypeSelect.value === 'private') {
      passwordWrapper.style.display = 'block';
    } else {
      passwordWrapper.style.display = 'none';
      if (roomPasswordInput) roomPasswordInput.value = '';
    }
  });
}
 
// เปิด modal สร้างห้อง
createBtn.addEventListener('click', async () => {
  const hasRoom = await checkUserHasRoom();
  if (hasRoom) {
    showAlert("คุณมีห้องอยู่แล้ว กรุณาลบห้องก่อนสร้างใหม่", "warning");
    return;
  }
  // reset ช่องรหัสผ่านทุกครั้งที่เปิด
  if (roomTypeSelect) roomTypeSelect.value = 'public';
  if (passwordWrapper) passwordWrapper.style.display = 'none';
  if (roomPasswordInput) roomPasswordInput.value = '';
 
  modal.style.display = 'flex';
});
 
// ยกเลิก modal
cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});
 
// ยืนยันสร้างห้อง
confirmBtn.addEventListener('click', async () => {
  const name     = document.getElementById('room-name').value.trim();
  const interest = document.getElementById('room-interest').value.trim();
  const type     = document.getElementById('room-type').value;
  const limit    = parseInt(document.getElementById('room-limit').value, 10);
 
  if (!name || !interest) {
    showAlert("กรุณากรอกชื่อห้องและความชื่นชอบให้ครบถ้วน", "warning");
    return;
  }
 
  // ✅ ถ้าเป็น private ต้องตั้งรหัสผ่าน
  let roomPassword = null;
  if (type === 'private') {
    roomPassword = (roomPasswordInput?.value || '').trim();
    if (!roomPassword) {
      showAlert("กรุณาตั้งรหัสผ่านสำหรับห้อง Private", "warning");
      return;
    }
  }
 
  const hasRoom = await checkUserHasRoom();
  if (hasRoom) {
    showAlert("คุณมีห้องอยู่แล้ว", "warning");
    return;
  }
 
  modal.style.display = 'none';
 
  // สร้าง roomId แบบ unique
  const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
 
  // บันทึกข้อมูลห้องใน Firebase
  const roomData = {
    name: name,
    interest: interest,
    type: type,
    limit: limit,
    currentPlayers: 0,
    owner: userId,
    ownerName: username,
    createdAt: Date.now(),
    // ✅ บันทึกรหัสผ่าน (หรือ null ถ้าไม่ใช้)
    password: roomPassword || null
  };
 
  try {
    await set(ref(database, `rooms/${roomId}`), roomData);
    await set(userRoomsRef, { roomId: roomId, roomName: name });
 
    // ล้างฟอร์ม
    document.getElementById('room-name').value = '';
    document.getElementById('room-interest').value = '';
    document.getElementById('room-type').value = 'public';
    document.getElementById('room-limit').value = '3';
    if (roomPasswordInput) roomPasswordInput.value = '';
    if (passwordWrapper) passwordWrapper.style.display = 'none';
 
    showAlert("✅ สร้างห้องสำเร็จ!", "success");
  } catch (error) {
    console.error("Error creating room:", error);
    showAlert("❌ เกิดข้อผิดพลาดในการสร้างห้อง", "error");
  }
});
 
// แสดงห้องทั้งหมดและติดตาม realtime
function loadRooms() {
  onValue(roomsRef, (snapshot) => {
    container.innerHTML = '';
   
    const rooms = snapshot.val();
   
    if (!rooms || Object.keys(rooms).length === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-room';
      msg.innerHTML = '💤 ยังไม่มีห้องแชทในขณะนี้';
      container.appendChild(msg);
      return;
    }
 
    const validRooms = Object.entries(rooms).filter(([roomId, roomData]) => {
      return roomData &&
             roomData.name &&
             roomData.owner &&
             roomData.limit !== undefined;
    });
 
    if (validRooms.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'no-room';
      msg.innerHTML = '💤 ยังไม่มีห้องแชทในขณะนี้';
      container.appendChild(msg);
      return;
    }
 
    validRooms.forEach(([roomId, roomData]) => {
      const room = createRoomCard(roomId, roomData);
      container.appendChild(room);
    });
  });
}
 
// สร้าง Room Card
function createRoomCard(roomId, roomData) {
  const room = document.createElement('div');
  room.className = 'room-card';
  room.dataset.roomId = roomId;
 
  const isFull  = roomData.currentPlayers >= roomData.limit;
  const isOwner = roomData.owner === userId;
  const isPrivate = roomData.type === 'private';
 
  room.innerHTML = `
    <div class="room-title">
      ${roomData.name}
      ${isPrivate ? ' 🔒' : ''}
    </div>
    <img src="dino.png" alt="Room Image" class="room-img">
    <div class="room-info">ความชื่นชอบ: ${roomData.interest}</div>
    <div class="room-info">เจ้าของห้อง: ${roomData.ownerName}</div>
    <div class="room-info">
      ประเภท: ${roomData.type === 'public' ? 'สาธารณะ' : 'ส่วนตัว 🔒'}
    </div>
    <div class="status ${isFull ? 'red' : 'green'}">
      <span class="player-count">${roomData.currentPlayers}</span>/${roomData.limit}
      ${isFull ? ' (เต็ม)' : ''}
    </div>
    <div class="btn-group">
      <button class="join-btn" ${isFull ? 'disabled' : ''}>เข้าร่วม</button>
      ${isOwner ? '<button class="delete-btn">ลบห้อง</button>' : ''}
    </div>
  `;
 
  // ติดตามการเปลี่ยนแปลงจำนวนผู้เล่นแบบ realtime
  const roomPlayerRef = ref(database, `rooms/${roomId}/currentPlayers`);
  onValue(roomPlayerRef, (snapshot) => {
    const currentPlayers = snapshot.val() || 0;
    const limit = roomData.limit;
    const full  = currentPlayers >= limit;
   
    const playerCountEl = room.querySelector('.player-count');
    const statusEl      = room.querySelector('.status');
    const joinBtn       = room.querySelector('.join-btn');
   
    if (playerCountEl) {
      playerCountEl.textContent = currentPlayers;
    }
   
    if (statusEl) {
      statusEl.className = `status ${full ? 'red' : 'green'}`;
      statusEl.innerHTML = `
        <span class="player-count">${currentPlayers}</span>/${limit}
        ${full ? ' (เต็ม)' : ''}
      `;
    }
   
    if (joinBtn) {
      joinBtn.disabled = full;
    }
  });
 
  // ปุ่มเข้าร่วมห้อง
  const joinBtn = room.querySelector('.join-btn');
  joinBtn.addEventListener('click', async () => {
    const roomSnapshot = await get(ref(database, `rooms/${roomId}`));
    const currentRoom = roomSnapshot.val();
   
    if (!currentRoom) {
      showAlert("❌ ไม่พบห้องนี้", "error");
      return;
    }
   
    // ✅ ถ้าเป็นห้อง Private และเราไม่ใช่เจ้าของ → ให้ใส่รหัสผ่าน
    if (currentRoom.type === 'private' && currentRoom.owner !== userId) {
      const inputPw = await showPasswordDialog();
      if (inputPw === null) {
        // ผู้ใช้กด Cancel
        return;
      }
      const roomPw = currentRoom.password || "";
      if (inputPw !== roomPw) {
        showAlert("❌ รหัสผ่านไม่ถูกต้อง", "error");
        return;
      }
    }
 
    if (currentRoom.currentPlayers >= currentRoom.limit) {
      showAlert("❌ ห้องเต็มแล้ว", "error");
      return;
    }
 
    // เพิ่มจำนวนผู้เล่น
    await update(ref(database, `rooms/${roomId}`), {
      currentPlayers: currentRoom.currentPlayers + 1
    });
   
    // บันทึกข้อมูลสำหรับหน้าแชท
    localStorage.setItem('currentRoomId', roomId);
    localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
    localStorage.setItem('playerJoined', 'true');
   
    window.location.href = 'test.html';
  });
 
  // ปุ่มลบห้อง (เฉพาะเจ้าของ)
  if (isOwner) {
    const deleteBtn = room.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
      const confirmDelete = await showConfirmDialog(
        "ยืนยันการลบห้อง",
        `คุณต้องการลบห้อง "${roomData.name}" หรือไม่?`
      );
     
      if (confirmDelete) {
        try {
          // ✅ ส่งข้อความแจ้งเตือนในแชทก่อนลบห้อง
          await push(ref(database, `rooms/${roomId}/messages`), {
            user: "System",
            text: "⚠️ เจ้าของห้องกำลังลบห้อง ทุกคนจะถูกเตะออกในอีกสักครู่...",
            timestamp: Date.now()
          });
         
          // ✅ ส่งสัญญาณว่าห้องถูกลบ (ก่อนลบห้อง)
          await update(ref(database, `rooms/${roomId}`), {
            deleted: true,
            deletedAt: Date.now()
          });
         
          // รอสักครู่ให้ผู้ใช้คนอื่นได้รับสัญญาณ
          await new Promise(resolve => setTimeout(resolve, 500));
         
          // ลบห้องและข้อมูลทั้งหมด
          await remove(ref(database, `rooms/${roomId}`));
          await remove(userRoomsRef);
         
          showAlert("✅ ลบห้องสำเร็จ!", "success");
        } catch (error) {
          console.error("Error deleting room:", error);
          showAlert("❌ เกิดข้อผิดพลาดในการลบห้อง", "error");
        }
      }
    });
  }
 
  return room;
}
 
// ฟังก์ชัน Confirmation Dialog แบบสวยงาม
function showConfirmDialog(title, message) {
  return new Promise((resolve) => {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.style.display = 'flex';
    confirmModal.innerHTML = `
      <div class="modal-content confirm-modal">
        <h2>${title}</h2>
        <p class="confirm-message">${message}</p>
        <div class="modal-buttons">
          <button class="btn-cancel">ยกเลิก</button>
          <button class="btn-confirm">ยืนยัน</button>
        </div>
      </div>
    `;
   
    document.body.appendChild(confirmModal);
   
    const btnCancel  = confirmModal.querySelector('.btn-cancel');
    const btnConfirm = confirmModal.querySelector('.btn-confirm');
   
    btnCancel.addEventListener('click', () => {
      confirmModal.remove();
      resolve(false);
    });
   
    btnConfirm.addEventListener('click', () => {
      confirmModal.remove();
      resolve(true);
    });
   
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.remove();
        resolve(false);
      }
    });
  });
}
 
// ✅ ฟังก์ชัน Password Dialog แบบสวยงาม
function showPasswordDialog() {
  return new Promise((resolve) => {
    const passwordModal = document.createElement('div');
    passwordModal.className = 'password-modal';
   
    passwordModal.innerHTML = `
      <div class="password-card">
        <div class="password-icon">🔐</div>
        <h2 class="password-title">ห้อง Private </h2>
        <p class="password-subtitle">กรุณาใส่รหัสผ่านเพื่อเข้าร่วมห้อง</p>
       
        <div class="password-input-wrapper">
          <input type="password" id="password-input" placeholder="ใส่รหัสผ่านที่นี่..." autocomplete="off">
          <button class="password-toggle" type="button" title="แสดง/ซ่อนรหัสผ่าน">🙈</button>
        </div>
     
        <div class="password-buttons">
          <button class="password-btn-cancel">ยกเลิก</button>
          <button class="password-btn-submit">เข้าห้อง</button>
        </div>
      </div>
    `;
   
    document.body.appendChild(passwordModal);
   
    const input = passwordModal.querySelector('#password-input');
    const toggleBtn = passwordModal.querySelector('.password-toggle');
    const cancelBtn = passwordModal.querySelector('.password-btn-cancel');
    const submitBtn = passwordModal.querySelector('.password-btn-submit');
    const card = passwordModal.querySelector('.password-card');
   
    // Focus input
    setTimeout(() => input.focus(), 100);
   
    // Toggle show/hide password
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙉';
      } else {
        input.type = 'password';
        toggleBtn.textContent = '🙈';
      }
    });
   
    // Show error
    function showError(message) {
      let errorBox = card.querySelector('.password-error-box');
      if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.className = 'password-error-box';
        card.insertBefore(errorBox, card.querySelector('.password-info-box'));
      }
      errorBox.textContent = message;
      input.classList.add('error');
      card.classList.add('error');
     
      setTimeout(() => {
        card.classList.remove('error');
      }, 300);
    }
   
    // Submit
    function submit() {
      const password = input.value.trim();
      if (!password) {
        showError('❌ กรุณาใส่รหัสผ่าน');
        return;
      }
      passwordModal.remove();
      resolve(password);
    }
   
    // Cancel
    function cancel() {
      passwordModal.remove();
      resolve(null);
    }
   
    submitBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', cancel);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submit();
    });
   
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) cancel();
    });
  });
}
 
// โหลดห้องตอนเริ่มต้น
window.addEventListener('DOMContentLoaded', () => {
  loadRooms();
});

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
// Logout - เก็บเหรียญ / ไอเท็ม / ชุดที่ใส่ไว้ ไม่ให้หาย
logoutBtn?.addEventListener("click", () => {
  // ✅ backup key ที่ต้องการเก็บไว้ตลอด
  const backupKeys = [
    "coins",            // เหรียญ
    "inventory",        // ไอเท็มที่ซื้อแล้ว
    "avatar_equipped",  // ชุดที่ใส่อยู่
    "profileAvatar",    // รูปโปรไฟล์
    "daily_seq_state",  // สถานะ daily reward
    "friends",          // รายชื่อเพื่อน
    "notifications"     // แจ้งเตือน
  ];

  const backup = {};
  backupKeys.forEach((k) => {
    backup[k] = localStorage.getItem(k);
  });

  // ❌ ห้ามใช้ localStorage.clear()
  // ลบเฉพาะข้อมูล user/session ที่เกี่ยวกับการ login
  localStorage.removeItem("user");
  localStorage.removeItem("username");
  localStorage.removeItem("chatUsername");
  sessionStorage.clear();

  // ✅ เอาข้อมูลที่สำคัญใส่กลับเข้าไป
  backupKeys.forEach((k) => {
    if (backup[k] !== null) {
      localStorage.setItem(k, backup[k]);
    }
  });

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