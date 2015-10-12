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
   lines = new Array(),
   stateMap = {
		$container : {},
	},
	jqueryMap = {
		$field : {},
      $header : {}
	},
   //Типы ячеек
   ZERO = 0, //Левый верх. квадрат
   TOP = 1, //Верхние инпуты
   LEFT = 2, //Левые инпуты
   FREE = 3, //Свободные ячейки на поле
   BLOCK = 4, //Точно занятые
   SPACE = 5 //Точно пустые
   margineCss = 2;

   var getFieldLength = function(xCell, yCell) {
      return ((!(!(xCell))+0)*configMap.height + (!(!(yCell))+0)*configMap.width);
   }

   var getTrueInd = function (xCell, yCell, ind, workWay) {
      var x, y, cellInd;

      if (workWay == 'fromLineInd') { //Знаю lineInd
         x = ((ind <  configMap.width) + 0) * (ind + configMap.qBlocks);
         y = ((ind >= configMap.width) + 0) * (ind - configMap.width + configMap.qBlocks);
      } else {
         //Расчет индекса поля
         if (workWay == 'field') {
            xCell = xCell + (!(!(xCell)) + 0) * (configMap.qBlocks - 1);
            yCell = yCell + (!(!(yCell)) + 0) * (configMap.qBlocks - 1);
         } else {
         //Расчет индекса инпута
            cellInd = xCell * ((xCell < configMap.qBlocks) + 0) + yCell * ((yCell < configMap.qBlocks) + 0);

            xCell = xCell * ((xCell >= configMap.qBlocks) + 0);
            yCell = yCell * ((yCell >= configMap.qBlocks) + 0);

            if (workWay == 'toLineInd') { //Знаю xCell, yCell
               x = xCell - (configMap.qBlocks) * (!(!(xCell)) + 0);
               y = yCell - (configMap.qBlocks) * (!(!(yCell)) + 0);

               return {
                  line : x + y + (!(!(yCell)) + 0) * (configMap.width),
                  cell : cellInd
               }
            }

         }
         x = xCell + (!(xCell) + 0) * ind;
         y = yCell + (!(yCell) + 0) * ind;
      }

      return {
         x : x,
         y : y
      }
   }

   //Конструктор линии, с функциями перебора
   var Line = function (xCell, yCell) {
      var 
      blocksPosition = new Array(), //Места нахождения блоков в примитивном переборе, ххх, хх х, х хх, х х х
      lengthBloks = new Array(), //Размеры блоков, 1 3 2 5
      tempPermanentLine = new Array(), //Временная строка с точно найденными ячейками
      inputLength = 0, //Кол-во блоков в строке
      stringLength = getFieldLength(xCell, yCell), //Текущая длина строки
      variantLine = new Array(), //Временная расстановка блоков
      freeCells = 0;

      var getInd = function (ind) {
         return getTrueInd(xCell, yCell, ind, '');
      }

      //Выдает значение ячейки
      var getCellNumber = function (index, area) { //area - поле в котром нужно найти ячейку
         var ind;
         if (!area) area = '';
         ind = getTrueInd(xCell, yCell, index, area);
         return field[ind.y][ind.x].number;
      }

      //Установка значения ячейки
      var setCellNumber = function (index, num) {
         var ind;
         ind = getTrueInd(xCell, yCell, index, '');
         field[ind.y][ind.x].setNum(num);
      }

      //Количество блоков (blocks) и свободных клеток в строке, первоначальная длина перебора (freeCells)
      this.getQuanBlocksFreeCells = function () {
         var inputInd, blockInd = 0, pieceLen, i;
         //Вычислаем реальный номер строки
         for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd--) {
            pieceLen = getCellNumber(inputInd);
            if (pieceLen > 0) {
               lengthBloks[blockInd] = pieceLen;
               blocksPosition[blockInd] = 0;
               freeCells += pieceLen;
               blockInd++;
            } else {
               break;
            }
         }

         //Количество свободных клеток для перемещения
         freeCells = stringLength - freeCells - blockInd + 2;
         inputLength = blockInd;

         for (i = 0; i < stringLength; i++) tempPermanentLine[i] = 1;
         goSearch(blockInd-1, freeCells);
      }

      //Создание блока пустых или полных ячеек
      var makeVarLine = function () {
         var i, s = '', s2 = '', symb,
         nB, //Счетчик номера блока
         lB; //Счетчик длины блока

         //Инициализируем результирующий массив
         for (i = 0; i < stringLength; i++) variantLine[i] = 0;

         //Наполняем массив блоками
         i = 0;
         for (nB = 0; nB < inputLength; nB++) {
            i += blocksPosition[nB];
            for (lB = 0; lB < lengthBloks[nB]; lB++) {
               variantLine[i] = 1;
               i++;
            }
            if (nB < inputLength - 1) i++;
         }

         //Слияние перманента и текущего варианта для проверки правильности растановки в данном варианте
         for (i = 0; i < stringLength; i++) {
            variantLine[i] |= getCellNumber(i, 'field');
         }

         //Находим столбик единиц из всех вариантов
         for (i = 0; i < stringLength; i++) {
            symb = (variantLine[i]) ? 'x' : '.'
            s += symb;

            tempPermanentLine[i] &= variantLine[i];

            symb = (tempPermanentLine[i]) ? 'x' : '.'
            s2 += symb;
         }

         /*for (i = 0; i < stringLength; i++) {
            setCellNumber(tempPermanentLine[i]);
         }*/
         console.log(s + ' : ' + s2);
      }

      //Перебор примитивных вариантов, примитивные значит без учета длины блока
      var goSearch = function (nBlock, freeCells) {
         if (nBlock < 0) return;
         if (freeCells < 0) return;
         blocksPosition[nBlock] = 0;
         while (blocksPosition[nBlock] < freeCells) {
            goSearch(nBlock-1, freeCells - blocksPosition[nBlock]);
            if (nBlock == 0) makeVarLine(); //Вариант сформирован, можно использовать
            blocksPosition[nBlock]++;
         }
         return;
      }

      //Проверка суммы уже введенных чисел в ячейки с новым числом
      this.checkSumLength = function (num, thisCellInd) {
         var sum = num+1, cellInd, cellIndNum;
         
         //Число должно быть больше нуля
         if (!(num > 0)) return null;

         //Суммирование данной строки чисел
         for (cellInd = 0; cellInd < configMap.qBlocks; cellInd++) {
            cellIndNum = getCellNumber(cellInd);
            if (cellInd != thisCellInd && cellIndNum > 0) {
               sum += cellIndNum + 1;
            }
         }

         //Если сумма в строке + мин. отступы превышает длину строки = null
         if ((sum - 1) > stringLength) return null;
         return num;
      }

      //Удаление пустых клеток в инпуте
      this.defrag = function () {
         var thisCell, freeInd, fullInd;
         for (freeInd = configMap.qBlocks - 1; freeInd > 0; freeInd--) {
            if (getCellNumber(freeInd) > 0) continue;

            for (fullInd = freeInd - 1; fullInd >= 0; fullInd --) {
               thisCell = getCellNumber(fullInd);
               if (thisCell > 0) {

                  setCellNumber(fullInd, null);
                  setCellNumber(freeInd, thisCell);

                  freeInd = fullInd + 1;
                  break;
               }
            }
         }
      }
   }

   //Тип ячейки в зависимости от ее координат
   var getCellType = function (xCell, yCell) {
      var qBlocks = configMap.qBlocks;
      if (yCell < qBlocks && xCell < qBlocks) return ZERO;
      if (yCell < qBlocks && xCell >= qBlocks) return TOP;
      if (yCell >= qBlocks && xCell < qBlocks) return LEFT;
      if (!(xCell > 0 && yCell > 0)) return false;
      return FREE;
   }

   //Коструктор ячейки поля
   var Cell = function (xCell, yCell) {
      var x, y;
      var stringLength = getFieldLength(xCell, yCell);

      this.xCell = xCell;
      this.yCell = yCell;
      this.type = getCellType(xCell, yCell);
      this.$cell = {};
      this.number = null;

      //Перехват окончания ввода числа
      var handleFocus = function(that) {
         var num = Number($(this).val().replace(/\D+/g,""));
         var xCell = that.data.xCell;
         var yCell = that.data.yCell;
         var ind;

         ind = getTrueInd (xCell, yCell, 0, 'toLineInd');
         num = lines[ind.line].checkSumLength(num, ind.cell);
         that.data.setNum(num);
         lines[ind.line].defrag();
      }

      //Инициализация ячейки
      switch (this.type) {
         case TOP:
         case LEFT:
            this.$cell = $('<input>', {
               class : "input",
               text  : ""
            });
            this.$cell.focusout(this, handleFocus);
         break;
         case FREE:
            this.$cell = $('<div>', {
               class : "free"
            });
         break;
      };
      if (this.type != ZERO) {
         this.$cell.appendTo( jqueryMap.$field );
      }

      //Установка числа в ячейку
      this.setNum = function (num) {
         var className;
         if (this.type >= FREE) {
            switch(num+FREE) {
               case FREE : className = 'free'; break;
               case BLOCK : className = 'work'; break;
               case SPACE : className = 'space'; break;
            }
            if (className) {
               this.$cell.toggleClass('free');
               this.type = num+FREE;
               this.number = num;
            }
         } else {
            this.number = num;
            this.$cell.val(num);
         }
      }
   }

   //Инициализация поля с клетками
   var initField = function (options) {
      setConfigMap(options);

      var width = configMap.width;
      var height = configMap.height;
      var qBlocks = configMap.qBlocks;

      var smallBoxSize = configMap.smallBoxSize;
      var fullSmallBoxSize = (smallBoxSize+margineCss*2);
      var spaceBoxSize = fullSmallBoxSize*qBlocks - margineCss*2;
      var lineInd, ind;
      
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
            if (getCellType(x, y) <= ZERO) continue;
            field[y][x] = new Cell(x, y);
         }
      }

      for (lineInd = 0; lineInd < height + width; lineInd++) {
         ind = getTrueInd (0, 0, lineInd, 'fromLineInd');
         lines[lineInd] = new Line(ind.x, ind.y);
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
      lines : lines
   }
}());

//Заполнение рабочего поля в зависимости от инпутов
   /*var fillString = function (xCell, yCell) {
      var ind, x, y, stringLength, inputLength, inputInd, fieldInd = 0, pieceInd, pieceLen, freeFlag = true;

      var setCell = function (cellType, ind) {
         if (!(cellType == "line")) {
            ind = configMap.qBlocks + ind;
            fieldInd++;
         }

         x = xCell + (!(xCell)+0)*(ind);
         y = yCell + (!(yCell)+0)*(ind);

         switch (cellType) {
            case "work" : field[y][x].blockCell(); break;
            case "free" : field[y][x].freeCell(); break;
            case "line" : pieceLen = field[y][x].number; break;
         }
      }

      //X или Y должен быть равен 0, оба не могут быть равны и меньше нуля
      if (xCell > 0 && yCell > 0) return false;
      if (xCell < 0 || yCell < 0) return false;
      if (xCell == 0 && yCell == 0) return false;
      if (xCell < configMap.qBlocks && yCell < configMap.qBlocks) return false;
      
      stringLength = (!(!(yCell))+0)*configMap.width + (!(!(xCell))+0)*configMap.height;

      for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd--) {
         setCell("line", inputInd);
         if (!(pieceLen > 0)) {
            freeFlag = false;
            break;
         }
         for (pieceInd = pieceLen; pieceInd > 0; pieceInd--) {
            setCell("work", fieldInd);
         }
         if (pieceLen > 0 && fieldInd < stringLength) {
            setCell("free", fieldInd);
         }
      }
      if (!freeFlag) {
         while (fieldInd < stringLength) {
            setCell("free", fieldInd);
         }
      }
   }*/