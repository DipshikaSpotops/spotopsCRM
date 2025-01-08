// below is my login_signup.js
const forms = document.querySelector(".forms"),
    pwShowHide = document.querySelectorAll(".eye-icon"),
    links = document.querySelectorAll(".link");

pwShowHide.forEach(eyeIcon => {
    eyeIcon.addEventListener("click", () => {
        let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");

        pwFields.forEach(password => {
            if (password.type === "password") {
                password.type = "text";
                eyeIcon.classList.replace("bx-hide", "bx-show");
            } else {
                password.type = "password";
                eyeIcon.classList.replace("bx-show", "bx-hide");
            }
        });
    });
});
links.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        forms.classList.toggle("show-signup");
    });
});

document.querySelector('.login-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.querySelector('.login-email').value.trim();
    const password = document.querySelector('.login-password').value.trim();
    const payload = { email, password };
    console.log("Login payload:", payload); 
    try {
        const response = await axios.post('https://www.spotops360.com/auth/login', payload);
        console.log("Login response:", response.data);
        if (response.status === 200) {
            localStorage.clear();
            localStorage.setItem("loginTimestamp", Date.now());
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('firstName', response.data.firstName);
            localStorage.setItem('lastName', response.data.lastName);
            localStorage.setItem('team', response.data.team);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('email', response.data.email);
            Swal.fire({
                icon: 'success',
                title: 'Logged in successfully',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            alert(response.data.msg || response.data.errors.map(error => error.msg).join(', '));
        }
    } catch (error) {
        console.error('Login error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Invalid email or password',
            showConfirmButton: true,
            timer: 1500
        });
    }
});



document.querySelector('.signup-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const fName = document.querySelector('.signup-fName').value;
    const lName = document.querySelector('.signup-lName').value;
    const email = document.querySelector('.signup-email').value;
    const password = document.querySelector('.signup-password').value;
    const role = document.querySelector('.userRole').value;
    console.log("Signup data:", { fName, lName, email, password, role });

    try {
        const response = await axios.post('https://www.spotops360.com/auth/signup', {
            fName, lName, email, password, role
        });

        if (response.status === 200) {
            localStorage.clear();
            localStorage.setItem("loginTimestamp", Date.now());
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('firstName', fName);
            localStorage.setItem('email', email);
            localStorage.setItem('role', role);
            Swal.fire({
                icon: 'success',
                title: 'Signed up successfully',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                console.log("signed up")
                window.location.href = 'index.html';
            });
        } else {
            alert(response.data.msg || response.data.errors.map(error => error.msg).join(', '));
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred. Please try again.');
    }
});
