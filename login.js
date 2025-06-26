var logIn = document.getElementById("signin");
var Errpopup = document.getElementById("Errpopup");
var tryagain = document.getElementById("tryAgain");
var Err = document.getElementById("error");


logIn.addEventListener("click", async function asyn(){
    await firebase.auth().signInWithEmailAndPassword(email.value,password.value)
   .then((user)=>{
    localStorage.setItem("userId",user.user.uid)
    localStorage.setItem("Show",true)
    window.location.replace("./TODO/index.html")
   })
   .catch((error)=>{
    function visibleErrpopup(){
        Err.innerText = error.message;
        Errpopup.classList.add("openErrpopup")
    }
     visibleErrpopup();
    localStorage.clear("userId");
   })
   
})

function closeError(){
    Errpopup.classList.remove("openErrpopup");
}