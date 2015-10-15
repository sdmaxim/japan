shell = (function () {
	'use strict';

	var
		configMap = {
			main_html : String() +
				'<div id="left"></div>' +
				'<div id="middle"></div>'
		},
		stateMap = {
			$container : {},
			quan : 0
		},
		jqueryMap = {
			$left : {}
		};

	var getHash = function() {
		return location.hash.split(conf.hashTag)[1];
	};

	//Обработчик изменения хэша
	var onHashChange = function (event){
		var hash = getHash();
	};

	var buttonHandler = function (event, msg_map){	
		var line1 = 0;	
		switch (msg_map.action) {
			case 'setField'	: middle.initField(msg_map.data); break;
			case 'solve'	: middle.solve(); break;
			case 'getData'	: //db.init(); break;
			case 'setData'	: break;
			case 'clear'	: break;
		};
	};

	var setJqueryMap = function () {
		var $container = stateMap.$container;
		jqueryMap.$left = $container.find('#left');
		jqueryMap.$middle = $container.find('#middle');
	};

	//Точка входа модуля
	var initModule = function ( $container ) {
		$container.html( configMap.main_html );
		stateMap.$container = $container;
		setJqueryMap();
		left.initModule( jqueryMap.$left );
		middle.initModule( jqueryMap.$middle );

		$.gevent.subscribe( jqueryMap.$left, 'left-menu',  buttonHandler );
		//left.initModule(configMap.connected_modules.left.$container);
		/*$(window)
			.bind( 'hashchange', onHashchange )
			.trigger( 'hashchange' );*/
	};

	return { initModule : initModule };

}());
