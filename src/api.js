import { ACCESS_TOKEN, EXPIRES_IN, TOKEN_TYPE, logout } from "./common";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

const getAccessToken = () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const expiresIn = localStorage.getItem(EXPIRES_IN);
    const tokenType = localStorage.getItem(TOKEN_TYPE);

    if(Date.now() < expiresIn){ //expiresIn was stored as login time + 3600 sec
        return { accessToken, tokenType };
    }
    else{
        //logout
        logout();
    }
}

const createAPIConfig = ({accessToken , tokenType}, method = "GET") => { //returns accessToken , tokentype when we get it form local storage to fetch api
    return {  //getting infro from getAccessToken
        headers: {

            Authorization: `${tokenType} ${accessToken}`
        },
        method
    }

}



//helper func to call api

export const fetchRequest = async (endpoint) => {
    const url = `${BASE_API_URL}/${endpoint}`; //different endpoints have different url to access api //this creates url
    const result =  await fetch(url , createAPIConfig(getAccessToken()) ); //async await until result not recieved it will not move further
    return result.json(); //converting into js representation

}
