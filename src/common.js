//environment file //developer environment
//all common files accross folder

export const ACCESS_TOKEN = "ACCESS-TOKEN";
export const TOKEN_TYPE = "TOKEN_TYPE";
export const EXPIRES_IN = "EXPIRES_IN";
export const LOADED_TRACKS = "LOADED_TRACKS";
const APP_URL = import.meta.env.VITE_APP_URL;

export const ENDPOINT = {
  //provides to call different api to heper func which calls api
  userInfo: "me", //ENDPOINT.userInfo will be used in dashboard.js to pass to the fetchRequest which is in api.js
  featuredPlaylist: "browse/featured-playlists?limit=5",
  toplists: "browse/categories/toplists/playlists?limit=10",
  playlist: "playlists",
  userPlaylist: "me/playlists",

};

export const logout = () => {
  //this function is called when expirein is reached
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_TYPE);
  localStorage.removeItem(EXPIRES_IN);
  window.location.href = APP_URL;
};

export const getItemFromLocalStorage = (key) => {
    return JSON.parse(localStorage.getItem(key));
}
export const setItemInLocalStorage = (key, value) => {
    return localStorage.setItem(key, JSON.stringify(value));
}

export const SECTIONTYPE = {
  DASHBOARD: "DASHBOARD",
  PLAYLIST: "PLAYLIST",
};
