// --- MODULE XÁC THỰC NGƯỜI DÙNG ---

function checkAuth() {
    const isLogged = localStorage.getItem('isTruongAnLogged');
    const loginUI = document.getElementById('loginOverlay');
    if (isLogged === 'true') {
        if (loginUI) loginUI.style.display = 'none';
    } else {
        if (loginUI) loginUI.style.display = 'flex';
    }
}

async function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const btn = document.getElementById('btnLogin');

    if (!user || !pass) return alert("Vui lòng nhập đủ tài khoản và mật khẩu!");
    btn.innerText = "Đang kiểm tra...";
    btn.disabled = true;

    try {
        const res = await fetch(API, {
            method: "POST",
            body: JSON.stringify({
                action: "syncBatch",
                queue: [{ id: Date.now(), action: "verifyLogin", data: { user, pass } }]
            })
        });
        const result = await res.json();
        const isAuthorized = result.results[0].authorized;

        if (isAuthorized) {
            localStorage.setItem('isTruongAnLogged', 'true');
            document.getElementById('loginOverlay').style.display = 'none';
            alert("Đăng nhập thành công!");
            if (typeof syncData === "function") syncData(true);
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    } catch (e) {
        alert("Lỗi kết nối máy chủ!");
    } finally {
        btn.innerText = "ĐĂNG NHẬP";
        btn.disabled = false;
    }
}

function handleLogout() {
    if(confirm("Bạn muốn đăng xuất?")) {
        localStorage.removeItem('isTruongAnLogged');
        location.reload();
    }
}