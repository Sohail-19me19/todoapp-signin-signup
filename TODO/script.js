const activity = document.querySelector("#Activity");
const addBtn = document.querySelector("#Add");
const taskContainer = document.querySelector("#task-container");
const update = document.querySelector("#update");
const checkBox = document.querySelector("#checkBox");
const deleteAll = document.querySelector("#deleteAll");
const nameuser = document.querySelector("#nameuser"); 
const email = document.querySelector("#email");
var popUp = document.getElementById("popUp");
var ok = document.getElementById("ok");
var loading = document.getElementById("loading");
var mainPage = document.getElementById("goToPage");
var logout = document.getElementById("logout");
var profilePic = document.getElementById("profilePic");


function openPopup(){
    var show=localStorage.getItem("Show")
    if(show=="true"){
    localStorage.setItem("Show",false)
    popUp.classList.add("open-popup");
    }
    else{
        closePopup()
    }
   }


var selectedItem = "";
let checkBoxSelected = false;

addBtn.addEventListener("click", function addTask() {
    if(activity.value){
        var key = firebase.database().ref("todos").push().key;

        let li = document.createElement("li");
    
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    li.appendChild(checkbox);

    let p = document.createElement("p");
    p.innerText = activity.value;
    li.appendChild(p);

    let editBtn = document.createElement("button");
    editBtn.innerHTML = "&#x270E"
    editBtn.classList.add("edit");
    editBtn.setAttribute("id",key)


    li.appendChild(editBtn);
    editBtn.setAttribute("onclick", "editTask(this)");

    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "&#128465;"
    deleteBtn.setAttribute("id",key)
    li.appendChild(deleteBtn);
    deleteBtn.setAttribute("onclick", "deleteTask(this)");

    taskContainer.appendChild(li);
    addfirebaseItem(activity.value,key)


    // setItem();
    }
});
async function addfirebaseItem(val,key){
    var userId = localStorage.getItem("userId")
    var object = {
        "todo":val,
        "todo_key":key,
    }
    await firebase.database().ref("todos").child(userId).child(key).set(object)
    activity.value = ""
}


function editTask(e){
    activity.value = e.parentNode.childNodes[1].textContent;
    activity.focus();
    addBtn.style.display = "none";
    update.style.display = "inline";
    selectedItem = e.parentNode.childNodes[1];

}

update.addEventListener("click",async function updateTask(){
   if(activity.value){
    selectedItem.innerText = activity.value;
    var key = selectedItem.parentNode.children[2].id;
    addBtn.style.display = "inline";
    update.style.display = "none";
    let userId = localStorage.getItem("userId");
     await firebase.database().ref("todos").child(userId).child(key).update({"todo": activity.value});
    activity.value ="";
    // setItem()
   }
})

async function deleteTask(e) {
    e.parentNode.remove()
    var userId = localStorage.getItem("userId")
    await firebase.database().ref("todos").child(userId).child(e.id).remove()
//     setItem()

}


checkBox.addEventListener("click",function(){
    for(let item of taskContainer.children){
        item.children[0].checked = !checkBoxSelected;
    }
    checkBoxSelected = !checkBoxSelected;
});

deleteAll.addEventListener("click", function (){
    
    if(taskContainer.children.length > 0){
    for(let i=0; i<taskContainer.children.length; i++){
        if(taskContainer.children[i].children[0].checked){
            taskContainer.children[i].remove();
            i--;
            var userId = localStorage.getItem("userId");
            firebase.database().ref("todos").child(userId).remove();
        }
        checkBox.checked = false;
        checkBoxSelected = false;
        // setItem();
    }}
})

// function setItem(){
//     var todoItem = [];
//     for(let item of taskContainer.children){
//         todoItem.push(item.children[1].innerText)   
//     }
//     localStorage.setItem("ToDo", JSON.stringify(todoItem))
// }

function setFirstTime(value){
    let li = document.createElement("li");
    
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    li.appendChild(checkbox);

    let p = document.createElement("p");
    p.innerText = value.todo;
    li.appendChild(p);

    let editBtn = document.createElement("button");
    editBtn.innerHTML = "&#x270E"
    editBtn.classList.add("edit");
    li.appendChild(editBtn);
    editBtn.setAttribute("onclick", "editTask(this)");

    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "&#128465;"
    li.appendChild(deleteBtn);
    deleteBtn.setAttribute("onclick", "deleteTask(this)");

    taskContainer.appendChild(li);
    activity.value = ""
    
}

async function getItem(){
    var userId = localStorage.getItem("userId")
    await firebase.database().ref("todos").child(userId).get()
    .then((snap)=>{
        var data = snap.val()
        var values = Object.values(data||[])
        for(let item of values){
            setFirstTime(item);
        }
    })
    loading.style.display = "none";
    mainPage.style.display = "inline-block";
    openPopup();
    // var todo = JSON.parse (localStorage.getItem("ToDo"));
    // if(todo == null){

    // }
    // else{
    // for(let item of todo){
    //     setFirstTime(item);
    // }}
}


window.onload = function () {
    var userid = localStorage.getItem("userId")
    if (userid) {
       getUserData()
       getItem();

    }
    else{
        window.location.replace("../signin.html")
    }
}
 async function getUserData(){
    var userId = localStorage.getItem("userId")
 await firebase.database().ref("users").child(userId).get()
    .then( (snap)=>{
        email.innerText = snap.val().email;
        nameuser.innerText = snap.val().name;
        profilePic.src = snap.val().photoUrl;
        })
    .catch((e)=>{
        console.log(e)
        })
    }

     function closePopup(){
         popUp.classList.remove("open-popup");
    }

    logout.addEventListener("click", function (){
        firebase.auth().signOut().then(() => {
            localStorage.clear();
            window.location.replace("../signin.html");
          }).catch((error) => {
            console.log(error.message)
          });
    })
    

