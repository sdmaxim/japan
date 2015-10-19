var spa = (function () {
	'use strict';
  var initModule = function ( $container ) {
    shell.initModule( $container );
  };

  return { initModule: initModule };
}());
