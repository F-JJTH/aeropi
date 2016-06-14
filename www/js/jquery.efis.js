(function($){
  $.fn.efis = function(options){
	var defaults = {
		width: $(window).width(),
		height: $(window).height(),
		asi:{
			tickspacing: 5, // distance between markers
			speed: {
				vne: 0, // never exceed speed (end of orange ruban + red line)
				vno: 0, // max cruise speed (end of green ruban + start of orange ruban)
				vfe: 0, // max speed with flaps extended (end of white ruban)
				vso: 0, // stall speed with flaps extended (start of white ruban)
				vs: 0,  // stall speed with flaps retracted (start of green ruban)
			},
			color: {
				vne: "red",
				caution: "orange",
				normal: "green",
				flaps: "white",
			},
		},
		alt:{
			tickspacing: 8, // distance between markers
			maxalt: 25000,    // maximum altitude marker
			qnh: 1013,
		},
		ai:{
			color:{
				ground: "#BF8144", // color of the ground AI
				sky: "#4C78A9",    // color of the sky AI
			},
		},
		compass:{},
		attitude:{
			pitchoffset: 0, // offset of the pitch AI
			rolloffset: 0,  // offset of the roll AI
		},
		timezone:{
			offset: 0,
			name: "UTC",
			summer: false,
		},
	};
    var settings = $.extend(true, {}, defaults, options);
    var svgNS = "http://www.w3.org/2000/svg";
	var rectHeight = settings.height-settings.height/5;
	var topPos = settings.height/16-4;
	var attitudeOffsetBase = (settings.height / 2 - settings.height / 16) / 4;
	/*
	 * Private methods
	 */
	function _createAsi(){
		var main = document.createElementNS(svgNS, "svg");
		main.setAttribute("id", "asi");
		main.setAttribute("width", 94);
		main.setAttribute("height", rectHeight+16);
		main.setAttribute("style", "position:absolute; top:"+topPos+"px; z-index:40;");
		main.appendChild(_createFilters());
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("x", -10);
		elem.setAttribute("y", 8);
		elem.setAttribute("rx", 12);
		elem.setAttribute("ry", 12);
		elem.setAttribute("height", rectHeight);
		elem.setAttribute("width", 78);
		elem.setAttribute("style", "fill:black; fill-opacity:0.12; stroke:white; stroke-width:2; stroke-opacity:0.5;");
		elem.setAttribute("filter", "url(#shadow)");
		main.appendChild(elem);
		main.ladder = document.createElementNS(svgNS, "g");
		main.ladder.setAttribute("id", "asiLadder");
		var offsetBase = settings.height/settings.asi.tickspacing;
		var tips = (settings.asi.speed.vne / 20) + 8;
		tips = tips < 12 ? 12 : tips;
		for(var i=0; i<tips; i++){
			// large markers
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("stroke", "#FFFFFF");
			elem.setAttribute("stroke-width", 2);
			offset = -i*offsetBase;
			elem.setAttribute("d", "M0 "+offset+" l24 0");
			main.ladder.appendChild(elem);
			// labels
			elem = document.createElementNS(svgNS, "text");
			elem.setAttribute("style", "font-size:14px; fill:white");
			elem.setAttribute("x", 30);
			elem.setAttribute("y", offset+5);
			elem.textContent = i*20;
			main.ladder.appendChild(elem);
			// small markers
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("stroke", "#FFFFFF");
			elem.setAttribute("stroke-width", 2);
			offset = (-i*offsetBase)-offsetBase/2;
			elem.setAttribute("d", "M0 "+offset+" l16 0");
			main.ladder.appendChild(elem);
		}
		// rubans
		var h = settings.height/settings.asi.tickspacing;
		start = -(settings.asi.speed.vno/20)*h;
		end = -(settings.asi.speed.vne/20)*h-start;
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "stroke-width:10; stroke:"+settings.asi.color.caution+";");
		elem.setAttribute("d", "M5 "+start+" l0 "+end);
		main.ladder.appendChild(elem);
		start = -(settings.asi.speed.vs/20)*h;
		end = -(settings.asi.speed.vno/20)*h-start;
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "stroke-width:10; stroke:"+settings.asi.color.normal+";");
		elem.setAttribute("d", "M5 "+start+" l0 "+end);
		main.ladder.appendChild(elem);
		start = -(settings.asi.speed.vso/20)*h;
		end = -(settings.asi.speed.vfe/20)*h-start;
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "stroke-width:4; stroke:"+settings.asi.color.flaps+";");
		elem.setAttribute("d", "M2 "+start+" l0 "+end);
		main.ladder.appendChild(elem);
		start = -(settings.asi.speed.vne/20)*h;
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "stroke-width:4; stroke:"+settings.asi.color.vne+";");
		elem.setAttribute("d", "M0 "+start+" l26 0");
		main.ladder.appendChild(elem);
		// Clip wrapper
		elem = document.createElementNS(svgNS, "g")
		elem.setAttribute("clip-path", "url(#asiClip)");
		elem.setAttribute("transform", "translate(0 "+rectHeight/2+")");
		elem.appendChild(main.ladder)
		main.appendChild(elem);
		// Bg Digit
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:#222;");
		elem.setAttribute("d", "M4 "+rectHeight/2+" l16 16 h64 v-32 h-64 Z");
		elem.setAttribute("filter", "url(#shadowSmall)");
		main.appendChild(elem);
		main.digits = document.createElementNS(svgNS, "text");
		main.digits.setAttribute("style", "font-size:22px; fill:white;");
		main.digits.setAttribute("text-anchor", "end");
		main.digits.setAttribute("x", 82);
		main.digits.setAttribute("y", rectHeight/2+8);
		main.digits.textContent = "000";
		main.appendChild(main.digits);
		// Bg Digit
		/*var y = rectHeight+14;
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:#222;");
		elem.setAttribute("d", "M3 "+y+" h106 v24 h-106 Z");
		elem.setAttribute("filter", "url(#shadowSmall)");
		main.appendChild(elem);
		main.clock = document.createElementNS(svgNS, "text");
		main.clock.setAttribute("style", "font-size:22px; fill:white");
		main.clock.setAttribute("x", 8);
		main.clock.setAttribute("y", y+20);
		main.clock.textContent = "00:00:00";
		main.appendChild(main.clock);*/
		return main;
	}

    function _createAlt(){
		var main = document.createElementNS(svgNS, "svg");
		main.setAttribute("id", "alt");
		main.setAttribute("width", 94);
		main.setAttribute("height", rectHeight+16);
		main.setAttribute("style", "position:absolute; top:"+topPos+"px; left:"+(settings.width-94)+"px; z-index:40;");
		main.appendChild(_createFilters());
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("x", 30);
		elem.setAttribute("y", 8);
		elem.setAttribute("rx", 12);
		elem.setAttribute("ry", 12);
		elem.setAttribute("height", rectHeight);
		elem.setAttribute("width", 78);
		elem.setAttribute("style", "fill:black; fill-opacity:0.12; stroke:white; stroke-width:2; stroke-opacity:0.5;");
		elem.setAttribute("filter", "url(#shadow)");
		main.appendChild(elem);
		main.ladder = document.createElementNS(svgNS, "g");
		main.ladder.setAttribute("id", "altLadder");
		var tips = parseInt(settings.alt.maxalt/200);
		var offset = null;
		var offsetBase = settings.height/settings.alt.tickspacing;
		for(var i=0; i<tips; i++){
			// large markers
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("stroke", "#FFFFFF");
			elem.setAttribute("stroke-width", 2);
			offset = -i*offsetBase;
			elem.setAttribute("d", "M0 "+offset+" l-18 0");
			main.ladder.appendChild(elem);
			// labels
			elem = document.createElementNS(svgNS, "text");
			elem.setAttribute("style", "font-size:14px; fill:white");
			elem.setAttribute("text-anchor", "end");
			elem.setAttribute("x", -21);
			elem.setAttribute("y", offset+5);
			elem.textContent = i*200;
			main.ladder.appendChild(elem);
			// small markers
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("stroke", "#FFFFFF");
			elem.setAttribute("stroke-width", 2);
			offset = (-i*offsetBase)-offsetBase/2;
			elem.setAttribute("d", "M0 "+offset+" l-10 0");
			main.ladder.appendChild(elem);
		}
		// Clip wrapper
		elem = document.createElementNS(svgNS, "g")
		elem.setAttribute("clip-path", "url(#altClip)");
		elem.setAttribute("transform", "translate(94 "+rectHeight/2+")");
		elem.appendChild(main.ladder)
		main.appendChild(elem);
		// Bg Digit
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:#222;");
		elem.setAttribute("d", "M90 "+rectHeight/2+" l-16 14 h-64 v-28 h64 Z");
		elem.setAttribute("filter", "url(#shadowSmall)");
		main.appendChild(elem);
		main.digits = document.createElementNS(svgNS, "text");
		main.digits.setAttribute("style", "font-size:22px; fill:white");
		main.digits.setAttribute("x", 12);
		main.digits.setAttribute("y", rectHeight/2+8);
		main.digits.textContent = "000";
		main.appendChild(main.digits);
		return main;
	}
	
	function _createHdg(){
		var main = document.createElementNS(svgNS, "svg");
		main.setAttribute("id", "hdg");
		main.setAttribute("width", settings.width/2+16);
		main.setAttribute("height", 74);
		main.setAttribute("style", "position:absolute; top:"+(settings.height-74)+"px; left:"+(settings.width/4-8)+"px; z-index:40;");
		main.appendChild(_createFilters());
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("x", 8);
		elem.setAttribute("y", 8);
		elem.setAttribute("rx", 12);
		elem.setAttribute("ry", 12);
		elem.setAttribute("height", 92);
		elem.setAttribute("width", settings.width/2);
		elem.setAttribute("style", "fill:black; fill-opacity:0.12; stroke:white; stroke-width:2; stroke-opacity:0.5;");
		elem.setAttribute("filter", "url(#shadow)");
		main.appendChild(elem);
		main.ladder = document.createElementNS(svgNS, "g");
		main.ladder.setAttribute("id", "compassLadder");
		var radius = settings.width/3;
		var x1 = settings.width/4+8;
		var y1 = radius+14;
		var x2 = x1;
		var y2 = y1+20;
		elem = document.createElementNS(svgNS, "circle");
		elem.setAttribute("cx", x1);
		elem.setAttribute("cy", y1);
		elem.setAttribute("r", radius);
		elem.setAttribute("style", "fill-opacity:0; stroke:white; stroke-width:2;");
		main.ladder.appendChild(elem);
		for(var i=0; i<360; i+=6){
			if(i<72){
				elem = document.createElementNS(svgNS, "line");
				elem.setAttribute("x1", x1);
				elem.setAttribute("y1", y1);
				elem.setAttribute("x2", x2);
				elem.setAttribute("y2", y2);
				elem.setAttribute("style", "stroke:white; stroke-width:4;");
				elem.setAttribute("transform", "rotate("+(i/2)*10+" "+x1+" "+y1+") translate(0 "+(-radius)+")");
				main.ladder.appendChild(elem);
				// labels
				elem = document.createElementNS(svgNS, "text");
				elem.setAttribute("style", "font-size:14px; fill:white");
				elem.setAttribute("text-anchor", "middle");
				elem.setAttribute("x", x1);
				elem.setAttribute("y", y1+34);
				elem.textContent = (i/2)*10;
				elem.setAttribute("transform", "rotate("+(i/2)*10+" "+x1+" "+y1+") translate(0 "+(-radius)+")");
				main.ladder.appendChild(elem);
			}
			elem = document.createElementNS(svgNS, "line");
			elem.setAttribute("x1", x1);
			elem.setAttribute("y1", y1);
			elem.setAttribute("x2", x2);
			elem.setAttribute("y2", y2-8);
			elem.setAttribute("style", "stroke:white; stroke-width:2;");
			elem.setAttribute("transform", "rotate("+i+" "+x1+" "+y1+") translate(0 "+(-radius)+")");
			main.ladder.appendChild(elem);
		}
		main.appendChild(main.ladder);
		// Bg Digit
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:#222;");
		elem.setAttribute("d", "M"+x1+" 26 l8 8 h32 v28 h-80 v-28 h32 Z");
		elem.setAttribute("filter", "url(#shadowSmall)");
		main.appendChild(elem);
		main.digits = document.createElementNS(svgNS, "text");
		main.digits.setAttribute("style", "font-size:22px; fill:white");
		main.digits.setAttribute("text-anchor", "middle");
		main.digits.setAttribute("x", x1);
		main.digits.setAttribute("y", 56);
		main.digits.textContent = "000";
		main.appendChild(main.digits);
		return main;
	}
	
	function _createAi(){
		var main = document.createElementNS(svgNS, "svg");
		main.setAttribute("id", "ai");
		main.setAttribute("width", settings.width);
		main.setAttribute("height", settings.height);
		main.setAttribute("style", "position:absolute; z-index:20;");
		main.appendChild(_createFilters());
		// Animated parts
		main.horizonAnim = document.createElementNS(svgNS, "g");
		main.horizonAnim.setAttribute("id", "horizonAnim");
		// ground
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("id","ground");
		elem.setAttribute("x", -settings.width/4);
		elem.setAttribute("y", settings.height/2);
		elem.setAttribute("rx",0);
		elem.setAttribute("ry",0);
		elem.setAttribute("height", settings.height*3);
		elem.setAttribute("width", settings.width+(settings.width/2));
		elem.setAttribute("style", "fill:#BF8144; stroke:white; stroke-width:2");
		main.horizonAnim.appendChild(elem);
		// sky
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("id","sky");
		elem.setAttribute("x", -settings.width/4);
		elem.setAttribute("y", -(settings.height/2)*5);
		elem.setAttribute("rx",0);
		elem.setAttribute("ry",0);
		elem.setAttribute("height", settings.height*3);
		elem.setAttribute("width", settings.width+(settings.width/2));
		elem.setAttribute("style", "fill:#4C78A9; stroke:white; stroke-width:2");
		main.horizonAnim.appendChild(elem);
		main.horizonAnim.ladder = document.createElementNS(svgNS, "g");
		main.horizonAnim.ladder.setAttribute("id", "horizonLadder");
		//var offsetBase = (settings.height / 2 - settings.height / 16) / 4;
		var longLineLength = settings.width / 3.2;
		var longLeftOffset = (settings.width - longLineLength)/2;
		var shortLineLength = settings.width / 5;
		var shortLeftOffset = (settings.width - shortLineLength)/2;
		for(var i=0; i<4; i++){
			if(i==3)continue;      
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("style", "stroke:#FFF; stroke-width:2; stroke-opacity:0.6; fill-opacity:0");
			offset = (attitudeOffsetBase*i)+attitudeOffsetBase;
			elem.setAttribute("d", "M"+longLeftOffset+" "+(offset-8)+" v8 h"+longLineLength+" v-8");
			main.horizonAnim.ladder.appendChild(elem);
			// labels
			elem = document.createElementNS(svgNS, "text");
			elem.setAttribute("style", "font-size:14px; fill:white");
			elem.setAttribute("x", longLeftOffset+longLineLength+8);
			elem.setAttribute("y", offset);
			elem.textContent = (1+i)*10;
			main.horizonAnim.ladder.appendChild(elem);
			elem = document.createElementNS(svgNS, "text");
			elem.setAttribute("style", "font-size:14px; fill:white");
			elem.setAttribute("x", longLeftOffset+longLineLength+8);
			elem.setAttribute("y", -offset+8);
			elem.textContent = (1+i)*10;
			main.horizonAnim.ladder.appendChild(elem);
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("style", "stroke:#FFF; stroke-width:2; stroke-opacity:0.6; fill-opacity:0");
			offset = (attitudeOffsetBase*-i)-attitudeOffsetBase;
			elem.setAttribute("d", "M"+longLeftOffset+" "+(offset+8)+" v-8 h"+longLineLength+" v8");
			main.horizonAnim.ladder.appendChild(elem);
			elem = document.createElementNS(svgNS, "text");
			elem.setAttribute("style", "font-size:14px; fill:white");
			elem.setAttribute("text-anchor", "end");
			elem.setAttribute("x", longLeftOffset-8);
			elem.setAttribute("y", offset+8);
			elem.textContent = (1+i)*10;
			main.horizonAnim.ladder.appendChild(elem);
			elem = document.createElementNS(svgNS, "text");
			elem.setAttribute("style", "font-size:14px; fill:white");
			elem.setAttribute("text-anchor", "end");
			elem.setAttribute("x", longLeftOffset-8);
			elem.setAttribute("y", -offset);
			elem.textContent = (1+i)*10;
			main.horizonAnim.ladder.appendChild(elem);
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("style", "stroke:#FFF; stroke-width:2; stroke-opacity:0.4; fill-opacity:0");
			offset = (attitudeOffsetBase*i)+attitudeOffsetBase/2;
			elem.setAttribute("d", "M"+shortLeftOffset+" "+offset+" h"+shortLineLength);
			main.horizonAnim.ladder.appendChild(elem);
			elem = document.createElementNS(svgNS, "path");
			elem.setAttribute("style", "stroke:#FFF; stroke-width:2; stroke-opacity:0.4; fill-opacity:0");
			offset = (attitudeOffsetBase*-i)-attitudeOffsetBase/2;
			elem.setAttribute("d", "M"+shortLeftOffset+" "+offset+" h"+shortLineLength);
			main.horizonAnim.ladder.appendChild(elem);
		}
		main.horizonAnim.ladder.setAttribute("transform", "translate(0 "+settings.height/2+")");
		main.horizonAnim.appendChild(main.horizonAnim.ladder);
		main.appendChild(main.horizonAnim);
		// Fixed central marker
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "stroke:#FFF; stroke-width:2; fill-opacity:0;");
		var l = shortLineLength/6;
		elem.setAttribute("d", "M"+shortLeftOffset+" "+settings.height/2+" h"+l+" l"+l+" 20 l"+l+" -20 l"+l+" 20 l"+l+" -20 h"+l+"");
		main.appendChild(elem);
		return main;
	}

	function _createTs() {
		var main = document.createElementNS(svgNS, "svg");
		main.setAttribute("id", "ts");
		main.setAttribute("width", settings.width/5+16);
		main.setAttribute("height", 48);
		var center = settings.width/2-settings.width/10;
		main.setAttribute("style", "position:absolute; top:8px; left:"+(center-8)+"px; z-index:20;");
		main.appendChild(_createFilters());
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("x", 8);
		elem.setAttribute("y", 8);
		elem.setAttribute("rx", 16);
		elem.setAttribute("ry", 16);
		elem.setAttribute("height", 32);
		elem.setAttribute("width", settings.width/5);
		elem.setAttribute("style", "fill:black; fill-opacity:0.12; stroke:white; stroke-width:2; stroke-opacity:0.5;");
		elem.setAttribute("filter", "url(#shadow)");
		main.appendChild(elem);
		elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "stroke:#CCC; stroke-width:2");
		elem.setAttribute("d", "M"+(settings.width/10-8)+" 8 v32 M"+(settings.width/10+24)+" 8 v32");
		main.appendChild(elem);
		main.ball = document.createElementNS(svgNS, "circle");
		main.ball.setAttribute("cx", settings.width/10+8);
		main.ball.setAttribute("cy", 24);
		main.ball.setAttribute("r", 15);
		main.ball.setAttribute("style", "fill:#FFF;");
		main.appendChild(main.ball);
		return main;
	}

	function _createBottomLeftTips() {
		var main = document.createElementNS(svgNS, "svg");
		main.setAttribute("id", "bottomLeftTips");
		main.setAttribute("width", (settings.width-(settings.width/2+16))/2);
		main.setAttribute("height", settings.height-(rectHeight+settings.height/10)+8);
		main.setAttribute("style", "position:absolute; top:"+(rectHeight+14+topPos)+"px; z-index:40;");
        // Bg Digit
        elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:black; fill-opacity:0.24;");
        elem.setAttribute("d", "M3 4 h182 v22 h-182 Z");
        elem.setAttribute("filter", "url(#shadowSmall)");
        main.appendChild(elem);
        main.clock = document.createElementNS(svgNS, "text");
        main.clock.setAttribute("style", "font-size:22px; fill:white");
        main.clock.setAttribute("x", 6);
        main.clock.setAttribute("y", 22);
        main.clock.textContent = "Clock: 00:00";
        main.appendChild(main.clock);
        // Bg Digit
        elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:black; fill-opacity:0.24;");
        elem.setAttribute("d", "M3 32 h182 v22 h-182 Z");
        elem.setAttribute("filter", "url(#shadowSmall)");
        main.appendChild(elem);
        main.eta = document.createElementNS(svgNS, "text");
        main.eta.setAttribute("style", "font-size:22px; fill:white");
        main.eta.setAttribute("x", 6);
        main.eta.setAttribute("y", 50);
        main.eta.textContent = "ETA: 00:00:00";
        main.appendChild(main.eta);

		return main;
	}

	function _createBottomRightTips() {
		var main = document.createElementNS(svgNS, "svg");
		var width = (settings.width-(settings.width/2+16))/2;
		main.setAttribute("id", "bottomRightTips");
		main.setAttribute("width", width);
		main.setAttribute("height", settings.height-(rectHeight+settings.height/10)+8);
		main.setAttribute("style", "position:absolute; top:"+(rectHeight+14+topPos)+"px; left:"+(settings.width-width)+"px; z-index:40;");
        // Bg Digit
        elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:black; fill-opacity:0.24;");
        elem.setAttribute("d", "M"+(width-127-4)+" 4 h127 v22 h-127 Z");
        elem.setAttribute("filter", "url(#shadowSmall)");
        main.appendChild(elem);
        main.qnh = document.createElementNS(svgNS, "text");
        main.qnh.setAttribute("style", "font-size:22px; fill:white");
        main.qnh.setAttribute("id", "qnh-box");
        main.qnh.setAttribute("text-anchor", "end");
        main.qnh.setAttribute("x", width-6);
        main.qnh.setAttribute("y", 22);
        main.qnh.textContent = "QNH: "+settings.alt.qnh;
        main.appendChild(main.qnh);
        // Bg Digit
        elem = document.createElementNS(svgNS, "path");
		elem.setAttribute("style", "fill:black; fill-opacity:0.24;");
        elem.setAttribute("d", "M"+(width-182-4)+" 32 h182 v22 h-182 Z");
        elem.setAttribute("filter", "url(#shadowSmall)");
        main.appendChild(elem);
        main.position = document.createElementNS(svgNS, "text");
        main.position.setAttribute("style", "font-size:22px; fill:white");
        main.position.setAttribute("text-anchor", "end");
        main.position.setAttribute("x", width-6);
        main.position.setAttribute("y", 50);
        main.position.textContent = "00.00N - 00.00E";
        main.appendChild(main.position);

		return main;
	}

	function _createFilters() {
		var filter = null;
		var defs = document.createElementNS(svgNS, "defs");
		// shadow
		filter = document.createElementNS(svgNS, "filter");
		filter.setAttribute("id", "shadow");
		filter.setAttribute("x", "-10%");
		filter.setAttribute("y", "-10%");
		filter.setAttribute("width", "120%");
		filter.setAttribute("height", "120%");
		elem = document.createElementNS(svgNS, "feOffset");
		elem.setAttribute("result", "offOut");
		elem.setAttribute("in", "SourceAlpha");
		elem.setAttribute("dx", 0);
		elem.setAttribute("dy", 0);
		filter.appendChild(elem);
		elem = document.createElementNS(svgNS, "feGaussianBlur");
		elem.setAttribute("result", "blurOut");
		elem.setAttribute("in", "offOut");
		elem.setAttribute("stdDeviation", 4);
		filter.appendChild(elem);
		elem = document.createElementNS(svgNS, "feBlend");
		elem.setAttribute("in", "SourceGraphic");
		elem.setAttribute("in2", "blurOut");
		elem.setAttribute("mode", "normal");
		filter.appendChild(elem);
		defs.appendChild(filter);
		// shadowSmall
		filter = document.createElementNS(svgNS, "filter");
		filter.setAttribute("id", "shadowSmall");
		filter.setAttribute("x", "-15%");
		filter.setAttribute("y", "-15%");
		filter.setAttribute("width", "130%");
		filter.setAttribute("height", "130%");
		elem = document.createElementNS(svgNS, "feOffset");
		elem.setAttribute("result", "offOut");
		elem.setAttribute("in", "SourceAlpha");
		elem.setAttribute("dx", 0);
		elem.setAttribute("dy", 0);
		filter.appendChild(elem);
		elem = document.createElementNS(svgNS, "feGaussianBlur");
		elem.setAttribute("result", "blurOut");
		elem.setAttribute("in", "offOut");
		elem.setAttribute("stdDeviation", 2);
		filter.appendChild(elem);
		elem = document.createElementNS(svgNS, "feBlend");
		elem.setAttribute("in", "SourceGraphic");
		elem.setAttribute("in2", "blurOut");
		elem.setAttribute("mode", "normal");
		filter.appendChild(elem);
		defs.appendChild(filter);
		// ASI clip
		filter = document.createElementNS(svgNS, "clipPath");
		filter.setAttribute("id", "asiClip");
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("x", 0);
		elem.setAttribute("y", -rectHeight/2+9);
		elem.setAttribute("width", 78);
		elem.setAttribute("height", rectHeight-2);
		filter.appendChild(elem);
		defs.appendChild(filter);
		// ALT clip
		filter = document.createElementNS(svgNS, "clipPath");
		filter.setAttribute("id", "altClip");
		elem = document.createElementNS(svgNS, "rect");
		elem.setAttribute("x", -68);
		elem.setAttribute("y", -rectHeight/2+9);
		elem.setAttribute("width", 78);
		elem.setAttribute("height", rectHeight-2);
		filter.appendChild(elem);
		defs.appendChild(filter);
		return defs;
	}

	function _checkTime(v){
	  if(v<10){v="0"+v};
	    return v;
	}
    /*
     * Public methods
     */
	this.setSpeed = function(v) {
		//v = parseInt(v);
		if(v == data.spd) return;
		data.spd = v;
		var t = (v/20)*(settings.height/settings.asi.tickspacing);
		asi.ladder.setAttribute("transform", "translate(0, "+t+")");
		asi.digits.textContent = parseInt(v);
	}

	this.getSpeed = function(){
	  return data.spd;
	}

	this.setAltitude = function(v) {
		v = parseInt(v);
		v = Math.round(v/10)*10;
		if(v == data.alt) return;
		data.alt = v;
		var t = (v/200)*(settings.height/settings.alt.tickspacing);
		alt.ladder.setAttribute("transform", "translate(0, "+t+")");
		alt.digits.textContent = parseInt(v);
	}

	this.setAttitude = function(params) {
	    params.pitch = Math.round(params.pitch*20)/20;
	    params.roll = Math.round(params.roll*20)/20;
	    if(data.pitch == params.pitch && data.roll == params.roll) return;
		data.pitch = params.pitch;
		data.roll = params.roll;
		pitch = -(params.pitch-settings.attitude.pitchoffset)/10*attitudeOffsetBase;
		roll = -(params.roll-settings.attitude.rolloffset);
		ai.horizonAnim.setAttribute("transform", "rotate("+roll+" "+settings.width/2+" "+settings.height/2+") translate(0, "+pitch+")");
	}

	this.setHeading = function(v) {
		rV = parseInt(v);
		if( rV == 0 && (data.hdg > 2 || data.hdg < 357) ) return;
		if(v == data.hdg) return;
		data.hdg = v;
		hdg.ladder.setAttribute("transform", "rotate("+(-v)+" "+(settings.width/4+8)+" "+(settings.width/3+14)+")");
		hdg.digits.textContent = parseInt(v);
	}

	this.setSlip = function(v) {
		//v = parseInt(v);
		if(v == data.ts) return;
		/*var limit = settings.width/10-16;
		if(v > limit) v = limit;
		if(v < -limit) v = -limit;*/
		
		if(v < -1) v = -1;
		if(v >  1) v =  1;
		var mul = settings.width/10-16;
		
		data.ts = v
		ts.ball.setAttribute("transform", "translate("+(-v*mul)+" 0)");
	}

	this.setClock = function(v){
	  var today = new Date(v);
	  var offset = offset = settings.timezone.summer ? settings.timezone.offset+1 : settings.timezone.offset;
	  today.setHours(today.getUTCHours()+offset);
	  var h = today.getHours();
	  var m = today.getMinutes();
	  var s = today.getSeconds();
	  h = _checkTime(h);
	  m = _checkTime(m);
	  s = _checkTime(s);
	  bottomLeft.clock.textContent = "Clock: "+h+":"+m/*+":"+s*/;
	}
	
	this.setPosition = function(v){
	  var lon = v.lon.toFixed(2);
	  var lat = v.lat.toFixed(2);
	  var latLetter = lat < 0 ? "S" : "N";
	  var lonLetter = lon < 0 ? "O" : "E";
	  lon = Math.abs(lon);
	  lat = Math.abs(lat);
      var str = lat+""+latLetter+" - "+lon+""+lonLetter;
      if( bottomRight.position.textContent != str )
		  bottomRight.position.textContent = str;
	}
	
	this.setETA = function(v){
	  bottomLeft.eta.textContent = "ETA: "+v;
	}

	this.setTimezone = function(v){
	  settings.timezone.offset = v;
	}
	
	this.setSummer = function(v){
	  settings.timezone.summer = v;
	}
	
	this.getSettings = function(){
	  return settings;
	}
	
	this.setCalibration = function(params) {
	  settings.attitude.pitchoffset = params.pitch;
	  settings.attitude.rolloffset = params.roll;
	}
	
	this.getAttitude = function(){
	  return {"pitch": data.pitch, "roll": data.roll};
	}

    this.getQnh = function(){
      return settings.alt.qnh;
    }
    
	this.setQnh = function(v) {
		//v = parseInt(v);
		if(v == data.qnh) return;
		data.qnh = v;
		settings.alt.qnh = v;
		bottomRight.qnh.textContent = "QNH: "+v;
	}
	
	this.setVneSpeed = function(v) {
	  v = parseInt(v);
	  settings.asi.speed.vne = v;
	}
	
	this.setVnoSpeed = function(v) {
	  v = parseInt(v);
	  settings.asi.speed.vno = v;
	}
	
	this.setVfeSpeed = function(v) {
	  v = parseInt(v);
	  settings.asi.speed.vfe = v;
	}
	
	this.setVsoSpeed = function(v) {
	  v = parseInt(v);
	  settings.asi.speed.vso = v;
	}
	
	this.setVsSpeed = function(v) {
	  v = parseInt(v);
	  settings.asi.speed.vs = v;
	}
	
	this.setSpeedTickSpacing = function(v) {
	  v = parseInt(v);
	  settings.asi.tickspacing = v;
	}
	
	this.redrawAsi = function(){
	  asi.remove();
	  asi = _createAsi();
	  parent.append(asi);
	}

	this.setAltitudeTickSpacing = function(v) {
	  v = parseInt(v);
	  settings.alt.tickspacing = v;
	}
	
	this.redrawAlt = function(){
	  alt.remove();
	  alt = _createAlt();
	  parent.append(alt);
	  alt.qnh.textContent = data.qnh;
	  var t = (data.alt/200)*(settings.height/settings.alt.tickspacing);
	  alt.ladder.setAttribute("transform", "translate(0, "+t+")");
	  alt.digits.textContent = parseInt(data.alt);
	}

	var data = {alt:0, qnh:0, spd:0, hdg:0, pitch:0, roll:0};
	var parent = $(this);
	var ai     = _createAi();
	parent.append(ai);
	var asi    = _createAsi();
	parent.append(asi);
	var alt    = _createAlt();
	parent.append(alt);
	var hdg    = _createHdg();
	parent.append(hdg);
	var ts     = _createTs();
	parent.append(ts);
	var bottomLeft = _createBottomLeftTips();
	parent.append(bottomLeft);
	var bottomRight = _createBottomRightTips();
	parent.append(bottomRight);
	
    return this;
  };
}(jQuery));
