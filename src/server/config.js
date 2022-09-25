const config = {
    url: "http://localhost:3000",
    steam: {
        returnUrl: "auth/steam/return",
        apiKey: "7FD4AE2FAC4E9EF8CC7002E9BA4463D0",

    },
    google: {
        clientId: "498962547213-rvla2qgev9k0m3fvc852ep14pa2k8f1l.apps.googleusercontent.com",
        clientSecret: "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",
        callbackUrl: "auth/google/callback"
    },
    discord: {
        clientId: "1023670078857814138",
        clientSecret: "ENwL4V1-fSmFLgTSgstD_KLXJy8ucRrZ",
        callbackUrl: "auth/discord/callback"
    }
}

export default config;