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
const AIRef = database.ref('AI');
const petRef = database.ref('step_counter');

// DOM 元素
const temE = document.getElementById("tem");
const fdE = document.getElementById("fd");
const humE = document.getElementById("hum");
const htrE = document.getElementById("htr");
const oxE = document.getElementById("ox");
const runE = document.getElementById("run");
const AIE = document.getElementById("AIE"); 
const barkE = document.getElementById("bark"); 
const bark2E = document.getElementById("bark2"); 
const sitE = document.getElementById("sit"); 
const sit2E = document.getElementById("sit2"); 
const sleepE = document.getElementById("sleep"); 
const sleep2E = document.getElementById("sleep2"); 
const standE = document.getElementById("stand"); 
const stand2E = document.getElementById("stand2"); 

// 即時數據抓取
loadRef.on('value', function(snapshot) {
  const data = snapshot.val();
  temE.innerText = data['realtime']['tem-r'] + "°C";
  fdE.innerText = data['realtime']['food-r'] + "%";
  humE.innerText = data['realtime']['hum-r'] + "%";
});

petRef.on('value', function(snapshot) {
  const data = snapshot.val();
  runE.innerText = data['steps'];
});

AIRef.on('value', function(snapshot) {
  const data = snapshot.val();
  let actionRealtime = data['detection_results']['action_realtime'];
  barkE.innerText = data['detection_results']['bark']['last accumulated time']+"時間";
  bark2E.innerText = data['detection_results']['bark']['latest accumulated time']+ "時間";
  sitE.innerText = data['detection_results']['sit']['last accumulated time']+"時間";
  sit2E.innerText = data['detection_results']['sit']['latest accumulated time']+ "時間";
  sleepE.innerText = data['detection_results']['sleep']['last accumulated time']+"時間";
  sleep2E.innerText = data['detection_results']['sleep']['latest accumulated time']+ "時間";
  standE.innerText = data['detection_results']['stand']['last accumulated time']+"時間";
  stand2E.innerText = data['detection_results']['stand']['latest accumulated time']+ "時間";
  // 使用正則表達式提取出動作和時間
  const match = actionRealtime.match(/(\w+)_(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);

  if (match) {
    const action = match[1]; // 提取動作
    const time = match[2];   // 提取時間

    // 動作到中文的對應詞彙字典
    const dictionary = {
      "sleep": "睡眠",
      // 其他需要轉換的動作可以在這裡添加
    };

    // 將動作轉換為中文
    actionRealtime = dictionary[action] || action;
    
    // 顯示動作和時間
    AIE.innerText = `${actionRealtime} (${time})`;  // 更新中文結果
  } else {
    AIE.innerText = actionRealtime; 
  }
});

function updateCounter(elementId, databaseRefPath, value) {
  const element = document.getElementById(elementId);
  element.innerText = value;
  database.ref(databaseRefPath).set(value);
}

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
// 如果目前計數已經為0，則不執行減少操作
    console.log("Touchfood count already at 0. Cannot decrease further.");
  }
}
// 將值1上傳到 Firebase 的 writein/realtimefeed 路徑
function feeding() {
  //直接上傳到 Firebase 的 writein/realtimefeed 路徑
  database.ref('writein/realtimefeed').set(1);
}
// 從 Firebase 載入資料並更新 touchfood 的顯示
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

  // 檢查是否輸入了帳號和密碼
  if (!usernameL || !passwordL) {
    alert("請輸入帳號和密碼。");
    return false; // 防止表單提交
  }

  // 使用Firebase資料庫引用
  const readRef = database.ref("User/user");

  // 使用帳號從資料庫中讀取資料
  readRef.child(usernameL).once("value", function(snapshot) {
      const userData = snapshot.val();

      if (userData && userData.psw === passwordL) {
          // 登入成功
          alert("登入成功！");
          switchpage2();

          // 清除帳號和密碼字段的值
          document.getElementById("loginUsername").value = "";
          document.getElementById("loginPassword").value = "";
      } else {
          // 登入失敗
          alert("帳號或密碼錯誤，請重新輸入。");
      }
  });

  return false; // 防止表單提交
}


function getC1FromFirebase() {
    var database = firebase.database();
    database.ref('htmlinput/twarn').once('value').then(function (snapshot) {
        c1 = snapshot.val();
        document.getElementById('c1').innerText = c1 + " °C";
    });
}

function getC2FromFirebase() {
    var database = firebase.database();
    database.ref('htmlinput/hwarn').once('value').then(function (snapshot) {
        c2 = snapshot.val();
        document.getElementById('c2').innerText = c2 + " %";
    });
}

function getC3FromFirebase() {
    var database = firebase.database();
    database.ref('htmlinput/fwarn').once('value').then(function (snapshot) {
        c3 = snapshot.val();
        document.getElementById('c3').innerText = c3 + " %";
    });
}

// 调用函数从 Firebase 获取初始值
getC1FromFirebase();
getC2FromFirebase();
getC3FromFirebase();

// 将 c1 上传到 writein/twarn
function uploadC1ToFirebase() {
    var database = firebase.database();
    database.ref('htmlinput/twarn').set(c1);
}

// 将 c2 上传到 writein/hwarn
function uploadC2ToFirebase() {
    var database = firebase.database();
    database.ref('htmlinput/hwarn').set(c2);
}

// 将 c3 上传到 writein/fwarn
function uploadC3ToFirebase() {
    var database = firebase.database();
    database.ref('htmlinput/fwarn').set(c3);
}

// 在 in1, in2, in3, de1, de2, de3 函数中添加条件检查和提示信息
function in1() {
    c1++;
    document.getElementById('c1').innerText = c1 + " °C";
    uploadC1ToFirebase(); // 寫入 Firebase
    checkWarnings();
}

function de1() {
    c1--;
    document.getElementById('c1').innerText = c1 + " °C";
    uploadC1ToFirebase(); // 寫入 Firebase
    checkWarnings();
}

function in2() {
    c2++;
    document.getElementById('c2').innerText = c2 + " %";
    uploadC2ToFirebase(); // 寫入 Firebase
    checkWarnings();
}

function de2() {
    c2--;
    document.getElementById('c2').innerText = c2 + " %";
    uploadC2ToFirebase(); // 寫入 Firebase
    checkWarnings();
}

function in3() {
    c3++;
    document.getElementById('c3').innerText = c3 + " %";
    uploadC3ToFirebase(); // 寫入 Firebase
    checkWarnings();
}

function de3() {
    c3--;
    document.getElementById('c3').innerText = c3 + " %";
    uploadC3ToFirebase(); // 寫入 Firebase
    checkWarnings();
}
//------
// 获取页面元素
var fdElement = document.getElementById('fd');
var temElement = document.getElementById('tem');
var humElement = document.getElementById('hum');

// 检查警告
function showWarning(warningId) {
  document.getElementById(warningId).style.display = 'block';
}


// 在 checkWarnings 函數中呼叫 showWarning 函數以顯示警告
// 定義計時器的時間間隔（以毫秒為單位，這裡設定為每隔10秒檢查一次）
var intervalTime = 7500; // 10秒

// 定时调用 checkWarnings() 函数
setInterval(checkWarnings, intervalTime);

// 显示警告的函数
function showWarning(warningId) {
    document.getElementById(warningId).style.display = 'block';
}

// 在 checkWarnings 函數中呼叫 showWarning 函數以顯示警告
// 定義計時器的時間間隔（以毫秒為單位）
var delayTime = 1500; 

// 定时调用 checkWarnings() 函数
setInterval(checkWarnings, intervalTime);

//顯示警告的函數（帶有延遲）
function showWarningWithDelay(warningId) {
  setTimeout(function() {
      document.getElementById(warningId).style.display = 'block';
  }, delayTime);
}

// 在 checkWarnings 函數調用 showWarningWithDelay 函數來顯示警告
function checkWarnings() {
  // 獲取c1、c2和c3的值
  var c1Value = c1;
  var c2Value = c2;
  var c3Value = c3;

  // 獲取fd、tem和hum的值
  var fdValue = parseFloat(fdElement.innerText);
  var temValue = parseFloat(temElement.innerText);
  var humValue = parseFloat(humElement.innerText);

  // 先檢查溫度警告
  if (temValue > c1Value) {
      showWarningWithDelay('溫度警告');
  } else {
      document.getElementById('溫度警告').style.display = 'none';
  }

  // 檢查濕度警告
  if (humValue > c2Value) {
      setTimeout(function() {
          showWarningWithDelay('濕度警告');
      }, delayTime);
  } else {
      document.getElementById('濕度警告').style.display = 'none';
  }

  // 食物警告
  if ( c3Value == fdValue ) 
    {
      setTimeout(function() {
          showWarningWithDelay('食物警告');
      }, delayTime*1.5 ); 
    } 
      else 
      {
      document.getElementById('食物警告').style.display = 'none';
      }
}


// 在頁面加載時立即執行一次檢查
checkWarnings();

// 定時調用 checkWarnings() 函數
setInterval(checkWarnings, intervalTime);
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
//---------
function submitForm() {
  var url = document.getElementById("urlInput").value;
  if (url.trim() !== "") {
    window.open(url); // 在新視窗中打開網址
  }
}


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
function switchmsetp() {
  document.getElementById("hmsetp").style.display = "block";
  document.getElementById("fdsetp").style.display = "none";
  document.getElementById("page2").style.display = "none";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
}
function swhistory() {
  document.getElementById("history").style.display = "block";
  document.getElementById("fdsetp").style.display = "none";
  document.getElementById("page2").style.display = "none";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
}
function back1() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("history").style.display = "none";
}


function back2() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("hmsetp").style.display = "none";
  document.getElementById("page3").style.display = "none";
}
function back3() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("sta").style.display = "none";
}
function back4() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("tmsetp").style.display = "none";
}
function back5() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("hmsetp").style.display = "none";
}
function back6() {
  document.getElementById("page2").style.display = "block";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("fdsetp").style.display = "none";
}
function switchpth(){
  document.getElementById("page3").style.display = "block";
  document.getElementById("page2").style.display = "none";

}
function switchptv(){
  document.getElementById("sta").style.display = "block";
  document.getElementById("page2").style.display = "none";

}
function outaccount(){
  document.getElementById("page1").style.display = "block";
  document.getElementById("page2").style.display = "none";
  document.getElementById("userlogin").style.display = "none";
  document.getElementById("userregister").style.display = "none";
  document.getElementById("fdsetp").style.display = "none";
  document.getElementById("page3").style.display = "none";
  document.getElementById("page4").style.display = "none";
}

function 關閉視窗(id) {
  document.getElementById(id).style.display = "none";
}
