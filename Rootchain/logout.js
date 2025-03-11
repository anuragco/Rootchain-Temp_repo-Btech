
document.addEventListener("DOMContentLoaded", function () {
const loginBtn = document.getElementById("log-in-btn");

if (localStorage.getItem("session_id")) {
  loginBtn.textContent = "Logout";
  loginBtn.classList.add("logout-btn");

  loginBtn.addEventListener("click", function () {
      localStorage.removeItem("session_id"); 
      alert("Logged out successfully!");
      location.reload(); 
  });
} else {
 
  loginBtn.addEventListener("click", function () {
      window.location.href = "/login";
  });
}
});

