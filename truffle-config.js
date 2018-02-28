var DefaultBuilder = require("truffle-default-builder");

module.exports = {
    build: new DefaultBuilder({
        "index.html": "index.html",
        "app.js": [
            "vendor/angular/angular.js",
            "vendor/angular-route/angular-route.js",
            "javascript/app.js",


        ],
        "app.css": [
            "stylesheets/app.css"
        ],

        "views/": "views/"
    }),

    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "1337" // match any network
        },
        live: {
            host: "localhost",
            port: 8545,
            network_id: "*" // match any network
        }
    }
};
