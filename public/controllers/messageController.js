function MessageController($scope, MessageFactory, $log) {
	// when loading controller, initialize customer list from customerFactory
	init();
	
	function init() {
		$scope.messageStyle = "noDisplay";
		$scope.message = "No message available";	
		$scope.countdownVal = 5;	
		$scope.startTimer();
	}

	$scope.$on('handleMessage', function() {
		$scope.message = MessageFactory.sharedMessage;
		$scope.messageStyle = MessageFactory.messageStyle;	
		$scope.countdownVal = MessageFactory.countdown;

		if(!$scope.$$phase) {
  			$scope.$apply();
		}
		$scope.startTimer();
	});
	
	$scope.$on('timer-stopped', function (event, data){
		$scope.$apply(function() {
			$log.info("Timer stopped");
			$scope.message = "No message available";
			$scope.messageStyle = "noDisplay";	
		});
    });
    
    $scope.startTimer = function (){
    	$log.info($scope.countdownVal);
		$scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };
}

