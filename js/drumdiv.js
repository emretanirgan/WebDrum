function DrumCtrl($scope){
	$scope.width = 100;
	$scope.height = 50;

	$scope.drumstyle = function() {
		return {
			width: $scope.width + 'px',
			height: $scope.height + 'px'
		};
	};
}