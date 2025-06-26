let userName = document.getElementById("username");
let userAge = document.getElementById("age");
let email = document.getElementById("email");
let password = document.getElementById("password");
let signUp = document.getElementById("signup");
var popUp = document.getElementById("popUp");
var ok = document.getElementById("ok");
var Errpopup = document.getElementById("Errpopup");
var tryagain = document.getElementById("tryAgain");
var Err = document.getElementById("error");
var gsignin = document.getElementById("gsignin");
var provider = new firebase.auth.GoogleAuthProvider();



signUp.addEventListener("click",async function asyn(){
   await firebase.auth().createUserWithEmailAndPassword(email.value,password.value)
   .then(async (user)=>{
    function openPopup(){
         popUp.classList.add("open-popup");
        }
    await openPopup();
    var userObject = {
        name: userName.value,
        email: email.value,
        password: password.value,
        age: userAge.value,
        userId: user.user.uid
    }
    await firebase.database().ref("users").child(user.user.uid).set(userObject)
   })

   .catch((error)=>{
    function visibleErrpopup(){
        Err.innerText = error.message;
        Errpopup.classList.add("openErrpopup")
    }
     visibleErrpopup();
   })
   
})

function closePopup(){
    popUp.classList.remove("open-popup");
    window.location.replace("signin.html");
}

function closeError(){
    Errpopup.classList.remove("openErrpopup");
}

gsignin.addEventListener("click",  function(){
    
  provider.setCustomParameters({
    prompt : 'select_account'
  })

  firebase.auth()
  .signInWithPopup(provider)
  .then(async (result) => {
    var credential = result.credential;
    var token = credential.accessToken;
    var user = result.user;
    var userObject = {
      name: user.displayName,
      email: user.email,
      photoUrl : user.photoURL
    }
    await firebase.database().ref("users").child(user.uid).set(userObject);
    localStorage.setItem("userId", user.uid);
    window.location.replace("./TODO/index.html");
    
  }).catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });
})


