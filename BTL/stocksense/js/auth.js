/* auth.js — CHỨC NĂNG: Xác thực người dùng (đăng nhập) — tách riêng từ index.html */
(function(){
  'use strict';
  var loginForm = document.getElementById('loginForm');
  if(!loginForm) return;   // không phải trang login → dừng

  var emailInp = document.getElementById('email');
  var pwInp    = document.getElementById('password');
  var roleSel  = document.getElementById('role');
  var loginBtn = document.getElementById('loginBtn');
  var loginBtnText = document.getElementById('loginBtnText');

  // --- Hiển thị / ẩn lỗi ---
  function showErr(input, errEl, msg){ input.classList.add('err'); errEl.querySelector('span').textContent = msg; errEl.classList.add('show'); }
  function clearErr(input, errEl){ input.classList.remove('err'); errEl.classList.remove('show'); }
  function hideGlobal(){ var g = document.getElementById('globalErr'); if(g) g.style.display='none'; }
  function showGlobal(msg){
    var g = document.getElementById('globalErr');
    document.getElementById('globalErrText').textContent = msg;
    if(g) g.style.display = 'flex';
  }

  // --- Sự kiện: gõ chữ → tự tắt lỗi ---
  emailInp.addEventListener('input', function(){ clearErr(emailInp, document.getElementById('emailErr')); hideGlobal(); });
  pwInp.addEventListener('input',    function(){ clearErr(pwInp, document.getElementById('pwErr')); hideGlobal(); });
  roleSel.addEventListener('change', function(){ clearErr(roleSel, document.getElementById('roleErr')); hideGlobal(); });

  // --- Nút mắt hiện/ẩn mật khẩu ---
  var toggle = document.getElementById('togglePw');
  if(toggle) toggle.addEventListener('click', function(){
    pwInp.type = (pwInp.type === 'password') ? 'text' : 'password';
  });

  // --- Nút AI Assistant trên trang login ---
  var aiBtn = document.getElementById('aiAssistantBtn');
  if(aiBtn) aiBtn.addEventListener('click', function(){
    showGlobal('Vui lòng đăng nhập trước để sử dụng AI Assistant.');
  });

  // --- XỬ LÝ ĐĂNG NHẬP CHÍNH ---
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    hideGlobal();
    var email = emailInp.value.trim();
    var pw    = pwInp.value;
    var role  = roleSel.value;
    var ok    = true;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!email){ showErr(emailInp, document.getElementById('emailErr'), 'Vui lòng nhập email'); ok=false; }
    else if(!emailRe.test(email)){ showErr(emailInp, document.getElementById('emailErr'), 'Email không đúng định dạng'); ok=false; }
    if(!pw){ showErr(pwInp, document.getElementById('pwErr'), 'Vui lòng nhập mật khẩu'); ok=false; }
    else if(pw.length < 6){ showErr(pwInp, document.getElementById('pwErr'), 'Mật khẩu phải có ít nhất 6 ký tự'); ok=false; }
    if(!role){ showErr(roleSel, document.getElementById('roleErr'), 'Vui lòng chọn vai trò'); ok=false; }
    if(!ok) return;

    // Hợp lệ → khóa nút, mô phỏng gọi server 900ms
    loginBtn.disabled = true;
    loginBtn.style.opacity = '.7';
    loginBtnText.innerHTML = '<span class="spin"></span> Đang kiểm tra...';

    setTimeout(function(){
      var allAcc = window.SS.getAllAccounts();
      var acc = allAcc[email.toLowerCase()];

      if(!acc || acc.pw !== pw){
        showGlobal('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
        loginBtn.disabled = false; loginBtn.style.opacity = '1'; loginBtnText.textContent = 'Đăng nhập';
        emailInp.classList.add('err'); pwInp.classList.add('err');
        return;
      }
      if(acc.role !== role){
        showGlobal('Vai trò không khớp với tài khoản. Vui lòng chọn đúng vai trò.');
        loginBtn.disabled = false; loginBtn.style.opacity = '1'; loginBtnText.textContent = 'Đăng nhập';
        return;
      }

      // Thành công → lưu phiên → chuyển dashboard
      acc.email = email.toLowerCase();
      try{ sessionStorage.setItem('ss_user', JSON.stringify(acc)); }catch(e){}
      window.location.href = 'dashboard.html';
    }, 900);
  });
})();
