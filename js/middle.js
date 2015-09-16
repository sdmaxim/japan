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
   field = [],
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

      jqueryMap.$field.css({
         'width' : fullSmallBoxSize*(width+qBlocks),
         'height' : fullSmallBoxSize*(height+qBlocks)
      });

      for (var i = 0; i < height+qBlocks; i++) {
         for (var j = 0; j < width+qBlocks; j++) {
            if ((i >= qBlocks) || (j >= qBlocks)) {
               
               if ((i < qBlocks) || (j < qBlocks)) {
                  cellConf.type = 'input';
               } else {
                  cellConf.type = 'work';
               }
               cellConf.i = i;
               cellConf.j = j;
               field[i, j] = new Cell(cellConf);
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
         num = "";
      }
      return num;
   }

   var Cell = function (cellConf) {
      var type = cellConf.type;
      var i = cellConf.i;
      var j = cellConf.j;
      var $cell = {};
      var number = 0;
      var condition = "";

      this.show = function () {
         jqueryMap.$field.toggleClass('.work');
      }
      this.hide = function () {
         jqueryMap.$field.toggleClass('.work-whitecell');
      }

      switch (type) {
         case 'input' :
            $cell = $('<input>', {
               class : "input",
               text  : ""
            });
            $cell.focusout(function() {
               var iTmp, jTmp, sum = 0;
               number = checkInputNumber($(this).val());

               for (var x = 0; x < configMap.qBlocks; x++) {

                  if (i < configMap.qBlocks && 
                      j >= configMap.qBlocks) {
                     iTmp = x; jTmp = j;
                  } else 
                  if (i >= configMap.qBlocks && 
                      j < configMap.qBlocks) {
                     jTmp = x; iTmp = i;
                  }
                  if (iTmp == i && jTmp == j) {
                     sum += 0 + number;
                  } else {
                     sum += 0 + field[iTmp, jTmp].number; 
                  }
                  console.log("x:" + x + ", iTmp:" + iTmp + ", jTmp:" + jTmp + " " + field[iTmp, jTmp].number + " ");
               }
               //console.log("+" + sum + " ");

               $(this).val(number);
            });
            break;
         case 'work' :
            $cell = $('<div>', {
               class : "work"
            });
            break;
      };
      jqueryMap.$field.append( $cell );

      return { number : number };
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