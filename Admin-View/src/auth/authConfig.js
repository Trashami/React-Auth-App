export const msalConfig = {
    auth: {
        clientId: "3b065149-47e0-4698-8e15-7c2b6ddc5b88",
        authority: `https://login.microsoftonline.com/e9ab118a-9355-41a6-aaad-633046c798b9`, 
        redirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false, 
    }
};

export const loginRequest = {
    scopes: ["User.Read"]
};