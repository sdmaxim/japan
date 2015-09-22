middle = (function () {
   var configMap = {
      main_html : String()
         + '<div class="header"></div>'
         + '<div class="field"></div>',
      smallBoxSize : 25,
      width : 0,
      height : 0,
      qBlocks : 0
   },
   field = new Array(),
   stateMap = {
		$container : {}
	},
	jqueryMap = {
		$field : {},
      $header : {}
	}

   var initField = function (options) {
      setConfigMap(options);

      var width = configMap.width;
      var height = configMap.height;
      var qBlocks = configMap.qBlocks;

      var margineCss = 2;
      var smallBoxSize = configMap.smallBoxSize;
      var fullSmallBoxSize = (smallBoxSize+margineCss*2);
      var spaceBoxSize = fullSmallBoxSize*qBlocks - margineCss*2;
      var cellConf = {};
      
      var $spaceBox = $('<div>', {
         class : 'spaceBox'
      }).css({
         'width' : spaceBoxSize,
         'height' : spaceBoxSize
      });
      jqueryMap.$field.empty();
      jqueryMap.$field.append( $spaceBox );

      $spaceBox = jqueryMap.$field.find('spaceBox');
      var margineCssAuto = $spaceBox.css('margin-left');
      var widthCss = $spaceBox.css('width');
      var i, j;

      jqueryMap.$field.css({
         'width' : fullSmallBoxSize*(width+qBlocks),
         'height' : fullSmallBoxSize*(height+qBlocks)
      });

      for (i = 0; i < height+qBlocks; i++) {
         field[i] = new Array();
         for (j = 0; j < width+qBlocks; j++) {
            if ((i >= qBlocks) || (j >= qBlocks)) {
               if ((i < qBlocks) || (j < qBlocks)) {
                  cellConf.type = 'input';
               } else {
                  cellConf.type = 'work';
               }
               cellConf.i = i;
               cellConf.j = j;
               field[i][j] = new Cell(cellConf);
               //field[i, j].init();
            }
         }
      }
   }

   //Проверка суммы уже введенных чисел в ячейки с новым числом
   var checkSumLength = function (iCell, jCell, num) {
      var i, j, sum = num, quan = 1, stringBoxsSize = 0;
      
      //Число должно быть больше нуля
      if (!(num > 0)) return null;

      //Суммирование данной строки чисел
      for (var cellInd = 0; cellInd < configMap.qBlocks; cellInd++) {
         switch (checkWorkCell(iCell, jCell)) {
            case "top": 
               i = cellInd;
               j = jCell;
               stringBoxsSize = configMap.width;
            break;
            case "left":
               j = cellInd; 
               i = iCell;
               stringBoxsSize = configMap.height;
            break;
         }
         if (i != iCell || j != jCell) {
            sum += field[i][j].number;
            if (field[i][j].number > 0) {
               quan++;
            }
         }
      }

      //Если сумма в строке + мин. отступы превышает длину строки = null
      if (!((sum + quan - 1) <= stringBoxsSize)) {
         num = null;
      }
      return num;
   }

   var checkWorkCell = function (iCell, jCell) {
      if (iCell < configMap.qBlocks && jCell >= configMap.qBlocks) {
         return "top";
      }
      if (iCell >= configMap.qBlocks && jCell < configMap.qBlocks) {
         return "left";
      }
      return true;
   }
 
   //Коструктор ячейки поля
   var Cell = function (cellConf) {
      this.type = cellConf.type;
      var iCell = cellConf.i;
      var jCell = cellConf.j;
      this.$cell = {};
      this.number = null;
      var condition = "";

      this.workCell = function () {
         if (checkWorkCell(iCell, jCell)) {
            jqueryMap.$field.toggleClass('.work');
            this.type = "work";
         }
      }
      this.freeCell = function () {
         if (checkWorkCell(iCell, jCell)) {
            jqueryMap.$field.toggleClass('.freecell');
            this.type = "freecell";
         }
      }

      //Установка числа в ячейку
      this.setNum = function (num) {
         num = Number(num.replace(/\D+/g,""));
         this.number = checkSumLength(iCell, jCell, num);
         this.$cell.val(this.number);
      }

      //Выбор между рабочими и управляющими ячейками
      switch (this.type) {
         case 'input' :
            this.$cell = $('<input>', {
               class : "input",
               text  : ""
            });
            this.$cell.focusout(this, function(that) {
               that.data.setNum($(this).val());
            });
         break;
         case 'work' :
            this.$cell = $('<div>', {
               class : "work"
            });
         break;
      };
      this.$cell.appendTo( jqueryMap.$field );
   }

   var setJqueryMap = function () {
      var $container = stateMap.$container;
      jqueryMap.$header = $container.find('.header');
      jqueryMap.$field = $container.find('.field');
   }

   var setConfigMap = function (options) {
      configMap.width = parseInt(options.width, 10);
      configMap.height = parseInt(options.height, 10);
      configMap.qBlocks = parseInt(options.qBlocks, 10);
   }

   var initModule = function ( $container ) {
      $container.append( configMap.main_html );
      stateMap.$container = $container;
      setJqueryMap();
   }

   return {
      initModule  : initModule,
      initField   : initField
   }
}());