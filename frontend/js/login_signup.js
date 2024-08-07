// Function to inject the modal HTML into the document
function injectModal() {
    const modalHTML = `
    <div class="modal fade" id="errorModal" tabindex="-1" role="dialog" aria-labelledby="errorModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="errorModalLabel">Error</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    Invalid Username or Password. Please try again.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Call the function to inject the modal when the document is loaded
document.addEventListener("DOMContentLoaded", function () {
    injectModal();
});

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
    const email = document.querySelector('.login-email').value;
    const password = document.querySelector('.login-password').value;
    console.log("Login data:", { email, password });

    try {
        const response = await axios.post('https://www.spotops360.com/auth/login', { email, password });
        if (response.status === 200) {
            console.log("data res", response.data);
            localStorage.clear();
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
            showErrorModal(response.data.msg || response.data.errors.map(error => error.msg).join(', '));
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorModal('Invalid Username or Password. Please try again.');
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
                console.log("signed up");
                window.location.href = 'index.html';
            });
        } else {
            showErrorModal(response.data.msg || response.data.errors.map(error => error.msg).join(', '));
        }
    } catch (error) {
        console.error('Signup error:', error);
        showErrorModal('An error occurred. Please try again.');
    }
});

function showErrorModal(message) {
    document.querySelector('#errorModal .modal-body').innerText = message;
    $('#errorModal').modal('show');
}
