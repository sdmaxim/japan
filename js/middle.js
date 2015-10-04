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
		$container : {},
      sMass : new Array(), //Места нахождения блоков
      bMass : new Array(), //Величины блоков
      pMass : new Array(), //Найденные блоки
      sField : new Array(),
      nVar : 0
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

   //Количество блоков и свободных клеток (длина перебора) в строке
   var getQuanBlocksFreeCells = function (lineX, lineY) {
      var inputInd, blocks = 0, freeCells = 0, pieceLen, fieldLength;
      //Вычислаем реальный номер строки
      lineX = lineX + (!(!(lineX))+0)*(configMap.qBlocks-1);
      lineY = lineY + (!(!(lineY))+0)*(configMap.qBlocks-1);
      for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd--) {
         x = lineX + (!(lineX)+0)*inputInd;
         y = lineY + (!(lineY)+0)*inputInd;
         pieceLen = field[y][x].number;
         if (pieceLen > 0) {
            stateMap.bMass[blocks] = pieceLen;
            stateMap.sMass[blocks] = 0;
            console.log(pieceLen + " ");
            freeCells += pieceLen;
            blocks++;
         } else {
            break;
         }
      }
      fieldLength = (!(!(lineX))+0)*configMap.height + (!(!(lineY))+0)*configMap.width;
      freeCells -= 1; //Сумма лишней длины блоков с пробелами, послед. пробел не учит
      freeCells = fieldLength - freeCells; // Длина строки без лишнего
      freeCells -= blocks - 1; //Кол-во свобод. клеток для каждого блока
      return {
         blocks : blocks,
         freeCells : freeCells
      }
   }

   var showBlock = function (length, type) {
      var s = "", symbol;
      switch (type) {
         case "block" : symbol = "1"; break;
         case "free" : symbol = "0"; break;
      }
      for (i = 0; i < length; i++) {
         s += symbol;
      }
      return s;
   }

   //Перебор вариантов
   var goSearch = function (lineX, lineY, nBlock, freeCells) {
      if (nBlock < 0) return;
      if (freeCells < 0) return;
      stateMap.sMass[nBlock] = 0;
      while (stateMap.sMass[nBlock] < freeCells) {
         goSearch(lineX, lineY, nBlock-1, freeCells - stateMap.sMass[nBlock]);
         if (nBlock == 0) {
            //Вариант сформирован, можно использовать
            stateMap.nVar++;
            console.log(stateMap.nVar + " : " + 
               showBlock(stateMap.sMass[0], "free") + showBlock(stateMap.bMass[0], "block") + "|" +
               showBlock(stateMap.sMass[1], "free") + showBlock(stateMap.bMass[1], "block") + "|" +
               showBlock(stateMap.sMass[2], "free") + showBlock(stateMap.bMass[2], "block"));
         }
         stateMap.sMass[nBlock]++;
      }
      return;
   }

   var fillString = function (lineX, lineY) {
      var ind, x, y, fieldLength, inputLength, inputInd, fieldInd = 0, pieceInd, pieceLen, freeFlag = true;

      var setCell = function (cellType, ind) {
         if (!(cellType == "line")) {
            ind = configMap.qBlocks + ind;
            fieldInd++;
         }

         x = lineX + (!(lineX)+0)*(ind);
         y = lineY + (!(lineY)+0)*(ind);

         switch (cellType) {
            case "work" : field[y][x].workCell(); break;
            case "free" : field[y][x].freeCell(); break;
            case "line" : pieceLen = field[y][x].number; break;
         }
      }

      //X или Y должен быть равен 0, оба не могут быть равны и меньше нуля
      if (lineX > 0 && lineY > 0) return false;
      if (lineX < 0 || lineY < 0) return false;
      if (lineX == 0 && lineY == 0) return false;
      if (lineX < configMap.qBlocks && lineY < configMap.qBlocks) return false;
      
      fieldLength = (!(!(lineY))+0)*configMap.width + (!(!(lineX))+0)*configMap.height;

      for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd--) {
         setCell("line", inputInd);
         if (!(pieceLen > 0)) {
            freeFlag = false;
            break;
         }
         for (pieceInd = pieceLen; pieceInd > 0; pieceInd--) {
            setCell("work", fieldInd);
         }
         if (pieceLen > 0 && fieldInd < fieldLength) {
            setCell("free", fieldInd);
         }
      }
      if (!freeFlag) {
         while (fieldInd < fieldLength) {
            setCell("free", fieldInd);
         }
      }
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
   }
 
   //Коструктор ячейки поля
   var Cell = function (xCell, yCell) {
      var type, x, y, fieldLength, inputLength;

      this.$cell = {};
      this.number = null;
      this.numA = null;
      this.numB = null;

      this.workCell = function () {
         if (type == FREE) {
            this.$cell.toggleClass('work');
            type = WORK;
            this.number = 1;
         }
      }
      this.freeCell = function () {
         if (type == WORK) {
            this.$cell.toggleClass('freecell');
            type = FREE;
            this.number = 0;
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
               class : "work"
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
      initField   : initField,
      fillString  : fillString,
      getQuanBlocksFreeCells : getQuanBlocksFreeCells,
      goSearch : goSearch
   }
}());