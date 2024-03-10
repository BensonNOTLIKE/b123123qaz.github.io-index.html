var firebaseConfig = {
  apiKey: "AIzaSyBR_k_Q3LVi0r_UazKIgA_IRtOYVzsdJ7M",
  authDomain: "fir-aced8.firebaseapp.com",
  databaseURL: "https://fir-aced8-default-rtdb.firebaseio.com",
  projectId: "fir-aced8",
  storageBucket: "fir-aced8.appspot.com",
  messagingSenderId: "512212055156",
  appId: "1:512212055156:web:12cb3f3b1295422eeb0d21",
  measurementId: "G-L4DPL1YKM1"
};

// 初始化 Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Firebase 數據庫引用

const loadRef = database.ref('upload');
const petRef = database.ref('pet');

// DOM 元素
const temE = document.getElementById("tem");
const fdE = document.getElementById("fd");
const humE = document.getElementById("hum");
const htrE = document.getElementById("htr");
const oxE = document.getElementById("ox");
const runE = document.getElementById("run");

// 即時數據抓取
loadRef.on('value', function(snapshot) {
  const data = snapshot.val();
  temE.innerText = data['realtime']['tem-r'] + "°C";
  fdE.innerText = data['realtime']['food-r'] + "%";
  humE.innerText = data['realtime']['hum-r'] + "%";
});

petRef.on('value', function(snapshot) {
  const data = snapshot.val();
  htrE.innerText = data['heartbeat'];  // 更新血氧
  oxE.innerText = data['bloodO2'];     // 更新心跳
  runE.innerText = data['walk'];
});

// 函数用于更新特定元素的值和数据库中的值
function updateCounter(elementId, databaseRefPath, value) {
  const element = document.getElementById(elementId);

  // 更新页面显示
  element.innerText = value;

  // 将新值上传到 Firebase
  database.ref(databaseRefPath).set(value);
}

// 函数用于从 Firebase 加载数据并更新元素显示
function updateDisplay(elementId, databaseRefPath) {
  const element = document.getElementById(elementId);
  const ref = database.ref(databaseRefPath);

  ref.on('value', (snapshot) => {
    const data = snapshot.val();
    element.innerText = data || 0;
  });
}


// 更新 touchfood 的值，並上傳到 Firebase
function increaseTouchfoodCount() {
  updateCounter('pthfc', 'writein/touchfood-w', parseInt(document.getElementById('pthfc').innerText) + 1);
}

// 减少 touchfood 的值，並上傳到 Firebase
function decreaseTouchfoodCount() {
  const currentCount = parseInt(document.getElementById('pthfc').innerText);
  if (currentCount > 0) {
    updateCounter('pthfc', 'writein/touchfood-w', currentCount - 1);
  } else {
    // 如果当前计数已经为0，则不执行减少操作
    console.log("Touchfood count already at 0. Cannot decrease further.");
  }
}
// 将值1上传到 Firebase 的 writein/realtimefeed 路径
function feeding() {
  // 直接将数据上传到 Firebase 的 writein/realtimefeed 路径
  database.ref('writein/realtimefeed').set(1);
}
// 从 Firebase 加载数据并更新 touchfood 的显示
updateDisplay('pthfc', 'writein/touchfood-w');

  // 監聽值的變化並更新到畫面
  var feededRef = database.ref('upload/realtime/feed-count');
  feededRef.on('value', function(snapshot) {
    var feededValue = snapshot.val();
    document.getElementById('feeded').innerText = feededValue;
  }, function(error) {
    console.error("Error reading value: ", error);
  });

  function handleInputEventAndFirebaseListener(inputId, firebasePath) {
    const inputElement = document.getElementById(inputId);
    
    // 添加事件處理程序
    inputElement.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const value = parseFloat(event.target.value); // 將輸入值轉換為浮點數
            firebase.database().ref(firebasePath).set(value)
                .then(() => {
                    console.log(`Value ${value} written to Firebase for ${firebasePath}`);
                })
                .catch((error) => {
                    console.error("Error writing to Firebase: ", error);
                });
        }
    });
    
    // 添加Firebase值的監聽器
    firebase.database().ref(firebasePath).on('value', (snapshot) => {
        const value = snapshot.val();
        inputElement.value = value || ''; // 更新輸入框的值，如果值不存在則清空輸入框
    });
  }
  
  // 使用函數處理各個輸入框的事件並監聽Firebase中的值
  handleInputEventAndFirebaseListener('inputValue4', 'writein/time-w/lunch-w-ti'); // 中餐
  handleInputEventAndFirebaseListener('inputValue5', 'writein/time-w/dinner-w-ti'); // 晚餐
  handleInputEventAndFirebaseListener('inputValue3', 'writein/time-w/breakfast-w-ti'); // 午餐
  
// 註冊使用者
function registerUser() {
  const usernameR = document.getElementById("registerUsername").value;
  const passwordR = document.getElementById("registerPassword").value;

  // 使用Firebase資料庫引用
  const writeinRef = database.ref("User/user");

  // 將使用者資料推送到資料庫，使用帳號作為節點名稱
  const userData = {};
  userData['psw'] = passwordR;

  // 使用帳號作為節點名稱
  writeinRef.child(usernameR).set(userData);

  return false; // 防止表單提交
}
function loginUser() {
  const usernameL = document.getElementById("loginUsername").value;
  const passwordL = document.getElementById("loginPassword").value;

  // 使用Firebase資料庫引用
  const readRef = database.ref("User/user");

  // 使用帳號從資料庫中讀取資料
  readRef.child(usernameL).once("value", function(snapshot) {
      const userData = snapshot.val();

      if (userData && userData.psw === passwordL) {
          // 登入成功
          alert("登入成功！");
          switchpage2();
      } else {
          // 登入失敗
          alert("帳號或密碼錯誤，請重新輸入。");
      }
  });

  return false; // 防止表單提交
}
//-------------------------------------------------------------------

// 溫度過高提示
const myModal = document.getElementById("myModal");
let canOpenModal = true;

function checkAndOpenModal(count, temperature) {
    if (count === parseInt(temperature) && canOpenModal) {
        openModal();
        canOpenModal = false;
    } else {
        canOpenModal = true;
    }
}


setInterval(function () {
    var count = parseInt(countElement.innerHTML);
    var temperature = document.getElementById("tem").innerHTML;

    checkAndOpenModal(count, temperature);
}, 1000);
//設定提示溫度跟調定
function openModal() {
  myModal.style.display = "block";
  console.log("Modal opened!");
}

function closeModal() {
  myModal.style.display = "none";
}
//------
var countElement = document.getElementById("count");
function increase() {
  var count = parseInt(countElement.innerHTML);
  count++;
  countElement.innerHTML = count + "°C";
}
function decrease() {
  var count = parseInt(countElement.innerHTML);
  if (count > 0) {
    count--;
    countElement.innerHTML = count + "°C";
  }
}

//-------------------------------------------------------------------
//濕度過高提示
const myModal2 = document.getElementById("myModal2");
let canOpenModal2 = true;

setInterval(function () {
  const humidity = parseInt(document.getElementById("hum").innerText);
  if (humidity >= 90 && canOpenModal2) {
    openModal2();
    canOpenModal2 = false;
  } else {
    canOpenModal2 = true;
  }
}, 1000);

function openModal2() {
  myModal2.style.display = "block";
  console.log("Modal opened for high humidity!");
}

function closeModal2() {
  myModal2.style.display = "none";
}

//-------------------------------------------------------------------

//查詢
const dropdown = document.getElementById("dropdown");
const timeDropdown = document.getElementById("timeDropdown");
const selectedResult = document.getElementById("selectedResult");

// 監聽下拉式選單的變更事件
dropdown.addEventListener("change", function () {
  // 獲取所選擇的日期
  const selectedDate = dropdown.value;

  // 清空第二個下拉菜單的選項
  timeDropdown.innerHTML = "";

  // 查詢該日期下的所有時間
  const timeRef = database.ref('upload/history/' + selectedDate);
  timeRef.once('value')
    .then(function (snapshot) {
      // 獲取該日期下的所有時間
      const times = Object.keys(snapshot.val());

      // 遍歷所有時間，將其添加到第二個下拉菜單中
      times.forEach(time => {
        const option = document.createElement("option");
        option.value = time;
        option.text = time;
        timeDropdown.add(option);
      });
    });
});

// 監聽第二個下拉菜單的變更事件
timeDropdown.addEventListener('change', function () {
  // 獲取所選的具體時間
  const selectedTime = timeDropdown.value;

  // 查詢該日期和時間下的詳細信息
  const detailRef = database.ref('upload/history/' + dropdown.value + '/' + selectedTime);
  console.log('Selected Date:', dropdown.value);
  console.log('Selected Time:', selectedTime);
  console.log('Detail Reference:', detailRef.toString()); 
  detailRef.once('value')
    .then(function (snapshot) {
      // 檢查數據是否存在
      if (snapshot.exists()) {
        const detailData = snapshot.val();
        // 使用檢索到的數據更新結果區域
        selectedResult.innerHTML = `日期：${dropdown.value}，時間：${selectedTime}，食物剩餘量：${detailData.food_distance}%，濕度：${detailData.humidity}%，溫度：${detailData.temperature}°C`;
      } else {
        // 處理數據不存在的情況
        selectedResult.innerHTML = '所選日期和時間未找到數據。';
      }
    })
    .catch(function (error) {
      console.error('獲取數據時出錯：', error);
    });
});

// 取得所有日期的所有選項並更新下拉式選單
const historyRef = database.ref('upload/history');
historyRef.once('value')
  .then(function (snapshot) {
    const dropdown = document.getElementById("dropdown");

    // 使用 Set 來存儲不同的日期
    const uniqueDates = new Set();

    // 遍歷所有歷史資料的子節點，並將日期添加到 Set 中
    snapshot.forEach(function (childSnapshot) {
      const date = childSnapshot.key; // 子節點的鍵即為日期
      uniqueDates.add(date);
    });

    // 遍歷 Set 中的不同日期，並添加到下拉式選單中
    uniqueDates.forEach(date => {
      const option = document.createElement("option");
      option.value = date;
      option.text = date;
      dropdown.add(option);
    });
  })
  .catch(function (error) {
    console.error('獲取歷史日期時出錯：', error);
  });

// 登入頁面
function showLoginPage() {
  document.getElementById("page1").style.display = "none";
  document.getElementById("userlogin").style.display = "block";
}
// 註冊頁
function showRegisterPage() {
  document.getElementById("page1").style.display = "none";
  document.getElementById("userregister").style.display = "block";
}
function switchpage1() {
  document.getElementById("page1").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
}
function switchpage2() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
}
function switchfdsetp() {
  document.getElementById("fdsetp").style.display = "block";
  document.getElementById("page2").style.display = "none";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
}
function switchtmsetp() {
  document.getElementById("tmsetp").style.display = "block";
  document.getElementById("page2").style.display = "none";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
}
function back() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("fdsetp").style.display = "none";
}
