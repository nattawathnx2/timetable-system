const user = localStorage.getItem("user");
if(!user){
    window.location.replace("/index.html");
} else {
    let currentUser;
    try {
        currentUser = JSON.parse(user);
    } catch(error) {
        localStorage.removeItem("user");
        window.location.replace("/index.html");
        throw error;
    }

    const logoutBtn = document.getElementById("logoutBtn");

    if(logoutBtn){
        logoutBtn.addEventListener("click", async () => {
            try {
                await fetch("/auth/logout", {
                    method: "POST",
                    credentials: "same-origin"
                });
            } catch(error) {
                console.error("Logout Failed:", error);
            } finally {
                localStorage.removeItem("user");
                window.location.replace("/index.html");
            }
        });
    }
    const welcomeMessage = document.getElementById("welcomeMessage");
    if(welcomeMessage){
        welcomeMessage.textContent = `Welcome ${currentUser.username}`;
    }

    async function checkAdminAccess(){
        const adminMenus = document.querySelectorAll(".admin-only");

        adminMenus.forEach(menu => {
            menu.style.setProperty("display", "none", "important");
        });

        try {
            const response = await fetch("/users/auth/admin-check", {
                method: "GET",
                credentials: "same-origin"
            });

            if(!response.ok){
                return;
            }
            const result = await response.json();
            if(result.authorized === true){
                adminMenus.forEach(menu => {
                    menu.style.removeProperty("display");
                });

                if(welcomeMessage){
                    welcomeMessage.textContent = `Welcome ${currentUser.username} (admin)`;
                }
            }
        } catch(error) {
            console.error("Admin permission check failed:", error);
        }
    }
    checkAdminAccess();
}