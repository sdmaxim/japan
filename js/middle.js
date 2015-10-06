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
      return ((!(!(lineX))+0)*configMap.height + (!(!(lineY))+0)*configMap.width);
   }

   var getInputLength = function() {
      return configMap.qBlocks;
   }

   var getTrueInd = function (lineX, lineY, ind, workWay) {
      var x, y;
      //Расчет индекса поля
      if (workWay == 'field') {
         lineX = lineX + (!(!(lineX))+0)*(configMap.qBlocks-1);
         lineY = lineY + (!(!(lineY))+0)*(configMap.qBlocks-1);
      } else {
      //Расчет индекса инпута
         lineX = lineX * ((lineX >= configMap.qBlocks)+0);
         lineY = lineY * ((lineY >= configMap.qBlocks)+0);
      }
      x = lineX + (!(lineX)+0)*ind;
      y = lineY + (!(lineY)+0)*ind;

      return {
         x : x,
         y : y
      }
   }

   //Выдает значение ячейки
   var getFieldNumber = function (lineX, lineY, index, workWay) { //absPass - false поле с инпутами, true - только рабочее поле
      var ind;
      ind = getTrueInd(lineX, lineY, index, workWay);
      return field[ind.y][ind.x].number;
   }

   var setFieldNumber = function (lineX, lineY, ind, workWay) { //absPass - false поле с инпутами, true - только рабочее поле
      var ind;
      ind = getTrueInd(lineX, lineY, index, workWay);
      field[ind.y][ind.x].setNum(55);
   }

   //Количество блоков (blocks) и свободных клеток в строке, первоначальная длина перебора (freeCells)
   var getQuanBlocksFreeCells = function (lineX, lineY) {
      var inputInd, blocks = 0, freeCells = 0, pieceLen, i, stringLength;
      //Вычислаем реальный номер строки
      for (inputInd = configMap.qBlocks-1; inputInd >= 0; inputInd--) {
         pieceLen = getFieldNumber(lineX, lineY, inputInd, 'field');
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
      stringLength = getFieldLength(lineX, lineY);

      freeCells -= 1; //Сумма лишней длины блоков с пробелами, послед. пробел не учит
      freeCells = stringLength - freeCells; // Длина строки без лишнего
      freeCells -= blocks - 1; //Кол-во свобод. клеток для каждого блока

      stateMap.qBlocks = blocks;
      stateMap.freeCells = freeCells;

      for (i = 0; i < stringLength; i++) {
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

   //Коструктор ячейки поля
   var Cell = function (xCell, yCell) {
      var x, y;
      var stringLength = getFieldLength(xCell, yCell);
      var inputLength = getInputLength();

      this.type = getCellType(xCell, yCell);
      this.$cell = {};
      this.number = null;

      //Перехват окончания ввода числа
      var handleFocus = function(that) {
         var num = Number($(this).val().replace(/\D+/g,""));
         num = that.data.checkSumLength(num);
         that.data.setNum(num);
         that.data.defrag();
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

      //Проверка суммы уже введенных чисел в ячейки с новым числом
      this.checkSumLength = function (num) {
         var sum = num+1, indCell, ind, stringLength;
         
         //Число должно быть больше нуля
         if (!(num > 0)) return null;

         ind = getTrueInd(xCell, yCell, 0);
         stringLength = getFieldLength(ind.x, ind.y);

         //Суммирование данной строки чисел
         for (indCell = 0; indCell < configMap.qBlocks; indCell++) {
            ind = getTrueInd(xCell, yCell, indCell);
            if (ind.y != yCell || ind.x != xCell) {
               sum += field[ind.y][ind.x].number;
               if (field[ind.y][ind.x].number > 0) {
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

      //Удаление пустых клеток в инпуте
      this.defrag = function () {
         var thisCell, freeInd, fullInd, ind;
         for (freeInd = configMap.qBlocks - 1; freeInd > 0; freeInd--) {
            if (!(getFieldNumber(xCell, yCell, freeInd) > 0)) {
               for (fullInd = freeInd - 1; fullInd >= 0; fullInd --) {
                  thisCell = getFieldNumber(xCell, yCell, fullInd);
                  if (thisCell > 0) {

                     ind = getTrueInd(xCell, yCell, fullInd);
                     field[ind.y][ind.x].setNum(null);

                     ind = getTrueInd(xCell, yCell, freeInd);
                     field[ind.y][ind.x].setNum(thisCell);

                     freeInd = fullInd + 1;
                     break;
                  }
               }
            }
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