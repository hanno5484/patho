var Tile = function(board,x,y){
   this.board = board;
   this.x = x;
   this.y = y;
   this.path = null;
   this.tileObject = null; // can be path or wheel
   
   this.getCoord = function(x,y)
   {
      return [x*g.tile_size + g.tileoffset[0], y*g.tile_size + g.tileoffset[1]];
   };

   	  var elem = $('<div></div>');
	  var coord = this.getCoord(x, y);
	  elem.addClass('backdrop').css('left', coord[0] + "px").css('top', coord[1] + "px");
	  board.elem.append(elem);
	  this.elem = elem;
}

Tile.prototype.canEnter = function(enterPosition)
{
   if (this.tileObject)
      return this.tileObject.canEnter(enterPosition);
	  
   return false;
};

Tile.prototype.enterMarble = function(enterPosition, marble)
{
   if (this.tileObject)
      return this.tileObject.enterMarble(enterPosition, marble);

   console.log('cannot enter tile');
};

var Board = function(elem){
   this.animations = [];
   this.movingMarblesMax = 3;
   this.movingMarbles = 0;
   this.elem = elem;
   this.tiles = new Array(g.horiz_tiles * g.vert_tiles);
   this.getTile = function(x, y) {
      return this.tiles[x * g.vert_tiles + y];
   };
  
   for (var x = 0;x<g.horiz_tiles;x++)
   {
      for (var y = 0;y<g.vert_tiles;y++)
      {
         this.tiles[x*g.vert_tiles+y] = new Tile(this,x,y);
	  }
   }
   
   var marblepipeline = $('<div></div>').addClass('marblepipeline');
   elem.append(marblepipeline);
   
   this.newMarble = function(){
       var m = new Marble(this, Math.floor(Math.random()*(g.default_colors.length)));
	   var anim = {
	      xposition: 0,
		  isAlternateDirection: false,
		  marble: m,
          step: this.marblePipelineAnimation
	   };
	   
	   this.animations.push(anim);
   };
   
   this.isGameWon = function(){
      var success = true;
	  for (var t=0;t<this.tiles.length;t++)
	  {
	     var tileObject = this.tiles[t].tileObject;
		 if (tileObject && tileObject.isFilled === false)
		 {
		     success = false;
		 }
	  }
	  
	  return success;
   };
};

Board.prototype.marblePipelineAnimation = function(timestamp, anim){
   
   var xstep = 3;
   
   var xbefore = anim.xposition;
   if (anim.isAlternateDirection)
   {
       anim.xposition -= xstep;
   }
   else
   {
       anim.xposition += xstep;
   }
   
   for (var tilex=0;tilex<g.horiz_tiles;tilex++)
   {
       // TODO vorberechnen
       var tilemidx = (tilex*g.tile_size) + g.tileoffset[0] + (g.tile_size/2) - (g.marble_size/2);
	   
	   var check = anim.xposition;
	   var check1 = xbefore;
	   if (check1 > check)
	   {
	       check1 = anim.xposition;
		   check = xbefore;
	   }
	   
	   if (check1 < tilemidx && check >= tilemidx)
	   {
	      // check if tile at pos x has a wheel
		  var wheel = anim.marble.board.getTile(tilex,0).tileObject;
		  if (wheel && wheel.canEnter(3))
	      {
		      wheel.enterMarble(3, anim.marble);
			  anim.marble.board.newMarble();
			  return false;
		  }
		  
	   }
   }
   
   
   if (anim.xposition >= (g.tileoffset[0] + (g.tile_size*g.horiz_tiles) - g.marble_size))
      anim.isAlternateDirection = true;
   else if (anim.xposition <= 0)
      anim.isAlternateDirection = false;
   
   anim.marble.elem.css("left", anim.xposition+'px');
   return true;
}

var BoardPlayer = function(board){
   this.board = board;
   this.startTime = new Date().getTime();
   this.maxEndTime = this.startTime + (60 * 1000 * 5);
   this.isPlaying = true;
   this.isSuccess = false;
   
   this.endPlay = function(success){
      console.log('level ended: '+success);
      this.isPlaying = false;
	  this.isSuccess = success;
   };
   
   var p = this;
   
   this.checkTimeout = function(){
      if (!p.isPlaying)
	     return;
		 
      var timeNow = new Date().getTime();
      if (timeNow >= p.maxEndTime)
	  {
	      p.endPlay(false);		  
	  }
	  else
	  {
   	      setTimeout(p.checkTimeout, 1000);
	  }
   };
   
   setTimeout(this.checkTimeout, 1000);
   
   requestAnimationFrame(draw);
   
   // launch the first marble
   board.newMarble();
   
   this.checkEndGame = function(){
	  if (this.board.isGameWon()){
	    this.endPlay(true);
	  }
   };
};

var currentPlayer = null;

function draw(timestamp) {
    setTimeout(function() {
		var player = currentPlayer;
		if (!player || !player.isPlaying)
		   return;

		requestAnimationFrame(draw);
	   
		for (var i=0;i<player.board.animations.length;i++)
		{
		    var anim = player.board.animations[i];
			if (!anim.timestamp)
			   anim.timestamp = timestamp;
			
			if (!anim.step(timestamp, anim))
			{
			   player.board.animations.splice(i, 1);
			   i--;
			}
		}

    }, 1000 / g.fps);
}

Board.prototype.getAdjacentTile = function(tile, position){
   var x = tile.x;
   var y = tile.y;
   if (position == 0)
     x++;
	 else if (position==1)
	 y++;
	 else if(position==2)
	 x--;
	 else if(position==3)
	 y--;
   
   if(x<0 || y<0 || x >= g.horiz_tiles || y >= g.vert_tiles)
     return null;
	 
   return this.getTile(x,y);
}

var Path = function(type){
   this.elem = $('<div></div>').addClass('tilegfx path' + type);
   this.type = type;
   this.teleporter = null;
   this.painter = null;
   this.switcher = null;
   this.colorFilter = null;
};

Path.prototype.addToTile = function(tile) {
   tile.elem.append(this.elem);
   
   // only set tile.tileObject to path if there is no wheel
   if (!tile.tileObject)
      tile.tileObject = this;
	  
   this.tile = tile;
};

Path.prototype.canEnter = function(position){
   if (position == 0)
      return (this.type & 2) > 0;
   if (position == 1)
      return (this.type & 4) > 0;
   if (position == 2)
      return (this.type & 8) > 0;
   if (position == 3)
      return (this.type & 1) > 0;
};

Path.prototype.getBorderCoord = function(position){
    return [g.holecoord[position][0], g.holecoord[position][1]];
};

Path.prototype.getPosition = function(position)
{
   var startX = 32;
   var startY = 32;
   if (position == 2)
      startX = -14;
   else if (position == 0)
      startX = 78;
   else if (position == 1)
      startY = 78;
   else if (position = 3)
      startY = -14;
   
   var offsetX = this.tile.x * g.tile_size + g.tileoffset[0];
   var offsetY = this.tile.y * g.tile_size + g.tileoffset[1]; // todo vorberechnen
   
   startX += offsetX;
   startY += offsetY;

   return [[startX, startY], [32+offsetX, 32+offsetY]];
}

function marblePathAnimation(timestamp, anim){

  			var progress = (timestamp - anim.timestamp)/anim.duration;
			if (progress >= 1)
			{
			   anim.animationEnd();
			   return false;
			}
			else
			{
   			   var currentX = anim.startPosition[0] + (anim.endPosition[0] - anim.startPosition[0])*progress;
			   var currentY = anim.startPosition[1] + (anim.endPosition[1] - anim.startPosition[1])*progress;
			   anim.elem.css("left", currentX+"px").css("top", currentY+"px");
			   return true;
			}
};

Path.prototype.enterMarble = function(enterPosition, marble){

// path types:
// gerade horizontal = 10,11,14,15
// gerade vertikal = 5,7,13,15
   var positions = this.getPosition(enterPosition);
   var p = this;
   var anim = {
      startPosition: positions[0],
	  endPosition: positions[1],
	  duration: 400,
	  elem: marble.elem,
	  step: marblePathAnimation,
	  animationEnd: function(){
         // marble goes straight through
         if ( [5,7,10,11,13,14,15].indexOf(p.type) != -1)
         {
      	     return p.marbleReachedMiddle(enterPosition, marble);
         }
	  }
   };
   
   this.tile.board.animations.push(anim);

   // move marble to middle
   /* using CSS animations
   var animClassName = 'marbleMove marbleToMiddle' + enterPosition;
   marble.elem.addClass(animClassName);
   
   marble.animationEnd = function()
   {
      console.log('marble reached middle');
	  marble.elem.removeClass(animClassName);
      // marble goes straight through
      if ( [5,7,10,11,13,14,15].indexOf(p.type) != -1)
      {
   	     return p.marbleReachedMiddle(enterPosition, marble);
      }
   };

   */
};

Path.prototype.reverseMarbleDirection = function(enterPosition, marble){
   this.tile.tileObject.marbleFromMiddle((enterPosition+2)%g.wheel_steps, marble);
};

Path.prototype.marbleReachedMiddle = function(enterPosition, marble){

   // make the type of the path affect the marble path
   
   if (this.painter)
      marble.setColor(this.painter.color);
	  
   if (this.colorFilter && this.colorFilter.color != marble.color)
   {
      // reverse direction
      this.reverseMarbleDirection(enterPosition, marble);
	  return;
   }
   
   if (this.switcher)
   {
      var marbleDirection = (enterPosition+2)%g.wheel_steps;
	  if (this.switcher.direction != marbleDirection)
	  {
	     this.reverseMarbleDirection(enterPosition, marble);
		 return;
	  }
   }     

   if (this.teleporter)
   {
	  var newTile = this.teleporter.getCorrespondentTile(this.tile.board);
	  if (newTile)
	  {
		 newTile.tileObject.marbleFromMiddle(enterPosition, marble);
		 return;
	  }
   }

   this.marbleFromMiddle(enterPosition, marble);
};

Path.prototype.marbleFromMiddle = function(enterPosition, marble){
   
   // move marble from middle to exit
   var exitPosition = (enterPosition + 2) % g.wheel_steps;
   var thisTile = this.tile;   
   
   /* using animations
   var animClassName = 'marbleMove marbleFromMiddle' + exitPosition;
   marble.elem.addClass(animClassName);
  
   marble.animationEnd = function(){
   marble.elem.removeClass(animClassName);
   var adjacentTile = thisTile.board.getAdjacentTile(thisTile, exitPosition);
   
   var enterPosition = (exitPosition + (g.wheel_steps/2)) % g.wheel_steps;
   
   if(!adjacentTile.canEnter(enterPosition)){
      // donk!
	  thisTile.enterMarble(exitPosition, marble);
	  return;
   }
   
   adjacentTile.enterMarble(enterPosition, marble);
   
   };
   
      */
	  
	  
   var positions = this.getPosition(exitPosition);
   
   var anim = {
      startPosition: positions[1],
	  endPosition: positions[0],
	  duration: 400,
	  elem: marble.elem,
	  step: marblePathAnimation,
	  animationEnd: function(){
	      var adjacentTile = thisTile.board.getAdjacentTile(thisTile, exitPosition);
   
          var enterPosition = (exitPosition + (g.wheel_steps/2)) % g.wheel_steps;
   
          if (!adjacentTile.canEnter(enterPosition)){
              // donk!
	          thisTile.enterMarble(exitPosition, marble);
	          return;
          }
          adjacentTile.enterMarble(enterPosition, marble);
	  }
   };
   
   this.tile.board.animations.push(anim);
};
   
var Marble = function(board, marbleColor){
   this.board = board;
   var elem = $('<div></div>').addClass('marble marble' + marbleColor);
   this.board.elem.append(elem);
   this.color = marbleColor;
   this.elem = elem;
   this.wheel = null;
   var m = this;
   
   var touchEventName = g.isUseTouchEvents ? "touchstart" : "click";
   this.elem.on(touchEventName, function(){
       return m.clickAction();
   });
   
   this.animationEnd = null;
   
   this.elem[0].addEventListener("animationend", function(){
      if (m.animationEnd)
	  {
	     var f = m.animationEnd;
		 m.animationEnd = null;
		 f();
	  }
   }, false);
};

Marble.prototype.setColor = function(newColor){
   this.elem.removeClass('marble'+this.color);
   this.color = newColor;
   this.elem.addClass('marble'+this.color);
};

Marble.prototype.setCoord = function(coord){
	this.elem.css('left', coord[0]+"px");
	this.elem.css('top', coord[1]+"px");
}

Marble.prototype.clickAction = function(){
   if (!this.wheel)
   {
      console.log('no release possible - marble not in wheel');
      return false;	  
   }

   var exitPosition = (this.position + this.wheel.rotatePos) % g.wheel_steps;
   var tile = this.wheel.tile;
   var adjacentTile = tile.board.getAdjacentTile(tile, exitPosition);
   if (!adjacentTile)
   {
      console.log('no release possible - no adjacent tile');
	  return false;
   }
   
   var enterPosition = (exitPosition + (g.wheel_steps/2)) % g.wheel_steps;
   
   if (!adjacentTile.canEnter(enterPosition))
   {
	   console.log('no release possible - cannot enter tile from position ' + enterPosition);
	   return false;
   }
   
   if (tile.board.movingMarblesMax <= tile.board.movingMarbles)
   {
      console.log('no release possible - movingMarblesMax reached');
	  return false;
   }
   
   tile.board.movingMarbles++;
   this.wheel.releaseMarble(this);
   adjacentTile.enterMarble(enterPosition, this);
   
   return false;
};

var Slot = function(){
   this.marble = null;
};

var Wheel = function(){
	this.elem = $('<div></div>').addClass('tilegfx wheel');
	this.slots = new Array(g.wheel_steps);
	for(var i=0;i<this.slots.length;i++)
		this.slots[i] = new Slot();
	
	var w = this;

    var touchEventName = g.isUseTouchEvents ? "touchstart" : "click";
	
	this.elem.on(touchEventName, function(){
	   return w.rotate();
	});
	
	this.isFilled = false;
	this.rotatePos = 0;
	this.rotateCssClasses = new Array(g.wheel_steps);
	for (var i=0;i<this.rotateCssClasses.length;i++)
		this.rotateCssClasses[i] = "wheelRotate" + i;
		
	this.elem.addClass(this.rotateCssClasses[this.rotatePos]);
};

Wheel.prototype.addToTile = function(tile){
    this.tile = tile;
	tile.tileObject = this;
	tile.elem.append(this.elem);
};

Wheel.prototype.getSlot = function(position){
   return (position - this.rotatePos + g.wheel_steps) % g.wheel_steps;
};
Wheel.prototype.canEnter = function(position){
    var slot = this.getSlot(position);
	if (this.slots[slot].marble)
	{
	   console.log('cannot enter wheel - there is already a marble in slot '+slot);
	   return false;
	}
	
	return true;
};

Wheel.prototype.getSlotCoord = function(position){
    return [this.tile.x * g.tile_size + g.holecoord[position][0] + g.tileoffset[0],
	   this.tile.y * g.tile_size + g.holecoord[position][1] + g.tileoffset[1]];
};

Wheel.prototype.enterMarble = function(position, marble){
    this.tile.board.movingMarbles--;
    var slot = this.getSlot(position);
	console.log('marble enters in position: '+position+', slot '+slot);
	this.slots[slot].marble = marble;
	var coord = this.getSlotCoord(position);
	marble.setCoord(coord);
	marble.wheel = this;
	marble.position = slot;
	
	this.checkSlotsFilled();
};

Wheel.prototype.releaseMarble = function(marble){
    marble.wheel = null;
	this.slots[marble.position].marble = null;
	marble.position = null;
};

Wheel.prototype.checkSlotsFilled = function(){
    var referenceMarble = this.slots[0];
    for (var slot=0;slot<this.slots.length;slot++){
	   if (!this.slots[slot].marble)
	      return false;
		  
	   if (this.slots[slot].marble.color !== referenceMarble.marble.color)
	      return false;
	}
	
	console.log('all slots filled');
	
	    this.isFilled = true;
		this.elem.addClass('wheel-dark');
		for (var slot=0;slot<this.slots.length;slot++){
	       this.slots[slot].marble.elem.remove();
		   this.slots[slot].marble = null;
	    }

	currentPlayer.checkEndGame();
	return true;
}

Wheel.prototype.rotate = function()
{
    this.elem.removeClass(this.rotateCssClasses[this.rotatePos]);
	this.rotatePos = (this.rotatePos + 1) % this.rotateCssClasses.length;
	this.elem.addClass(this.rotateCssClasses[this.rotatePos]);
	
	for(var slot=0;slot<4;slot++)
	{
	   if (!this.slots[slot].marble)
	      continue;
		  
  	   var coord = this.getSlotCoord((slot+this.rotatePos)%this.rotateCssClasses.length);
	   this.slots[slot].marble.setCoord(coord);
	}
	
	this.checkSlotsFilled();
	return false;
};

