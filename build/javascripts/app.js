"use strict";
var Web3 = require(['vendor/web3/dist/web3'])
var web3 = new Web3(web3.currentProvider);

/*web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));*/
if(!web3.currentProvider)
    try {
        web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
    }
    catch(e)
    {
        console.log("errogbnn");
    }


var app = angular.module("mySimpleWalletDapp", ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainController'
    }).when('/events', {
        templateUrl: 'views/events.html',
        controller: 'ShoweventsController'
    }).when('/sendfunds', {
        templateUrl: 'views/sendfunds.html',
        controller: 'SendfundsController'
    }).when('/permissions', {
        templateUrl: 'views/permissions.html',
        controller: 'PermissionsController'
    }).otherwise({redirectTo: '/'});
});