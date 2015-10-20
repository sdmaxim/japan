shell = (function () {
	'use strict';

	var
		configMap = {
			main_html : String()
				+ '<div class="header">Уменьшение количества точек GPS трекинга. Чем больше угол тем больше будет пропущено точек. Скрипт учитывает затяжные плавные повороты с углом меньшим заданному. Синие точки - пропущенные, Красные оставленные</div>'
				+ '<div id="left"></div>'
				+ '<div id="middle"></div>'
		},
		stateMap = {
			$container : {},
			quan : 0
		},
		jqueryMap = {
			$left : {}
		};

	//Обработчик кнопок
	var buttonHandler = function (event, msg_map){	
		var line1 = 0;	
		switch (msg_map.action) {
			case 'draw'		: middle.initField(msg_map.data); break;
			case 'clear'	: middle.clearField(); break;
		};
	};

	//Задание карты JQuery
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
	};

	return { initModule : initModule };

}());
