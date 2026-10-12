const button = document.getElementById("loadUsers");
const output = document.getElementById("output");
let currentUserId = null;
button.addEventListener("click", async () => {
    await loadUsers();
});

async function loadUsers(){
    const response = await fetch("/users");
    const data = await response.json();
    
    output.innerHTML = "";
    for(const user of data){
        const createdAt = new Date(user.created_at).toLocaleString("th-TH");
        output.innerHTML += `
        <tr>
            <td>${user.user_id}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${createdAt}</td>
            <td>
                <button class="delete-btn"
                data-user-id="${user.user_id}"
                data-username="${user.username}"
                data-role="${user.role}"
                >
                    Delete
                </button>
            </td>
            <td>
                <button class="edit-btn"
                data-user-id="${user.user_id}"
                data-username="${user.username}"
                data-password="${user.password}"
                data-role="${user.role}"
                >
                    Edit
                </button>
            </td>
        </tr>
        `;
    }

    const deleteButton = document.querySelectorAll(".delete-btn");
    deleteButton.forEach(button => {
        button.addEventListener("click", async () => {
            const userId = button.dataset.userId;
            const username = button.dataset.username;
            const role = button.dataset.role;
            const isConfirmed = confirm(`คุณแน่ใจที่จะลบ ${username} ${role} ใช่หรือไม่?`);
            if(!isConfirmed){return;}
            await fetch(`/users/${userId}`, {
                method: "DELETE"
            });
            await loadUsers();
        });
    });

    const editButton = document.querySelectorAll(".edit-btn");
    editButton.forEach(button => {
        button.addEventListener("click", async () => {
            console.log("userId =", button.dataset.userId);
            currentUserId = button.dataset.userId;

            usernameInput.value = button.dataset.username;
            passwordInput.value = button.dataset.password;
            roleInput.value = button.dataset.role;

            addButton.style.display = "none";
            updateButton.style.display = "inline";
        });
    });
}

function clearUserInput(){
    usernameInput.value = "";
    passwordInput.value = "";
    roleInput.value = "";
}

const addButton = document.getElementById("addUsers");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
addButton.addEventListener("click", async () => {
    const dataUsers = {
        username: usernameInput.value,
        password: passwordInput.value,
        role: roleInput.value
    };

    const response = await fetch("/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataUsers)
    });

    const data = await response.json();
    await loadUsers();
    clearUserInput();
    usernameInput.focus();
    console.log(data);
});

const updateButton = document.getElementById("updateUsers");
updateButton.style.display = "none";

updateButton.addEventListener("click", async () => {
    console.log("currentUserId =", currentUserId);
    const dataUsers = {
        username: usernameInput.value,
        password: passwordInput.value,
        role: roleInput.value
    };

    await fetch(`/users/${currentUserId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataUsers)
    });

    await loadUsers();
    clearUserInput();
    currentUserId = null;
    addButton.style.display = "inline";
    updateButton.style.display = "none";
});