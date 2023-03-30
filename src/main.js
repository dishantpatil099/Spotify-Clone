import "./style.css";
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("accessToken")) {
    //insted of anchor tag
    window.location.href = "dashboard/dashboard.html";
  } else {
    window.location.href = "login/login.html";
  }
});
