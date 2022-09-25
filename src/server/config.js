const config = {
    url: "http://localhost:3000",
    steam: {
        returnUrl: "auth/steam/return",
        apiKey: "",

    },
    google: {
        clientId: "",
        clientSecret: "",
        callbackUrl: "auth/google/callback"
    },
    discord: {
        clientId: "",
        clientSecret: "",
        callbackUrl: "auth/discord/callback"
    }
}

export default config;
