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