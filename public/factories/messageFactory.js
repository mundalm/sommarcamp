function MessageFactory($rootScope) {
	var messageFactory = {};
	
	var sharedMessage = '';
	var messageStyle = '';
	
	messageFactory.prepareForBroadcast = function(message, style) {
		messageFactory.sharedMessage = message;
		messageFactory.messageStyle = style;
		messageFactory.broadCastMessage();
	};
	
	messageFactory.broadCastMessage = function() {
		$rootScope.$broadcast('handleMessage');
	};
		
	return messageFactory;	
}
	      