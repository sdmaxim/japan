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
   solveFlag, //Флаг полностью решенного кроссворда, 1 - решено
   //Типы ячеек
   ZERO = 0, //Левый верх. квадрат
   TOP = 1, //Верхние инпуты
   LEFT = 2, //Левые инпуты
   FREE = 3, //Свободные ячейки на поле
   BLOCK = 4, //Точно занятые
   SPACE = 5, //Точно пустые
   margineCss = 2;

   var solve = function () {
      var i, x=0;
      solveFlag = 1;
      //В разработке нужно добавить флаг по которому будет продолжаться повторение
      while (solveFlag && x < 8) {
         solveFlag = 0; x++
         for (i = 0; i < configMap.width + configMap.height; i++) {
            lines[i].getQuanBlocksFreeCells();
            if (lines[i].solveLineFlag) solveFlag = 1;
         }
      }
   }

   var getFieldLength = function(xCell, yCell) {
      return (!!xCell)*configMap.height + (!!yCell)*configMap.width;
   }

   var getTrueInd = function (xCell, yCell, ind, workWay) {
      var x, y, cellInd;

      if (workWay == 'fromLineInd') { //Знаю lineInd
         x = (ind <  configMap.width) * (ind + configMap.qBlocks);
         y = (ind >= configMap.width) * (ind - configMap.width + configMap.qBlocks);
      } else {
         //Расчет индекса поля
         if (workWay == 'field') {
            ind += configMap.qBlocks;
         } else {
         //Расчет индекса инпута
            cellInd = xCell * (xCell < configMap.qBlocks) + yCell * (yCell < configMap.qBlocks);

            xCell = xCell * (xCell >= configMap.qBlocks);
            yCell = yCell * (yCell >= configMap.qBlocks);

            if (workWay == 'toLineInd') { //Знаю xCell, yCell
               x = xCell - (configMap.qBlocks) * (!!xCell);
               y = yCell - (configMap.qBlocks) * (!!yCell);

               return {
                  line : x + y + (!!yCell) * (configMap.width),
                  cell : cellInd
               }
            }
         }
         x = xCell + (!xCell) * ind;
         y = yCell + (!yCell) * ind;
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
      tempBlockLine = new Array(), //Временная строка с точно найденными ячейками блоков
      tempSpaceLine = new Array(), //Временная строка с точно найденными пустотами
      inputLength = 0, //Кол-во блоков в строке
      stringLength = getFieldLength(xCell, yCell), //Текущая длина строки
      variantLine = new Array(), //Временная расстановка блоков
      lineInd = getTrueInd(xCell, yCell, 0, 'toLineInd').line, //индекс линии
      isFree = 0,
      isSpace = 0,
      freeCells;
      this.solveLineFlag; //Флаг законченности нахождения линии, 0 - линия закончена, 1 - есть изменения или незаполн. клетки

      //stringLengthTemp = stringLength;

      this.fillDbData = function () {
         var i = 0;
         while (db.data[lineInd][i] > 0) {
            setCellNumber(configMap.qBlocks-i-1, db.data[lineInd][i]);
            i++;
         }
      }

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
      var setCellNumber = function (index, num, area) {
         var ind;
         ind = getTrueInd(xCell, yCell, index, area);
         field[ind.y][ind.x].setNum(num);
      }

      //Количество блоков (blocks) и свободных клеток в строке, первоначальная длина перебора (freeCells)
      this.getQuanBlocksFreeCells = function () {
         var inputInd, blockInd = 0, pieceLen, i, sumLenghts;
         isFree = 0; isSpace = 0;
         this.fillLine('getFree');
         if (!isFree) {
            this.solveLineFlag = 0;
            return;
         }

         //Вычислаем количество своб клеток
         sumLenghts = 0;
         for (inputInd = 0; inputInd < configMap.qBlocks; inputInd++) {
            pieceLen = getCellNumber(inputInd);
            if (pieceLen > 0) {
               lengthBloks[blockInd] = pieceLen;
               blocksPosition[blockInd] = 0;
               sumLenghts += pieceLen;
               blockInd++;
            }
         }

         //Количество свободных клеток для перемещения
         freeCells = stringLength - sumLenghts - blockInd + 2 - isSpace;
         inputLength = blockInd;

         this.fillLine('initTemp');
         //Начинаем перебор вариантов в строке
         this.goSearch(blockInd-1, freeCells);
         this.solveLineFlag = 0;
         this.fillLine('setCell');
      }

      //Перебор примитивных вариантов, примитивные значит без учета длины блока
      this.goSearch = function (nBlock, freeCells) {
         if (nBlock < 0) return true;
         if (freeCells < 0) return true;
         blocksPosition[nBlock] = 0;
         while (blocksPosition[nBlock] < freeCells) {
            if (!this.goSearch(nBlock-1, freeCells - blocksPosition[nBlock])) return false;
            if (nBlock == 0) {
            	//Вариант сформирован, можно использовать
            	//Здесь нужно обработать makeVarLine False
            	if (!this.makeVarLine()) return false; 
            } 
            blocksPosition[nBlock]++;
         }
         return true;
      }

      this.fillLine = function (type) {
         var i, tempI, s = '', s2 = '', s3 = '', symb, cellNum, 
            isSpaceFlagFirst = 0, isSpaceFlagLast = 0, isSpaceFirst = 0, isSpaceLast = 0, 
            tempSpaceLineFlag = 1, tempBlockLineFlag = 0,
            nB, //Счетчик номера блока
            lB; //Счетчик длины блока

         //Заполняем массив блоками согласно варианту
         if (type == 'fill') {
            i = 0;
            for (nB = 0; nB < inputLength; nB++) {
               tempI = blocksPosition[nB];
               while (tempI > 0) {
                  if (variantLine[i] != 2) {
                     tempI--;
                  }
                  i++;
               }
               for (lB = 0; lB < lengthBloks[nB]; lB++) {
                  while (variantLine[i] == 2 && i < stringLength) i++;
                  if (i == stringLength) break;
                  variantLine[i] = 1;
                  i++;
               }
               if (nB < inputLength - 1) i++;
            }
            return;
         }

         lB = 0; nB = 0;
         for (i = 0; i < stringLength; i++) {
            cellNum = getCellNumber(i, 'field');
            switch (type) {
               //Инициализируем временный массив
               case 'initVar' : 
                  variantLine[i] = cellNum;
               break;

               //Проверка на наличие пустых ячеек
               case 'getFree' :
                  if (!cellNum) isFree++;

                  if (cellNum == 2 && !isSpaceFlagFirst) {
                     isSpaceFirst++;
                  } else {
                     isSpaceFlagFirst++;
                  }

                  if (getCellNumber(stringLength-i-1, 'field') == 2 && !isSpaceFlagLast) {
                     isSpaceLast++;
                  } else {
                     isSpaceFlagLast++;
                  }

                  isSpace = isSpaceFirst + isSpaceLast;

               break;

               //Инициализируем результирующий массив
               case 'initTemp' : 
                  tempBlockLine[i] = 1;
                  tempSpaceLine[i] = 0;
               break;

               //Заполняем поле найденными единицами + Заполняем поле найденными нулями
               case 'setCell' : 
                  if (cellNum > 0) break;
                  this.solveLineFlag = 1; //Установка флага сообщающего что линия изменилась или имеет свободные клетки
                  if (tempBlockLine[i]) setCellNumber(i, 1, 'field');
                  if (!tempSpaceLine[i]) setCellNumber(i, 2, 'field');
               break;

               //Слияние перманента и текущего варианта для проверки правильности растановки в данном варианте
               case 'merg' : 
                  if (cellNum == 1) variantLine[i] |= 1;
                  if (cellNum == 2 && variantLine[i] == 1) return false;
               break;

               //Проверка слияния на корректность, отсеиваем неверные варианты
               case 'check' : 
                  if (variantLine[i] == 1) {
                     lB++;
                  } 
                  if (i == stringLength-1 || !(variantLine[i] == 1)) {
                     if (lB > 0) {
                        if (lengthBloks[nB] != lB) return false;
                        nB++;
                        if (nB > inputLength) i = stringLength;
                     }
                     lB = 0;
                  } 
               break;

               //Просеиваем (sift), находим столбик единиц из всех вариантов
               case 'sift' : 
                  tempBlockLine[i] &= (variantLine[i] == 1); //0 и 2 воспринимаеться как 0
                  tempSpaceLine[i] |= variantLine[i];
                  tempBlockLineFlag |= !!tempBlockLine[i];
                  tempSpaceLineFlag &= !!tempSpaceLine[i];
                  /*s += !!(variantLine[i])*1;
                  s2 += tempBlockLine[i];
                  s3 += tempSpaceLine[i];*/
               break;
            }
         }

         if (type == 'sift') {
            /*console.log(lineInd + " vl:" + s + " bl:" + s2 + " sl:" + s3 + " bf:" 
            	+ tempBlockLineFlag + " sf:" + tempSpaceLineFlag + " sumf:" + 
            	(!tempBlockLineFlag && tempSpaceLineFlag));*/
            	if (!tempBlockLineFlag && tempSpaceLineFlag) return false;
         }
         return true;
      }

      //Создание блока пустых или полных ячеек
      this.makeVarLine = function () {
         this.fillLine('initVar');
         this.fillLine('fill');
         if (this.fillLine('check')) {
            if (!this.fillLine('sift')) return false;
         }
         return true;
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

                  setCellNumber(fullInd, null, 'field');
                  setCellNumber(freeInd, thisCell, 'field');

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
         var className = null;
         if (this.type >= FREE) {
            switch(num+FREE) {
               case FREE : className = 'free'; break;
               case BLOCK : className = 'work'; break;
               case SPACE : className = 'space'; break;
            }
            if (className) {
               this.$cell.removeClass();
               this.$cell.addClass(className);
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
         lines[lineInd].fillDbData();
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
      solve : solve
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