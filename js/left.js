left = (function () {
	var
	configMap = {
		main_html : String()
			+ '<div class="left-init"></div>'
			+ '<div class="left-management"></div>',
		setSizeForm : String()
			+ '<form>'
				+ 'Ширина<input type="text" name="width">'
				+ 'Высота<input type="text" name="height">'
				+ 'Макс кол-во<input type="text" name="qBlocks">'
			+ '</form>'
	},
	stateMap = {
		$container : {}
	},
	jqueryMap = {
		$setSizeForm : {},
		$setSize : {
			width : {},
			height : {},
			qBlocks : {}
		},
		$menu    : {}
	},
	menuList = [
		{	name: "Задать",		action: "setField"},
		{	name: "Решить",		action: "solve"}
		/*{	name: "Из базы",	action: "getData"},
		{	name: "Записать",	action: "setData"},
		{	name: "Очистить",	action: "clear"}*/
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
				width : jqueryMap.$setSize.width.val(),
				height : jqueryMap.$setSize.height.val(),
				qBlocks : jqueryMap.$setSize.qBlocks.val()
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

	var setJqueryMap = function () {
		var $container = stateMap.$container;
		jqueryMap.$setSizeForm = $container.find('.left-init');
		jqueryMap.$menu = $container.find('.left-management');
		jqueryMap.$setSizeForm.append( configMap.setSizeForm );
		jqueryMap.$setSize.width = $container.find('input[name=width]');
		jqueryMap.$setSize.height = $container.find('input[name=height]');
		jqueryMap.$setSize.qBlocks = $container.find('input[name=qBlocks]');
	}

	var initModule = function ($container) {
		$container.append( configMap.main_html );
		stateMap.$container = $container;
		setJqueryMap();
		renderMenu();
	}

	return { initModule : initModule };
}());
