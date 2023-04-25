import { ACCESS_TOKEN, EXPIRES_IN, TOKEN_TYPE } from "../common";
// const ACCESS_TOKEN_KEY = "accessToken"; //TAKING FORM COMMON NOW

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID; //from env
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const APP_URL = import.meta.env.VITE_APP_URL;
const scopes =
  "user-top-read user-follow-read playlist-read-private user-library-read";

//function to authorize user
const authorizeUser = () => {
  //innerhtml
  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes}&show_dialog=true`;
  //we will get response as access token
  window.open(url, "login", "width=800,height=600"); //to open this url for user as a button
  //dialouge box will open will have login screen if not login
};

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-to-spotify");
  loginButton.addEventListener("click", authorizeUser); //when user clicks login authorizeUser function will bw called and authorisation will be done by spotify
});

// adding accessToken , expiresIn in localStorage
window.setItemInLocalStorage = ({ accessToken, tokenType, expiresIn }) => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_TYPE, tokenType);
  localStorage.setItem(EXPIRES_IN,(Date.now() + (expiresIn * 1000))); //*1000 as datenow gives time in ms //to check weather access token is still alive
  window.location.href = APP_URL; //redirect to dashboard
};

//when back to login
//after successful login we will redirected to login on the diallougue with accesstoken #
window.addEventListener("load", () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN); //ACCESS_TOKEN from commom.js

  if (accessToken) {
    // if accessToken in localStorage direct to dashboard
    window.location.href = `${APP_URL}/dashboard/dashboard.html`;
  }

  if (window.opener != null && !window.opener.closed) {
    //checking if dialoughe is still open (login page is opened in dailougue box)
    window.focus();
    if (window.location.href.includes("error")) {
      window.close(); //if any error in page it will close
    }

    const { hash } = window.location; //getting hash from location
    const searchParams = new URLSearchParams(hash);
    const accessToken = searchParams.get("#access_token"); //key value pair searchPAram

    // #access_token = 'BQCPakO9nrDxGluWSjV446H0ksfRzHPG4Z_n_wa7V6QZQ8g2zUPgnmRF3oMHyKCCRonwRguy_Ei2HixhUuDDuozwe59ZIXnfsZyTHaz6gRQeQsAJn10RIBtBmzrHUoaSCsSpBylE65RLRU4SUN9Sw6OWn3G4LWanNRWflummLFDhFB0W18RPZvSdSsQ1wwqVYF_QF-p8lW2bM5Ayd4XaFjBjeosoYFOx7Ebke5I'
    const tokenType = searchParams.get("token_type");
    const expiresIn = searchParams.get("expires_in");
    if (accessToken) {
      window.close(); //close popup
      //going back to opener of popup
      window.opener.setItemInLocalStorage({
        accessToken,
        tokenType,
        expiresIn,
      }); //passing to setItemInLocalStorage to set in local storage what got from login popup
      //setitem to that window which has opened the dialuge box
    } else {
      window.close(); //problem with authentication
    }
  }
});
