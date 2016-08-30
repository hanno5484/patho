
var Level = function(){
   this.tileConfig = new Array(g.vert_tiles*g.horiz_tiles);
   
   this.getTile = function(x, y) {
      return this.tileConfig[x * g.vert_tiles + y];
   };
   
   this.getBoard = function(elem){
      var board = new Board(elem);
	  
	  for (var y=0;y<g.vert_tiles;y++)
 	  {
         for (var x=0;x<g.horiz_tiles;x++)
		 {
		     this.applyTile(board.getTile(x, y), this.getTile(x,y));
		 }
	  }
	  
	  return board;
   };
   
   this.applyTile = function(tile, s){

	   if (s[0] == 'v')
	   {
	       tile.addSwitcher(new Switcher(1));
	   }
	   
	   if (s[1] != ' ')
	   {
	      var path = new Path(parseInt(s[1], 16)).addToTile(tile);
		  
		  if (s[0] == '=') // teleporter
	      {
	         path.addTeleporter(new Teleporter(true));
	      }
		  
		  if (s[0] == '#') // filter
		  {
		     path.addColorFilter(new ColorFilter(parseInt(s[2])));
		  }
		  
		  if (s[0] == '&') // painter
		  {
		     path.addPainter(new Painter(parseInt(s[2])));
		  }
		  
		  if (s[0] == '>')
		  {
		     path.addSwitcher(new Switcher(0));
		  }

		  if (s[0] == '<')
		  {
		     path.addSwitcher(new Switcher(2));
		  }
		  if (s[0] == '^')
		  {
		     path.addSwitcher(new Switcher(3));
		  }

		  if (s[0] == 'v')
		  {
		     path.addSwitcher(new Switcher(1));
		  }
	   }
	   
	   if (s[0] == 'O') // wheel
	   {
	      new Wheel().addToTile(tile);
	   }
   };
};

var testLevel = null;
var LevelConfig = function(){
   var getLevels = $.get('boards.txt');
   
   var levelConfig = this;
   this.levels = [];
   this.levelsLoaded = function(){};
   
   getLevels.success(function(){
      var lines = getLevels.responseText.match(/^.*([\n\r]+|$)/gm);
	  
	  for (var i=0;i<lines.length;i++)
	  {
	     var line = lines[i];
		 var firstChar = line[0];
		 if (firstChar == '#') // comment
		    continue;
		 
		 if (firstChar == '+')
		 {
		    var currentLevel = new Level();
			testLevel = currentLevel;
			levelConfig.levels.push(currentLevel);
			
		    for (var y=0;y<g.vert_tiles;y++)
			{
  		       i++;
			   line = lines[i];
			   console.log('reading line to level '+i);
			   var c = 1; // character in line
			   
			   for (var x=0;x<g.horiz_tiles;x++)
			   {
			       currentLevel.tileConfig[x * g.vert_tiles + y] = line.substring(c, c + 3);
				   c += 4;
			   }
			}
			
			console.log('reading level '+levelConfig.levels.length);
			levelConfig.levelsLoaded();
		   return;
		 }

	   }
   });
   
};