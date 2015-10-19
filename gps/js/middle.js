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
	};

   var angle = function (point1, point2, point3) {
      var x1 = point1.x, 
          y1 = point1.y, 
          x2 = point2.x, 
          y2 = point2.y, 
          x3 = point3.x, 
          y3 = point3.y;

          var aSQ = Math.pow((x2-x1),2) + Math.pow((y2-y1),2),
          bSQ = Math.pow((x3-x2),2) + Math.pow((y3-y2),2),
          cSQ = Math.pow((x3-x1),2) + Math.pow((y3-y1),2),
          aSQRT = Math.sqrt(aSQ),
          bSQRT = Math.sqrt(bSQ), 
          res = 1.0;
          res = Math.acos((aSQ + bSQ - cSQ)/(2*aSQRT*bSQRT))*180/Math.PI;
      return res;
   }

   var clear = function () {
      var i, first = 0, second, theard, p1, p2, p3, ang;
      for (i = 0; i < db.data.x.length-2; i++) {

         p1 = {
            x : db.data.x[first],
            y : db.data.y[first]
         };
         second = i + 1;
         p2 = {
            x : db.data.x[second],
            y : db.data.y[second]
         };
         theard = second + 1;
         p3 = {
            x : db.data.x[theard],
            y : db.data.y[theard]
         };
         ang = angle(p1, p2, p3);
         if (Math.abs(180-ang) > 15) {
            console.log (i + ' ' + Math.abs(180-ang));
            first = i + 1;
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
   var initField = function (options) {
      setConfigMap(options);
      clear();
   }

   return {
      initModule  : initModule,
      initField : initField
   }

}());