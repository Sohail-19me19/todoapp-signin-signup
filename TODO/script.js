const activity = document.querySelector("#Activity");
const addBtn = document.querySelector("#Add");
const taskContainer = document.querySelector("#task-container");
const completedContainer = document.querySelector("#completed-container");
const update = document.querySelector("#update");
const checkBox = document.querySelector("#checkBox");
const deleteAll = document.querySelector("#deleteAll");
const nameuser = document.querySelector("#nameuser"); 
const email = document.querySelector("#email");
const popUp = document.getElementById("popUp");
const ok = document.getElementById("ok");
const loading = document.getElementById("loading");
const mainPage = document.getElementById("goToPage");
const logout = document.getElementById("logout");
const profilePic = document.getElementById("profilePic");

// Tab functionality
const tabBtns = document.querySelectorAll(".tab-btn");
const taskSections = document.querySelectorAll(".task-section");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        // Update active section
        taskSections.forEach(section => {
            section.classList.remove("active");
            if (section.id === `${targetTab}-section`) {
                section.classList.add("active");
            }
        });
    });
});

function openPopup() {
    const show = localStorage.getItem("Show");
    if (show === "true") {
        localStorage.setItem("Show", false);
        popUp.classList.add("active");
    } else {
        closePopup();
    }
}

var selectedItem = "";
let checkBoxSelected = false;

addBtn.addEventListener("click", function addTask() {
    if (activity.value.trim()) {
        const key = firebase.database().ref("todos").push().key;
        createTaskElement(activity.value, key, taskContainer, false);
        addfirebaseItem(activity.value, key, false);
        activity.value = "";
    }
});

async function addfirebaseItem(val, key, isCompleted = false) {
    const userId = localStorage.getItem("userId");
    const object = {
        "todo": val,
        "todo_key": key,
        "completed": isCompleted,
        "created_at": Date.now()
    };
    await firebase.database().ref("todos").child(userId).child(key).set(object);
}

function createTaskElement(taskText, key, container, isCompleted = false) {
    const li = document.createElement("li");
    if (isCompleted) {
        li.classList.add("completed");
    }
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted;
    checkbox.addEventListener("change", () => toggleTaskComplete(li, key, checkbox.checked));
    li.appendChild(checkbox);

    const p = document.createElement("p");
    p.innerText = taskText;
    li.appendChild(p);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.classList.add("edit");
    editBtn.setAttribute("id", key);
    editBtn.setAttribute("onclick", "editTask(this)");
    li.appendChild(editBtn);

    const completeBtn = document.createElement("button");
    completeBtn.innerHTML = '<i class="fas fa-check"></i>';
    completeBtn.classList.add("complete");
    completeBtn.setAttribute("id", key);
    completeBtn.setAttribute("onclick", "completeTask(this)");
    li.appendChild(completeBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.classList.add("delete");
    deleteBtn.setAttribute("id", key);
    deleteBtn.setAttribute("onclick", "deleteTask(this)");
    li.appendChild(deleteBtn);

    container.appendChild(li);
}

async function toggleTaskComplete(li, key, isCompleted) {
    const userId = localStorage.getItem("userId");
    
    if (isCompleted) {
        // Move to completed section
        li.classList.add("completed");
        const taskText = li.querySelector("p").textContent;
        li.remove();
        createTaskElement(taskText, key, completedContainer, true);
        await firebase.database().ref("todos").child(userId).child(key).update({"completed": true});
    } else {
        // Move back to pending section
        li.classList.remove("completed");
        const taskText = li.querySelector("p").textContent;
        li.remove();
        createTaskElement(taskText, key, taskContainer, false);
        await firebase.database().ref("todos").child(userId).child(key).update({"completed": false});
    }
}

function completeTask(btn) {
    const li = btn.parentNode;
    const key = btn.id;
    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.checked = true;
    toggleTaskComplete(li, key, true);
}

function editTask(e) {
    const taskText = e.parentNode.querySelector("p").textContent;
    activity.value = taskText;
    activity.focus();
    addBtn.style.display = "none";
    update.style.display = "inline-flex";
    selectedItem = e.parentNode.querySelector("p");
}

update.addEventListener("click", async function updateTask() {
    if (activity.value.trim()) {
        selectedItem.innerText = activity.value;
        const key = selectedItem.parentNode.querySelector(".edit").id;
        addBtn.style.display = "inline-flex";
        update.style.display = "none";
        const userId = localStorage.getItem("userId");
        await firebase.database().ref("todos").child(userId).child(key).update({"todo": activity.value});
        activity.value = "";
    }
});

async function deleteTask(e) {
    const li = e.parentNode;
    const key = e.id;
    li.remove();
    const userId = localStorage.getItem("userId");
    await firebase.database().ref("todos").child(userId).child(key).remove();
}

checkBox.addEventListener("click", function() {
    const currentContainer = document.querySelector(".task-section.active");
    const checkboxes = currentContainer.querySelectorAll("input[type='checkbox']");
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !checkBoxSelected;
    });
    checkBoxSelected = !checkBoxSelected;
});

deleteAll.addEventListener("click", async function() {
    const currentContainer = document.querySelector(".task-section.active");
    const checkedItems = currentContainer.querySelectorAll("li input[type='checkbox']:checked");
    
    if (checkedItems.length > 0) {
        const userId = localStorage.getItem("userId");
        
        for (let checkbox of checkedItems) {
            const li = checkbox.parentNode;
            const key = li.querySelector(".edit").id;
            li.remove();
            await firebase.database().ref("todos").child(userId).child(key).remove();
        }
        
        checkBox.checked = false;
        checkBoxSelected = false;
    }
});

function setFirstTime(value) {
    const container = value.completed ? completedContainer : taskContainer;
    createTaskElement(value.todo, value.todo_key, container, value.completed);
}

async function getItem() {
    const userId = localStorage.getItem("userId");
    await firebase.database().ref("todos").child(userId).get()
    .then((snap) => {
        const data = snap.val();
        if (data) {
            const values = Object.values(data);
            values.forEach(item => {
                setFirstTime(item);
            });
        }
    });
    
    loading.style.display = "none";
    mainPage.style.display = "block";
    openPopup();
}

window.onload = function() {
    const userid = localStorage.getItem("userId");
    if (userid) {
        getUserData();
        getItem();
    } else {
        window.location.replace("../index.html");
    }
};

async function getUserData() {
    const userId = localStorage.getItem("userId");
    await firebase.database().ref("users").child(userId).get()
    .then((snap) => {
        const userData = snap.val();
        email.innerText = userData.email;
        nameuser.innerText = userData.name;
        if (userData.photoUrl) {
            profilePic.src = userData.photoUrl;
        }
    })
    .catch((e) => {
        console.log(e);
    });
}

function closePopup() {
    popUp.classList.remove("active");
}

logout.addEventListener("click", function() {
    firebase.auth().signOut().then(() => {
        localStorage.clear();
        window.location.replace("../index.html");
    }).catch((error) => {
        console.log(error.message);
    });
});

// Enter key to add task
activity.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addBtn.click();
    }
});

// Close popup when clicking outside
popUp.addEventListener("click", function(e) {
    if (e.target === popUp) {
        closePopup();
    }
});
    

