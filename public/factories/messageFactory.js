function MessageFactory($rootScope) {
	var messageFactory = {};
	
	var sharedMessage = '';
	var messageStyle = '';
	var countdown = 10;
	
	messageFactory.prepareForBroadcast = function(message, style, requestedCountdown) {
		messageFactory.sharedMessage = message;
		messageFactory.messageStyle = style;

		if(requestedCountdown) {
			messageFactory.countdown = requestedCountdown;
		} else {
			messageFactory.countdown = 10;	
		}

		messageFactory.broadCastMessage();
	};
	
	messageFactory.broadCastMessage = function() {
		$rootScope.$broadcast('handleMessage');
	};
		
	return messageFactory;	
}
	      