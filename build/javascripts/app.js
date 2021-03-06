"use strict";
var Web3 = require(['vendor/web3/dist/web3'])
console.log(web3.currentProvider);
var web3 = new Web3(web3.currentProvider);

/*web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));*/
if (typeof web3 !== 'undefined') {

    web3 = new Web3(web3.currentProvider);
} else {
    // If no injected web3 instance is detected, fallback to Ganache.
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    web3 = new Web3(web3.currentProvider);
}


var app = angular.module("mySimpleWalletDapp", ['ngRoute']);
angular.module = function() {
    return app;
}

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


app.controller("MainController", function ($scope) {
    SimpleWallet.deployed().then(function(contract) {
        $scope.balanceInEther = web3.fromWei(web3.eth.getBalance(contract.address).toNumber(), "ether");

        $scope.contract_address = contract.address;
        $scope.contract_abi = JSON.stringify(contract.contract.abi);

        $scope.accounts = [];
        angular.forEach(web3.eth.accounts, function(obj) {
            contract.isAllowedToSend.call(obj).then(function(isAllowed) {
                $scope.accounts.push({address: obj, isAllowed:isAllowed});
                $scope.$apply();
            })
        });
    });


});


app.controller("PermissionsController", function ($scope) {
    SimpleWallet.deployed().then(function(contract) {
        $scope.loading = false;
        $scope.success = false;
        $scope.error = false;

        $scope.changePermission = function(address, allowDisallow) {
            console.log(address);
            $scope.loading = true;
            $scope.success = false;
            $scope.error = false;
            if(allowDisallow == 'allow') {
                contract.allowAddressToSendMoney(address, {from: web3.eth.accounts[0]}).then(function() {
                    $scope.loading = false;
                    $scope.success = true;
                    $scope.$apply();
                }).catch(function(error) {
                    console.error(error);
                    $scope.loading = false;
                    $scope.error = error.message;
                    $scope.$apply();
                });
            } else {
                contract.disallowAddressToSendMoney(address, {from: web3.eth.accounts[0]}).then(function() {
                    $scope.loading = false;
                    $scope.success = true;
                    $scope.$apply();
                }).catch(function(error) {
                    console.error(error);
                    $scope.loading = false;
                    $scope.error = error.message;
                    $scope.$apply();
                });
            }
        }
    });


});

app.controller('SendfundsController', function($scope){

    $scope.accounts = web3.eth.accounts;

    $scope.depositFunds = function(address, amount) {
        SimpleWallet.deployed().then(function(contract) {

            web3.eth.sendTransaction({from: address, to: contract.address, value: web3.toWei(amount, "ether")}, function(error, result) {
                if(error) {
                    $scope.has_errors = "I did not work";
                } else {
                    $scope.transfer_success = true;
                }
                $scope.$apply();
            });
        });


    };


    $scope.withdrawFunds = function(address, amount) {
        SimpleWallet.deployed().then(function(contract) {
            contract.sendFunds(web3.toWei(amount, "ether"), address, {from: web3.eth.accounts[0], gas: 200000}).then(function () {
                $scope.transfer_success = true;
                $scope.$apply();
            }).catch(function (error) {
                console.error(error);
                $scope.has_errors = error;
                $scope.$apply();
            });
        });

    }



});


app.controller("ShoweventsController", function($scope) {

    $scope.ourEvents = [];
    $scope.ourDepositEvents = [];
    $scope.withdrawls = [];

    SimpleWallet.deployed().then(function(myContract) {

        var events = myContract.allEvents({fromBlock: 0, toBlock: 'latest'});

        events.watch(function(error, result) {

            $scope.ourEvents.push(result);
            $scope.$apply();
        });

        var depositEvents = myContract.Deposit(null, {fromBlock: 0, toBlock: 'latest'}, function(error, result) {
            $scope.ourDepositEvents.push(result);
            $scope.$apply();
        });

        $scope.$on('$destroy', function() {
            events.stopWatching();
            depositEvents.stopWatching();
        });

        myContract.getAmountOfWithdrawls.call(web3.eth.accounts[0]).then(function(result) {
            var numberOfWithdrawls = result.toNumber();
            for(var i = 1; i <= numberOfWithdrawls; i++) {
                myContract.getWithdrawlForAddress.call(web3.eth.accounts[0], i).then(function(result_withdrawl) {
                    result_withdrawl[1] = web3.fromWei(result_withdrawl[1], "ether").toNumber();
                    $scope.withdrawls.push(result_withdrawl);
                    $scope.$apply();
                });
            }

            return this;
        });

    });



});