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
	},
   //Типы ячеек
   ZERO = 0, TOP = 1, LEFT = 2, WORK = 3, FREE = 4,
   margineCss = 2;

   var getCellType = function (iCell, jCell) {
      if (iCell < configMap.qBlocks && jCell >= configMap.qBlocks) {
         return TOP;
      }
      if (iCell >= configMap.qBlocks && jCell < configMap.qBlocks) {
         return LEFT;
      }
      if (iCell > 0 && jCell > 0) {
         if (iCell < configMap.qBlocks && jCell < configMap.qBlocks) {
            return ZERO;
         }
         return WORK;
      }
      return false; 
   }

   var initField = function (options) {
      setConfigMap(options);

      var width = configMap.width;
      var height = configMap.height;
      var qBlocks = configMap.qBlocks;

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
            if (getCellType(i, j) > ZERO) {
               cellConf.i = i;
               cellConf.j = j;
               field[i][j] = new Cell(cellConf);
            }
         }
      }
   }

   var getIInd = function(iCell, jCell, iInc, jInc, cellInd) {
      return iCell*jInc + cellInd*iInc;
   }

   var getJInd = function(iCell, jCell, iInc, jInc, cellInd) {
      return jCell*iInc + cellInd*jInc;
   }

   //Проверка суммы уже введенных чисел в ячейки с новым числом
   var checkSumLength = function (iCell, jCell, num) {
      var i, j, sum = num, quan = 1, stringBoxsSize = 0, iInc = 0, jInc = 0, cellInd = 0, thisCell = 0, freeCellInd = 0;
      
      //Число должно быть больше нуля
      if (!(num > 0)) return null;

      switch (getCellType(iCell, jCell)) {
         case TOP: 
            iInc = 1;
            jInc = 0;
            stringBoxsSize = configMap.width;
         break;
         case LEFT:
            iInc = 0;
            jInc = 1;
            stringBoxsSize = configMap.height;
         break;
      }

      //Суммирование данной строки чисел
      for (cellInd = 0; cellInd < configMap.qBlocks; cellInd++) {
         i = getIInd(iCell, jCell, iInc, jInc, cellInd);
         j = getJInd(iCell, jCell, iInc, jInc, cellInd);

         if (i != iCell || j != jCell) {
            sum += field[i][j].number;
            if (field[i][j].number > 0) {
               quan++;
            }
         }
      }

      //Если сумма в строке + мин. отступы превышает длину строки = null
      if (!((sum + quan - 1) <= stringBoxsSize)) {
         return null;
      }

      //Удаление пустых клеток
      for (freeCellInd = configMap.qBlocks - 1; freeCellInd > 0; freeCellInd--) {
         i = getIInd(iCell, jCell, iInc, jInc, freeCellInd);
         j = getJInd(iCell, jCell, iInc, jInc, freeCellInd);

         thisCell = field[i][j].number;
         if (!(thisCell > 0)) {
            for (cellInd = freeCellInd - 1; cellInd >= 0; cellInd --) {
               i = getIInd(iCell, jCell, iInc, jInc, cellInd);
               j = getJInd(iCell, jCell, iInc, jInc, cellInd);
               thisCell = field[i][j].number;
               if (thisCell > 0) {
                  field[i][j].setNum(null, false);
                  i = getIInd(iCell, jCell, iInc, jInc, freeCellInd);
                  j = getJInd(iCell, jCell, iInc, jInc, freeCellInd);
                  field[i][j].setNum(thisCell, false);
                  break;
               }
            }
         }
      }

      return num;
   }
 
   //Коструктор ячейки поля
   var Cell = function (options) {
      var iCell = options.i;
      var jCell = options.j;
      var condition = "";
      this.$cell = {};
      this.number = null;
      this.type = 0;

      this.workCell = function () {
         if (getCellType(iCell, jCell) >= WORK) {
            jqueryMap.$field.toggleClass('.work');
            this.type = WORK;
         }
      }
      this.freeCell = function () {
         if (getCellType(iCell, jCell) >= WORK) {
            jqueryMap.$field.toggleClass('.freecell');
            this.type = FREE;
         }
      }

      //Установка числа в ячейку
      this.setNum = function (num, checkNum) {
         if (checkNum) {
            num = Number(num.replace(/\D+/g,""));
            this.number = num;
            this.$cell.val(num);
            num = checkSumLength(iCell, jCell, num);
         }
         this.number = num;
         this.$cell.val(num);
      }

      var handleFocus = function(that) {
         that.data.setNum($(this).val(), true);
      }

      //Выбор между рабочими и управляющими ячейками
      switch (getCellType(iCell, jCell)) {
         case TOP:
         case LEFT:
            this.$cell = $('<input>', {
               class : "input",
               text  : ""
            });
            this.$cell.focusout(this, handleFocus);
         break;
         case WORK:
            this.$cell = $('<div>', {
               class : "freecell"
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