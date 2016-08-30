
var Teleporter = function(isHorizontal){
   var className = isHorizontal ? "teleporter-h" : "teleporter-v";
   this.elem = $('<div></div>').addClass('tilegfx teleporter').addClass(className);
   this.isHorizontal = isHorizontal;
};

Teleporter.prototype.getCorrespondentTile = function(board){
   for(var i=0;i<board.tiles.length;i++){
      var p = board.tiles[i].tileObject;
	  if (!p)
	     continue;
	  var tp = p.teleporter;
	  if (tp && tp.isHorizontal == this.isHorizontal && tp != this)
	  {
	     console.log('correspondent tile is '+i);
	     return board.tiles[i];
	  }
   }
   
   console.log('no correspondent tile found');
   
   return null;
}

var Switcher = function(direction){
   this.direction = direction;
   var className = "switcher switcher"+direction;
   this.elem = $('<div></div>').addClass('tilegfx').addClass(className);
};

var Painter = function(color){
   this.color = color;
   var className = "painter painter"+color;
   this.elem = $('<div></div>').addClass('tilegfx').addClass(className);
};

var ColorFilter = function(color){
   this.color = color;
   var className = "colorFilter colorFilter"+color;
   this.elem = $('<div></div>').addClass('tilegfx').addClass(className);
};

Path.prototype.addTeleporter = function(teleporter)
{
   this.teleporter = teleporter;
   this.elem.append(teleporter.elem);
};

Path.prototype.addSwitcher = function(switcher){
   this.switcher = switcher;
   this.elem.append(switcher.elem);
};

Path.prototype.addPainter = function(painter){
   this.painter = painter;
   this.elem.append(painter.elem);
};

Path.prototype.addColorFilter = function(colorFilter){
   this.colorFilter = colorFilter;
   this.elem.append(colorFilter.elem);
};
