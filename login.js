var logIn = document.getElementById("signin");
var Errpopup = document.getElementById("Errpopup");
var tryagain = document.getElementById("tryAgain");
var Err = document.getElementById("error");
var email = document.getElementById("email");
var password = document.getElementById("password");
var gsignin = document.getElementById("gsignin");

// Add loading state to buttons
function setLoading(button, isLoading) {
    if (isLoading) {
        button.innerHTML = '<span class="loading"></span> Loading...';
        button.disabled = true;
    } else {
        if (button.id === "signin") {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        } else if (button.id === "gsignin") {
            button.innerHTML = '<img src="google.png" alt="Google"> Continue with Google';
        }
        button.disabled = false;
    }
}

logIn.addEventListener("click", async function() {
    if (!email.value || !password.value) {
        showError("Please fill in all fields");
        return;
    }
    
    setLoading(logIn, true);
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email.value, password.value)
        .then((user) => {
            localStorage.setItem("userId", user.user.uid);
            localStorage.setItem("Show", true);
            window.location.replace("./TODO/index.html");
        })
        .catch((error) => {
            showError(error.message);
            localStorage.removeItem("userId");
        });
    } catch (error) {
        showError("An unexpected error occurred");
    } finally {
        setLoading(logIn, false);
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

function showError(message) {
    Err.innerText = message;
    Errpopup.classList.add("active");
}

function closeError() {
    Errpopup.classList.remove("active");
}

// Close popup when clicking outside
Errpopup.addEventListener("click", function(e) {
    if (e.target === Errpopup) {
        closeError();
    }
});

// Enter key to submit
document.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        logIn.click();
    }
});