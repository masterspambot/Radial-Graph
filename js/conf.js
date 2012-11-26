var labelType, useGradients, nativeTextSupport, animate, rgraph, sign;
var newPalette = new Array("F25C05", "F29F05", "58A61B", "2C3960", "2C3960");
var newFont = new Array("#eee","#ccc","#999","#666", "#333");

(function() {
  var ua = navigator.userAgent,
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
  labelType = (!nativeCanvasSupport)? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(!nativeCanvasSupport);
})();

function init(){
		rgraph = new $jit.RGraph({
        injectInto: 'infovis',
        'width': document.body.clientWidth,
				'height': document.body.clientHeight,
        
				background: {	},

        Navigation: {
          enable: false,
          panning: false,
        },
        Node: {
            color: '#ddd',
            'overridable': true,
            'strokeStyle': '#555',
            dim: 0
        },
        
        Edge: {
          'overridable': true,
        },
        
        Label: {
					family: 'Verdana',
					'overridable': true,
				},
        
        
				onCreateLabel: function(domElement, node){
						domElement.innerHTML = node.name;
						domElement.onclick = function(){rgraph.onClick(node.id);
						};
				},
					
				onBeforePlotLine: function(adj){
				adj.data.$lineWidth = 8/(adj.nodeFrom._depth+1);
				if (adj.nodeFrom._depth == 0 ){
					adj.data.$color = newPalette[0];
				} else if(adj.nodeFrom._depth == 1){
					adj.data.$color = newPalette[1];
				} else if(adj.nodeFrom._depth == 2){
					adj.data.$color = newPalette[2];
				} else{
					adj.data.$color = newPalette[3];
				}
          
        },
				duration:750,
        fps: 20,
        interpolation: 'polar',
        levelDistance: 150,

        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
			
            if (node._depth == 0) {
                style.fontSize = "2.8em";
                style.color = newFont[0];                
								node.data.$dim = 15;
                node.data.$color = newPalette[0];
            } else if(node._depth == 1){
                style.fontSize = "1.6em";
                style.color = newFont[1];                
                node.data.$dim = 9;
								node.data.$color = newPalette[1];
            } else if(node._depth == 2){
                style.fontSize = "1.1em";
                style.color = newFont[2];    
                node.data.$dim = 7;
								node.data.$color = newPalette[2];
            } else if(node._depth == 3){
                style.fontSize = "1em";
                style.color = newFont[3];          
                node.data.$dim = 4;
                node.data.$color = newPalette[3];
            }else {
                style.fontSize = "0.8em";
                style.color = newFont[4];          
                node.data.$dim = 4;
                node.data.$color = newPalette[4];
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        }
    });
    
    rgraph.loadJSON(json);
    
    rgraph.graph.eachNode(function(n) {
      var pos = n.getPos();
      pos.setc(0, 0);
    });
    rgraph.compute('end');
    rgraph.fx.animate({
      modes:['polar'],
      duration: 1200
    });
        
    rgraph.graph.eachNode(function(n){
		appendOptionLast('remove-list', n);
		appendOptionLast('parent-list', n);
	});
	
	var button = $jit.id('remove-nodes');
	button.onclick = function() {
		var sel = document.getElementById('remove-list');
		var sindex = sel.selectedIndex;
		var n = rgraph.graph.getNode(sel.options[sindex].value);
		if(!n) return;
		sel.remove(n.id);
		var subnodes = n.getSubnodes();
		var map = [];
		for (var i = 0; i < subnodes.length; i++) {
			removeOptionSelected(subnodes[i].id)
			map.push(subnodes[i].id);
		}
		rgraph.op.removeNode(map.reverse(), {
			type: 'fade:seq',
			duration: 750,
			fps: 20,
			hideLabels:false
		});
	}
	
	var button = $jit.id('add-node');
	button.onclick = function() {
		var id = Math.floor(Math.random()*100)+'_'+Math.floor(Math.random()*1);
		var sel = document.getElementById('parent-list');
		var sindex = sel.selectedIndex;
		var x = document.getElementById('node-name').value;
		var n = rgraph.graph.getNode(sel.options[sindex].value);
		if(!n) return;
		var trueGraph = eval('([{id:"'+ id +'",name: "'+ x +'", adjacencies:["'+n.id+'"]}])');  
		rgraph.op.sum(trueGraph, {
			type: 'fade:seq',
			duration: 750,
			fps: 20,
			hideLabels:false
		});
		var temp = new Object;
		temp.id = id;
		temp.name = x;
		appendOptionLast('parent-list', temp);
		appendOptionLast('remove-list', temp);
	}	
}

	var button = $jit.id('change-palette');
	button.onclick = function() {
		var $color = document.getElementById('color-hex').value;
			$current = new Array();
			for(var $i = 0; $i<3; $i++){
				$current[$i] =  parseFloat(hexToInt($color.substr($i*2,1)))*16 + parseFloat(hexToInt($color.substr($i*2+1,1))); 
			}
			$current = $current.join("");
			if($current >= 128128128){
				document.getElementById('center-container').style.backgroundColor = "#1a1a1a";
				sign = '-';
			}
			else{
				document.getElementById('center-container').style.backgroundColor = "#eaeaea";
				sign = '+';
			}
		var font = document.getElementById('font-hex').value;		
		newPalette = calculateFade($color);
		newFont = calculateFade(font);
		rgraph.refresh();
		rgraph.refresh();
	}	

function appendOptionLast(src, obj)
{
  var elOptNew = document.createElement('option');
  elOptNew.text = obj.name;
  elOptNew.value = obj.id;
  var elSel = document.getElementById(src);

  try {
    elSel.add(elOptNew, null);
  }
  catch(ex) {
    elSel.add(elOptNew);
  }
}

function removeOptionSelected(val)
{
  var elSel = document.getElementById('remove-list');
  var elSel2 = document.getElementById('parent-list');
  var i;
  for (i = elSel.options.length - 1; i>=0; i--) {
    if (elSel.options[i].value == val) {
      elSel.remove(i);
    }
    if (elSel2.options[i].value == val) {
      elSel2.remove(i);
    }
  }
}

function calculateFade($color)
{
	$offset = new Array();
	$palette = new Array();
	
	$palette[0] = "#"+$color;
	for(var $j = 1; $j<5; $j++){
		for(var $i = 0; $i<3; $i++){
			$offset[$i] = getOffset($color.substr($i*2, 2), $j*40);
		}
		$newColor = "#"+$offset.join("");
		$palette[$j] = $newColor;
	}
	return $palette;
}

function getOffset($color, $step)
{
	$a = new Array();
	$a[0] = hexToInt($color.substr(0,1));
	$a[1] = hexToInt($color.substr(1,1));
	$a[0] *= 16;
	$a = parseFloat($a[0]) + parseFloat($a[1]);
	if(sign == '+')
		$a = parseFloat($a) + $step;
	else
		$a = parseFloat($a) - $step;
	if($a > 255)
		$a = 255;
	else if($a < 0)
		$a = 0;
	$new = intToHex($a);
	return $new;
}

function hexToInt($ret){
	if($ret.toUpperCase() == "F"){
	$ret = 15;
	}else
	if($ret.toUpperCase() == "E"){
	$ret = 14;
	}else
	if($ret.toUpperCase() == "D"){
	$ret = 13;
	}else
	if($ret.toUpperCase() == "C"){
	$ret = 12;
	}else
	if($ret.toUpperCase() == "B"){
	$ret = 11;
	}else
	if($ret.toUpperCase() == "A"){
	$ret = 10;
	}
	return $ret;
}

function intToHex($ret){
	$hex = new Array();
	$one = $ret % 16;
	$ret -= $one;
	$hex[0] = $ret / 16;
	$hex[1] = $one;

	if($hex[0] < 0){
	$hex[0] = 0;
	}
	if($hex[1] < 0){
	$hex[1] = 0;
	}

	for($i = 0; $i < 2; $i++){
	if($hex[$i] == 15){
	$hex[$i] = "F";
	}else
	if($hex[$i] == 14){
	$hex[$i] = "E";
	}else
	if($hex[$i] == 13){
	$hex[$i] = "D";
	}else
	if($hex[$i] == 12){
	$hex[$i] = "C";
	}else
	if($hex[$i] == 11){
	$hex[$i] = "B";
	}else
	if($hex[$i] == 10){
	$hex[$i] = "A";
	}
	}

	$hex = $hex.join("");
	return $hex;
}
