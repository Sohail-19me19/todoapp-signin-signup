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

// Add loading state to buttons
function setLoading(button, isLoading) {
    if (isLoading) {
        button.innerHTML = '<span class="loading"></span> Loading...';
        button.disabled = true;
    } else {
        if (button.id === "signup") {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        } else if (button.id === "gsignin") {
            button.innerHTML = '<img src="google.png" alt="Google"> Continue with Google';
        }
        button.disabled = false;
    }
}

signUp.addEventListener("click", async function() {
    if (!userName.value || !userAge.value || !email.value || !password.value) {
        showError("Please fill in all fields");
        return;
    }
    
    if (userAge.value < 13 || userAge.value > 120) {
        showError("Please enter a valid age between 13 and 120");
        return;
    }
    
    setLoading(signUp, true);
    
    try {
        await firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then(async (user) => {
            const userObject = {
                name: userName.value,
                email: email.value,
                password: password.value,
                age: userAge.value,
                userId: user.user.uid
            };
            
            await firebase.database().ref("users").child(user.user.uid).set(userObject);
            showSuccess();
        })
        .catch((error) => {
            showError(error.message);
        });
    } catch (error) {
        showError("An unexpected error occurred");
    } finally {
        setLoading(signUp, false);
    }
});

// Google Sign In
gsignin.addEventListener("click", function() {
    setLoading(gsignin, true);
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    firebase.auth()
    .signInWithPopup(provider)
    .then(async (result) => {
        const user = result.user;
        const userObject = {
            name: user.displayName,
            email: user.email,
            photoUrl: user.photoURL
        };
        
        await firebase.database().ref("users").child(user.uid).set(userObject);
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("Show", true);
        window.location.replace("./TODO/index.html");
    }).catch((error) => {
        showError(error.message);
    }).finally(() => {
        setLoading(gsignin, false);
    });
});

function showSuccess() {
    popUp.classList.add("active");
}

function showError(message) {
    Err.innerText = message;
    Errpopup.classList.add("active");
}

function closePopup() {
    popUp.classList.remove("active");
    window.location.replace("index.html");
}

function closeError() {
    Errpopup.classList.remove("active");
}

// Close popups when clicking outside
popUp.addEventListener("click", function(e) {
    if (e.target === popUp) {
        closePopup();
    }
});

Errpopup.addEventListener("click", function(e) {
    if (e.target === Errpopup) {
        closeError();
    }
});

// Enter key to submit
document.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        signUp.click();
    }
});


