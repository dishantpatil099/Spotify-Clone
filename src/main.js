import "./style.css";
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'
const APP_URL = import.meta.env.VITE_APP_URL;

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("accessToken")) {
    //insted of anchor tag
    window.location.href = `${APP_URL}/dashboard/dashboard.html`;
  } else {
    window.location.href = `${APP_URL}/login/login.html`;
  }
});
