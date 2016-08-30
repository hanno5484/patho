
var EditorTile = function(levelEditor, elem, makeTileFunc){
   this.elem = elem;
   this.makeTileFunc = makeTileFunc;
   
   var editorTile = this;
   		elem.click(function(){
		   
		   levelEditor.resetEditTile();		   
		   levelEditor.currentEditTile = editorTile;
		   levelEditor.board.elem.addClass('inEdit');
		   levelEditor.currentEditTile.elem.addClass('selected');
		});

};

var LevelEditor = function(elem){

   this.currentEditTile = null;
   
   this.resetEditTile = function(){
      if (this.currentEditTile)
	  {
	     this.currentEditTile.elem.removeClass('selected');
	  }
	  this.board.elem.removeClass('inEdit');
      this.currentEditTile = null;
   };
   
   this.board = new Board(elem);

   var levelEditor = this;
   
   this.board.elem.find('.backdrop').each(function(i,o){
       $(o).click(function(){
          if (levelEditor.currentEditTile)
	      {
	          levelEditor.currentEditTile.makeTileFunc($(o));
   	      }
	   });
    });
   
   var addEditorTile = function(elem, cssClass, makeTileFunc){
   	    var backdrop = $('<div></div>').addClass('backdrop editortile');
        var tileElem = $('<div></div>').addClass('tilegfx').addClass(cssClass);
	    elem.append(backdrop);
		backdrop.append(tileElem);
		
		var editorTile = new EditorTile(levelEditor, backdrop, makeTileFunc);
		
   };
   
   var makeTile = function(tile, className, removeClassName, isPrepend){
   
       if (removeClassName)
	   {
	      tile.find('.'+removeClassName).remove();
	   }
   
       var e = $('<div></div>').addClass('tilegfx '+className);
	   
	   if (isPrepend)
	      tile.prepend(e);
	   else
	      tile.append(e);
   };
   
   var d = $('<div></div>')
   elem.append(d);
   d.load('leveleditor.html', function(){
     
	 d = d.find('#editortiles');
	 
	 addEditorTile(d, '', function(tile){ 
	    tile.children().remove();
	 });

	 var funchelper = function(className, removeClassName, isPrepend){
	    addEditorTile(d, className, function(tile){ return makeTile(tile, className, removeClassName, isPrepend); });
	 };
	 
     for (var x=1; x<16; x++)
     {
		funchelper("path path"+x, "path", true);
     }
 
	 funchelper("tileobj wheel", "tileobj");
	 funchelper('tileobj teleporter-h', "tileobj");
	 funchelper('tileobj teleporter-v', "tileobj");
	 
	 for (var x=0;x<4;x++)
	 {
	    funchelper('tileobj painter painter'+x, "tileobj");
     }
	 
     for (var x=0;x<4;x++)
	 {
	    funchelper('tileobj switcher switcher'+x, "tileobj");
	 }
	 
	 for (var x=0;x<4;x++)
	 {
		funchelper('tileobj colorFilter colorFilter'+x, "tileobj");
	 }
   });
};