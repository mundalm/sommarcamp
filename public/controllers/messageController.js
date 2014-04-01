function MessageController($scope, MessageFactory, $log, $timeout) {
	// when loading controller, initialize customer list from customerFactory
	init();
	
	function init() {
		$scope.messageStyle = "noDisplay";
		$scope.message = "No message available";	
		$scope.countdownVal = 5;	
	}

	$scope.$on('handleMessage', function() {
		$scope.message = MessageFactory.sharedMessage;
		$scope.messageStyle = MessageFactory.messageStyle;	

		$scope.startTimer();
	});

	$scope.$on('clearAndHide', function() {
		$scope.message = "";
		$scope.messageStyle = "noDisplay"	
	});
	
	$scope.$on('timer-stopped', function (event, data){
		$scope.$apply(function() {
			$scope.messageStyle = "noDisplay";	
			$scope.message = "No message available";
		});
    });
    
    $scope.startTimer = function (){
    	$scope.countdownVal = MessageFactory.countdown;
    	deferedTimerStart(); 
    };

    //This method is needed to make sure that countdown time is set before starting timer
    function deferedTimerStart() {  
     	$timeout(function(){
     		$scope.$broadcast('timer-start');
	    	$scope.timerRunning = true;
     	}, 1000);       
	} 
}

