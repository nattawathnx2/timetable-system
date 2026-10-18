(async function () {
    try {
        const response = await fetch("/users/auth/admin-check", {
            method: "GET",
            credentials: "same-origin"
        });

        if (response.status === 401) {
            window.location.replace("/index.html");
            return;
        }

        if (response.status === 403 || !response.ok) {
            window.location.replace("/dashboard.html");
            return;
        }

        const result = await response.json();

        if (result.authorized !== true) {
            window.location.replace("/dashboard.html");
            return;
        }

        document.body.style.display = "block";
    } catch (error) {
        window.location.replace("/dashboard.html");
    }
})();
