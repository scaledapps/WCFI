angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $state, $q, $ionicActionSheet, $ionicLoading, $ionicModal, $timeout, DBFactory) {
    $scope.loginData = {};
    $scope.registrationData = {};
    console.log(window.localStorage.loggedIn)
    if (window.localStorage.loggedIn != undefined) {
        $rootScope.loggedIn = JSON.parse(window.localStorage.loggedIn);
    }

    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.loginModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/registration.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.registrationModal = modal;
    });

    $scope.openLogin = function() {
        $scope.loginModal.show();
    };

    $scope.openRegistration = function() {
        $scope.registrationModal.show();
    };

    $scope.closeLogin = function() {
        $scope.loginModal.hide();
    };

    $scope.closeRegistration = function() {
        $scope.registrationModal.hide();
    };

    $scope.doLogin = function() {
        $timeout(function() {
            DBFactory.getUser($scope.loginData.username).then(function(user) {
                if (user != null) {
                    $rootScope.loggedIn = {
                        "username": user.username,
                        "name": user.name,
                        "role": user.role,
                        "phoneNo": user.phoneNo,
                        "specialization": user.specialization
                    };
                    window.localStorage.loggedIn = JSON.stringify($rootScope.loggedIn);
                    console.log(JSON.stringify($rootScope.loggedIn));
                    $scope.closeLogin();
                } else {
                    alert("Your login credentials were incorrect. Please try again.")
                }
            });
        }, 500);
    };

    $scope.doRegister = function() {
        $timeout(function() {
            console.log(JSON.stringify($scope.registrationData));
            DBFactory.addUser($scope.registrationData);
            $scope.closeRegistration();
        }, 500);
    };

    $scope.logout = function() {
        window.localStorage.clear();
        $rootScope.loggedIn = null;
        /*
        var hideSheet = $ionicActionSheet.show({
        	destructiveText: 'Logout',
        	titleText: 'Are you sure you want to logout?',
        	cancelText: 'Cancel',
        	cancel: function() {},
        	buttonClicked: function(index) {
        		return true;
        	},
        	destructiveButtonClicked: function(){

        		$ionicLoading.show({template: 'Logging out...'});

        		//window.localStorage.username = undefined;
        		//window.localStorage.role = undefined;
        		window.localStorage.clear();
        		$ionicLoading.hide();
        		$state.go('tab.dash');
        		//$scope.loading.hide();
        	}
        });*/
        //window.reload();
        //$state.go("tab.account");
        /*
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        } else {
            window.close();
        }
        */
        //$state.go('tab.dash');
        //$state.go($state.current, {}, { reload: true }); 
    };
})

.controller('ChatsCtrl', function($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true,
        enableAlerts: false,
        enableLocation: true
    };
})

.controller('ServicesCtrl', function($scope, $rootScope, $stateParams, $timeout, DBFactory) {
    $scope.serviceDtTm = "01/04/2017 10:00";
    $scope.services = ["Electrician", "Painter", "Plumber", "Gardener"];
    $scope.providers = [];


    $scope.filterProviders = function(serviceType) {
        DBFactory.listProviders(serviceType).then(function(providers) {
            $scope.providers = [];
            for (var i = 0; i < providers.length; ++i) {
                $scope.providers.push({
                    "username": providers[i].username,
                    "name": providers[i].name,
                    "role": providers[i].role,
                    "phoneNo": providers[i].phoneNo,
                    "specialization": providers[i].specialization
                });
            }
        });
    };

    $scope.placeRequest = function(type, provider, dateTime, comments) {
        var request = {
            "type": type,
            "provider": provider,
            "consumer": $rootScope.loggedIn.username,
            "dateTime": dateTime,
            "comments": comments
        }
        console.log(JSON.stringify(request));
        $timeout(function() {
            console.log(JSON.stringify(request));
            DBFactory.addRequest(request);
            //$scope.closeRegistration();
        }, 500);
    };
})

.controller('ConRequestsCtrl', function($scope, $rootScope, $stateParams, $timeout, $ionicModal, DBFactory) {
    $scope.myRequests = [];
    DBFactory.listConRequests($rootScope.loggedIn.username).then(function(conRequests) {
        for (var i = 0; i < conRequests.length; ++i) {
            $scope.myRequests.push({
                "id": conRequests[i].id,
                "provider": conRequests[i].provider,
                "consumer": conRequests[i].consumer,
                "type": conRequests[i].type,
                "dateTime": conRequests[i].dateTime,
                "comments": conRequests[i].comments,
                "status": conRequests[i].status,
                "fees": conRequests[i].fees
            });
        }
    });

    $ionicModal.fromTemplateUrl('templates/servicedetails.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.serviceModal = modal;
    });

    $scope.showServiceDetails = function(id) {
        DBFactory.getRequest(id).then(function(request) {
            if (request != null) {
                $scope.request = {
                    "id": request.id,
                    "provider": request.provider,
                    "consumer": request.consumer,
                    "fees": request.fees,
                    "paid": request.paid,
                    "received": request.received,
                    "status": request.status,
                    "dateTime": request.dateTime,
                    "comments": request.comments
                };
                $scope.serviceModal.show();
            }
        });
    };

    $scope.closeServiceDetails = function() {
        $scope.serviceModal.hide();
    };

    $scope.updateService = function() {
        $timeout(function() {
            var paid = $scope.request.paid;
            var received = $scope.request.received;
            if ($scope.request.payment == "paid") {
                paid = 1;
            }
            if ($scope.request.payment == "received") {
                received = 1;
            }
            DBFactory.updateRequest($scope.request.id, $scope.request.status, $scope.request.fees, paid, received).then(function() {
                $scope.closeServiceDetails();
            });
        }, 500);
    };

})

.controller('ProRequestsCtrl', function($scope, $rootScope, $stateParams, $timeout, $ionicModal, DBFactory) {
    $scope.myRequests = [];
    DBFactory.listProRequests($rootScope.loggedIn.username).then(function(proRequests) {
        for (var i = 0; i < proRequests.length; ++i) {
            $scope.myRequests.push({
                "id": proRequests[i].id,
                "provider": proRequests[i].provider,
                "consumer": proRequests[i].consumer,
                "type": proRequests[i].type,
                "dateTime": proRequests[i].dateTime,
                "comments": proRequests[i].comments,
                "status": proRequests[i].status,
                "fees": proRequests[i].fees
            });
        }
    });

    $ionicModal.fromTemplateUrl('templates/servicedetails.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.serviceModal = modal;
    });

    $scope.showServiceDetails = function(id) {
        DBFactory.getRequest(id).then(function(request) {
            if (request != null) {
                $scope.request = {
                    "id": request.id,
                    "provider": request.provider,
                    "consumer": request.consumer,
                    "fees": request.fees,
                    "paid": request.paid,
                    "received": request.received,
                    "status": request.status,
                    "dateTime": request.dateTime,
                    "comments": request.comments
                };
                $scope.serviceModal.show();
            }
        });
    };

    $scope.closeServiceDetails = function() {
        $scope.serviceModal.hide();
    };

    $scope.updateService = function() {
        $timeout(function() {
            //alert($scope.request.rating)
            var paid = $scope.request.paid;
            var received = $scope.request.received;
            if ($scope.request.payment == "paid") {
                paid = 1;
            }
            if ($scope.request.payment == "received") {
                received = 1;
            }
            DBFactory.updateRequest($scope.request.id, $scope.request.status, $scope.request.fees, paid, received).then(function() {
                $scope.closeServiceDetails();
            });
        }, 500);
    };
})

.controller('AlertsCtrl', function() {

})