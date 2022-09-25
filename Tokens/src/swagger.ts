export const swaggerDocument = {
    openapi: '3.0.1',
    info: {
        title: "Tokens API",
        version: "1.0.0",
        description: "A simple Express Tokens API"
    },
    servers: [
        {
            url: "http://localhost:3040",
            description: 'Local server'
        }
    ]
}