const user = localStorage.getItem("user");
if(!user){
    window.location.href = "/index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        localStorage.removeItem("user");
        window.location.href = "/index.html";
    } catch(error) {
        console.error("Logout Failed:", error);
        alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
});

const currentUser = JSON.parse(user);
if(currentUser.role !== "admin"){
    const adminMenus = document.querySelectorAll(".admin-only");
    adminMenus.forEach(menu => {
        menu.style.display = "none";
    });
}
const welcomeMessage = document.getElementById("welcomeMessage");
welcomeMessage.textContent = `Welcome ${currentUser.username} (${currentUser.role})`;