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

   //Вычисление индекса в зависимости от направления и текущего индекса
   var getInd = function(xCell, yCell, ind) {
      var x, y, xInc, yInc, fieldLength;
      switch (getCellType(xCell, yCell)) {
         case TOP: 
            xInc = 0;
            yInc = 1;
            fieldLength = configMap.width;
         break;
         case LEFT:
            xInc = 1;
            yInc = 0;
            fieldLength = configMap.height;
         break;
      }

      inputLength = configMap.qBlocks;

      x = xCell*yInc + ind*xInc;
      y = yCell*xInc + ind*yInc;

      return {
         x : x,
         y : y,
         fieldLength : fieldLength,
         inputLength : inputLength
      }
   }

   var getStringMask = function (x, y) {

   }

   var fillString = function (x, y) {
      var ind, fieldLength, inputLength, inputInd, fieldInd;
      x = x + (!(!(x))+0)*configMap.qBlocks;
      y = y + (!(!(y))+0)*configMap.qBlocks;
      ind = getInd(x, y);
      fieldLength = ind.fieldLength;
      inputLength = ind.inputLength;

      /*for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd++) {
      }*/
   }

   var linearSeach = function (x, y) {

   }

   var getCellType = function (xCell, yCell) {
      if (yCell < configMap.qBlocks && xCell >= configMap.qBlocks) {
         return TOP;
      }
      if (yCell >= configMap.qBlocks && xCell < configMap.qBlocks) {
         return LEFT;
      }
      if (xCell > 0 && yCell > 0) {
         if (yCell < configMap.qBlocks && xCell < configMap.qBlocks) {
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
      var x, y;

      jqueryMap.$field.css({
         'width' : fullSmallBoxSize*(width+qBlocks),
         'height' : fullSmallBoxSize*(height+qBlocks)
      });

      for (y = 0; y < height+qBlocks; y++) {
         field[y] = new Array();
         for (x = 0; x < width+qBlocks; x++) {
            if (getCellType(x, y) > ZERO) {
               field[y][x] = new Cell(x, y);
            }
         }
      }

      fillString(5, 0);
   }
 
   //Коструктор ячейки поля
   var Cell = function (xCell, yCell) {
      var type, x, y, fieldLength, inputLength;

      this.$cell = {};
      this.number = null;

      this.workCell = function () {
         if (type == FREE) {
            jqueryMap.$field.toggleClass('.work');
            type = WORK;
         }
      }
      this.freeCell = function () {
         if (type == WORK) {
            jqueryMap.$field.toggleClass('.freecell');
            type = FREE;
         }
      }

      //Установка числа в ячейку
      this.setNum = function (num, checkNum) {
         if (checkNum) {
            num = checkSumLength(num);
         }
            this.number = num;
            this.$cell.val(num);

         if (checkNum) {
            defrag();
         }
      }

      //Вычисление индекса в зависимости от направления и текущего индекса
      var getThisInd = function(ind) {
         ind = getInd(xCell, yCell, ind);
         x = ind.x;
         y = ind.y;
         fieldLength = ind.fieldLength;
         inputLength = ind.inputLength;
      }

      //Перехват окончания ввода числа
      var handleFocus = function(that) {
         that.data.setNum(Number($(this).val().replace(/\D+/g,"")), true);
      }

      //Проверка суммы уже введенных чисел в ячейки с новым числом
      var checkSumLength = function (num) {
         var sum = num+1, indCell, ind;
         
         //Число должно быть больше нуля
         if (!(num > 0)) return null;

         //Суммирование данной строки чисел
         for (indCell = 0; indCell < configMap.qBlocks; indCell++) {
            getThisInd(indCell);

            if (y != yCell || x != xCell) {
               sum += field[y][x].number;
               if (field[y][x].number > 0) {
                  sum++;
               }
            }
         }

         //Если сумма в строке + мин. отступы превышает длину строки = null
         if (!((sum - 1) <= fieldLength)) {
            return null;
         }

         return num;
      }

      //Удаление пустых клеток
      var defrag = function () {
         var thisCell, freeInd, fullInd, ind;
         for (freeInd = configMap.qBlocks - 1; freeInd > 0; freeInd--) {
            
            getThisInd(freeInd); //подсчет x, y индексов
            thisCell = field[y][x].number;
            if (!(thisCell > 0)) {
               for (fullInd = freeInd - 1; fullInd >= 0; fullInd --) {
                  
                  getThisInd(fullInd);
                  thisCell = field[y][x].number;
                  if (thisCell > 0) {
                     
                     field[y][x].setNum(null, false);
                     getThisInd(freeInd);
                     field[y][x].setNum(thisCell, false);
                     freeInd = fullInd + 1;
                     break;
                  }
               }
            }
         }
      }

      //Инициализация ячейки
      type = getCellType(xCell, yCell);
      switch (type) {
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
      if (type != ZERO) {
         this.$cell.appendTo( jqueryMap.$field );
      }
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