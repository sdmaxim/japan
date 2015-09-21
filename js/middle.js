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

   var checkSumLength = function () {
      
   }

   var checkInputNumber = function (val) {
      var num = Number(val.replace(/\D+/g,""));
      if (num > 0) {
         //Проверка на превышение суммы всех инпутовых боксов 
         //высоты/ширины столбца/строки         
      } else {
         num = null;
      }
      return num;
   }

   var Cell = function (cellConf) {
      var type = cellConf.type;
      var iCell = cellConf.i;
      var jCell = cellConf.j;
      var $cell = {};
      this.number = null;
      var condition = "";

      this.show = function () {
         jqueryMap.$field.toggleClass('.work');
      }
      this.hide = function () {
         jqueryMap.$field.toggleClass('.work-whitecell');
      }

      this.setNum = function (num) {
         this.number = num;
         //$cell.val(num);
      }

      switch (type) {
         case 'input' :
            $cell = $('<input>', {
               class : "input",
               text  : ""
            });
            $cell.focusout(this, function(that) {
               var i, j, sum = 0, quan = 0, strSize = 0;
               var num = checkInputNumber($(this).val());

               if (num > 0) {
                  quan++;
               }

               for (var x = 0; x < configMap.qBlocks; x++) {

                  if (iCell < configMap.qBlocks && jCell >= configMap.qBlocks) {
                     i = x;
                     j = jCell;
                     stringBoxsSize = configMap.width;
                  }
                  if (iCell >= configMap.qBlocks && jCell < configMap.qBlocks) {
                     j = x; 
                     i = iCell;
                     stringBoxsSize = configMap.height;
                  }
                  if (i == iCell && j == jCell) {
                     sum += num;
                  } else {
                     sum += field[i][j].number;
                     if (field[i][j].number > 0) {
                        quan++;
                     }
                  }
                  //console.log("x:" + x + ", i:" + i + ", j:" + j + " ");
               }
               if ((sum + quan - 1) <= stringBoxsSize) {
                  that.data.setNum(num);
               } else {
                  num = null;
               }
               console.log("sum:" + sum + ", quan: " + quan + ", height:" + (sum + quan - 1));
               $(this).val(num);
            });
            break;
         case 'work' :
            $cell = $('<div>', {
               class : "work"
            });
            break;
      };
      jqueryMap.$field.append( $cell );
      //$cell = jqueryMap.$field.last();
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