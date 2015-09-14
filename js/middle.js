middle = (function () {
   var configMap = {
      main_html : String()
         + '<div class="header"></div>'
         + '<div class="field"></div>',
      smallBoxSize : 25
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
      var width = parseInt(options.width, 10);
      var height = parseInt(options.height, 10);
      var qBlocks = parseInt(options.qBlocks, 10);
      var margineCss = 2;
      var smallBoxSize = configMap.smallBoxSize;
      var fullSmallBoxSize = (smallBoxSize+margineCss*2);
      var spaceBoxSize = fullSmallBoxSize*qBlocks - margineCss*2;
      
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

      var tempType = '';
      for (var i = 0; i < height+qBlocks; i++) {
         for (var j = 0; j < width+qBlocks; j++) {
            if ((i >= qBlocks) || (j >= qBlocks)) {
               if ((i < qBlocks) || (j < qBlocks)) {
                  tempType = 'input';
               } else {
                  tempType = 'work';
               }
               field[i, j] = new Cell(tempType);
               field[i, j].init();
            }
         }
      }
   }

   var Cell = function (type) {
      this.cellType = type;

      this.show = function () {
         jqueryMap.$field.toggleClass('.work');
      }
      this.hide = function () {
         jqueryMap.$field.toggleClass('.work-whitecell');
      }
      this.init = function () {
         switch (this.cellType) {
            case 'input' :
               this.cell = $('<input>', {
                  class : "input",
                  text  : "0"
               });
               break;
            case 'work' :
               this.cell = $('<div>', {
                  class : "work"
               });
               break;
         };
         jqueryMap.$field.append( this.cell );
      }
   }

   var setJqueryMap = function () {
      var $container = stateMap.$container;
      jqueryMap.$header = $container.find('.header');
      jqueryMap.$field = $container.find('.field');
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