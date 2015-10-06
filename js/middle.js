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
      blocksLocation : new Array(), //Места нахождения блоков в примитивном переборе, ххх, хх х, х хх, х х х
      lengthBloks : new Array(), //Размеры блоков, 1 3 2 5
      tempPermanentLine : new Array(), //Временная строка с точно найденными ячейками
      qBlocks : 0, //Кол-во блоков в строке
      stringLength : 0, //Длина строки
      nVar : 0
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

   //Установить точно найденное значение ячейки
   var setPermanentCell = function(lineX, lineY, ind, type) {

   }

   var getFieldLength = function(lineX, lineY) {
      stateMap.stringLength = (!(!(lineX))+0)*configMap.height + (!(!(lineY))+0)*configMap.width;
   }

   var getInputLength = function() {
      return configMap.qBlocks;
   }

   //Выдает значение ячейки
   var getFieldNumber = function (lineX, lineY, ind, workWay) { //absPass - false поле с инпутами, true - только рабочее поле
      var x, y;
      if (workWay) {
         lineX = lineX + (!(!(lineX))+0)*(configMap.qBlocks-1);
         lineY = lineY + (!(!(lineY))+0)*(configMap.qBlocks-1);
      }
      x = lineX + (!(lineX)+0)*ind;
      y = lineY + (!(lineY)+0)*ind;
      return field[y][x].number;
   }

   //Количество блоков (blocks) и свободных клеток в строке, первоначальная длина перебора (freeCells)
   var getQuanBlocksFreeCells = function (lineX, lineY) {
      var inputInd, blocks = 0, freeCells = 0, pieceLen, i;
      //Вычислаем реальный номер строки
      for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd--) {
         pieceLen = getFieldNumber(lineX, lineY, inputInd, true);
         if (pieceLen > 0) {
            stateMap.lengthBloks[blocks] = pieceLen;
            stateMap.blocksLocation[blocks] = 0;
            freeCells += pieceLen;
            blocks++;
         } else {
            break;
         }
      }
      
      //Общая длина строки
      getFieldLength(lineX, lineY);

      freeCells -= 1; //Сумма лишней длины блоков с пробелами, послед. пробел не учит
      freeCells = stateMap.stringLength - freeCells; // Длина строки без лишнего
      freeCells -= blocks - 1; //Кол-во свобод. клеток для каждого блока

      stateMap.qBlocks = blocks;
      stateMap.freeCells = freeCells;

      for (i = 0; i < stateMap.stringLength; i++) {
         stateMap.tempPermanentLine[i] = 1; //stateMap.permanentLine[i];
      }
      goSearch(blocks-1, freeCells);
   }

   //Создание блока пустых или полных ячеек
   var makeVarLine = function () {
      var variantLine = new Array();
      var i, s = '', s2 = '', symb, 
      nB, //Счетчик номера блока
      lB; //Счетчик длины блока

      //Инициализируем результир массив
      for (i = 0; i < stateMap.stringLength; i++) {
         variantLine[i] = 0;
      }

      //Наполняем массив блоками
      i = 0;
      for (nB = 0; nB < stateMap.qBlocks; nB++) {
         i += stateMap.blocksLocation[nB];
         for (lB = 0; lB < stateMap.lengthBloks[nB]; lB++) {
            variantLine[i] = 1;
            i++;
         }
         if (nB < stateMap.qBlocks - 1) {
            i++;
         }
      }

      for (i = 0; i < stateMap.stringLength; i++) {
         if(variantLine[i]) {
            symb = 'x';
         } else {
            symb = '.';
         }
         s += symb;

         stateMap.tempPermanentLine[i] = 
         stateMap.tempPermanentLine[i] & 
         variantLine[i];

         if(stateMap.tempPermanentLine[i]) {
            symb = 'x';
         } else {
            symb = '.';
         }
         s2 += symb;
      }
      console.log(s + ' : ' + s2);
   }

   //Перебор примитивных вариантов
   var goSearch = function (nBlock, freeCells) {
      if (nBlock < 0) return;
      if (freeCells < 0) return;
      stateMap.blocksLocation[nBlock] = 0;
      while (stateMap.blocksLocation[nBlock] < freeCells) {
         goSearch(nBlock-1, freeCells - stateMap.blocksLocation[nBlock]);
         if (nBlock == 0) {
            //Вариант сформирован, можно использовать
            stateMap.nVar++;
            makeVarLine();
         }
         stateMap.blocksLocation[nBlock]++;
      }
      return;
   }

   //Вычисление индекса в зависимости от направления и текущего индекса
   var getInd = function(xCell, yCell, ind) {
      var x, y, xInc, yInc, stringLength;
      switch (getCellType(xCell, yCell)) {
         case TOP: 
            xInc = 0;
            yInc = 1;
            stringLength = configMap.width;
         break;
         case LEFT:
            xInc = 1;
            yInc = 0;
            stringLength = configMap.height;
         break;
      }

      inputLength = configMap.qBlocks;

      x = xCell*yInc + ind*xInc;
      y = yCell*xInc + ind*yInc;

      return {
         x : x,
         y : y,
         stringLength : stringLength,
         inputLength : inputLength
      }
   }

   //Тип ячейки в зависимости от ее координат
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
         return FREE;
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
      var type, x, y;
      var stringLength = getFieldLength(xCell, yCell);
      var inputLength = getInputLength();

      this.$cell = {};
      this.number = null;

      this.setCell = function (tp) {
         var className = '';
         if (tp >= FREE) {
            switch(tp) {
               case FREE : className = 'free'; break;
               case BLOCK : className = 'work'; break;
               case SPACE : className = 'space'; break;
            }
            this.type = tp;
         }
         
      }
      this.freeCell = function () {
         if (type >= FREE) {
            this.$cell.toggleClass('free');
            type = FREE;
            this.number = 0;
         }
      }
      this.blockCell = function () {
         if (type >= FREE) {
            this.$cell.toggleClass('work');
            type = BLOCK;
            this.number = 1;
         }
      }
      this.spaceCell = function () {
         if (type >= FREE) {
            this.$cell.toggleClass('space');
            type = SPACE;
            this.number = 2;
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
         stringLength = ind.stringLength;
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
         if (!((sum - 1) <= stringLength)) {
            return null;
         }

         return num;
      }

      //Удаление пустых клеток
      var defrag = function () {
         var thisCell, freeInd, fullInd, ind;
         for (freeInd = configMap.qBlocks - 1; freeInd > 0; freeInd--) {
            
            //getThisInd(freeInd); //подсчет x, y индексов
            thisCell = getFieldNumber(xCell, yCell, freeInd);

            //thisCell = field[y][x].number;
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
         case FREE:
            this.$cell = $('<div>', {
               class : "free"
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
      getQuanBlocksFreeCells : getQuanBlocksFreeCells,
      goSearch : goSearch
   }
}());

//Заполнение рабочего поля в зависимости от инпутов
   /*var fillString = function (lineX, lineY) {
      var ind, x, y, stringLength, inputLength, inputInd, fieldInd = 0, pieceInd, pieceLen, freeFlag = true;

      var setCell = function (cellType, ind) {
         if (!(cellType == "line")) {
            ind = configMap.qBlocks + ind;
            fieldInd++;
         }

         x = lineX + (!(lineX)+0)*(ind);
         y = lineY + (!(lineY)+0)*(ind);

         switch (cellType) {
            case "work" : field[y][x].blockCell(); break;
            case "free" : field[y][x].freeCell(); break;
            case "line" : pieceLen = field[y][x].number; break;
         }
      }

      //X или Y должен быть равен 0, оба не могут быть равны и меньше нуля
      if (lineX > 0 && lineY > 0) return false;
      if (lineX < 0 || lineY < 0) return false;
      if (lineX == 0 && lineY == 0) return false;
      if (lineX < configMap.qBlocks && lineY < configMap.qBlocks) return false;
      
      stringLength = (!(!(lineY))+0)*configMap.width + (!(!(lineX))+0)*configMap.height;

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