left = (function () {
	'use strict';
	var
	configMap = {
		main_html : String()
			+ '<div class="left-init"></div>'
			+ '<div class="left-management"></div>',
		setSizeForm : String()
			+ '<form>'
				+ 'Угол<input type="text" name="maxAngle">'
			+ '</form>'
	},
	stateMap = {
		$container : {}
	},
	jqueryMap = {
		$setSizeForm : {},
		$setSize : {
			maxAngle : {}
		},
		$menu    : {}
	},
	menuList = [
		{	name: "Нарисовать",		action: "draw"},
		{	name: "Очистить",		action: "clear"}
	];

	var button = function (name, action) {
		var htmlButton;

		//Формирование HTML кнопки по частям
		htmlButton = $('<li>', {
			'class' : 'menuitem',
			'action' : action
		});

		htmlButton.click(function () {
			var msg_text = {
				maxAngle : jqueryMap.$setSize.maxAngle.val()
			}
			$.gevent.publish(
				'left-menu',
				[{
					action : $( this ).attr('action'),
					data : msg_text
				}]
			);
		});
		return htmlButton.text( name );
	};

	//Отрисовка меню
	var renderMenu = function () {
		for (var i = 0; i < menuList.length; i++) {
			jqueryMap.$menu.append(button(
				menuList[i].name,
				menuList[i].action
			));
		}
	};

	//Задание карты JQuery
	var setJqueryMap = function () {
		var $container = stateMap.$container;
		jqueryMap.$setSizeForm = $container.find('.left-init');
		jqueryMap.$menu = $container.find('.left-management');
		jqueryMap.$setSizeForm.append( configMap.setSizeForm );
		jqueryMap.$setSize.maxAngle = $container.find('input[name=maxAngle]');
	}

	//Точка входа модуля
	var initModule = function ($container) {
		$container.append( configMap.main_html );
		stateMap.$container = $container;
		setJqueryMap();
		renderMenu();
	}

	return { initModule : initModule };
}());
