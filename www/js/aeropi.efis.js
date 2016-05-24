var svgNS = "http://www.w3.org/2000/svg";

var Efis = function(elem, settings) {
    this.parent   = document.getElementById(elem);
    this.settings = {
      general: {
        width: $(window).width(),
        height: $(window).height(),
      },
      asi: {
        aspectRatio: 5,
        speeds: {
          vne: 0, // never exceed speed (end of orange ruban + red line)
          vno: 0, // max cruise speed (end of green ruban + start of orange ruban)
          vfe: 0, // max speed with flaps extended (end of white ruban)
          vso: 0, // stall speed with flaps extended (start of white ruban)
          vs: 0,  // stall speed with flaps retracted (start of green ruban)
        },
        colors: {
          vne: "red",
          caution: "orange",
          normal: "green",
          flaps: "white",
        },
      },
      alt: {
        aspectRatio: 8,
        maxAlt: 25000,
      },
    };
    $.extend(this.settings.asi, settings.asi);
    $.extend(this.settings.alt, settings.alt);
    $.extend(this.settings.general, settings.general);
    
    
    //$(this.parent).attr("width", this.settings.general.width);
    //$(this.parent).attr("height", this.settings.general.height);
    
    this.data = {alt:0, pressure:0, spd:0, hdg:0, pitch:0, roll:0};


    this.ai = this.createAi();
    this.parent.appendChild(this.ai);

    this.asi = this.createAsi();
    this.parent.appendChild(this.asi);
    
    this.alt = this.createAlt();
    this.parent.appendChild(this.alt);
    
    this.compass = this.createCompass();
    this.parent.appendChild(this.compass);
    

    
/*    this.parent.appendChild(this.createFilters());

    this.horizon = this.createAi();
    this.asi = this.createAsi();
    this.alt = this.createAlt();
    this.compass = this.createCompass();

    this.wrapper = document.createElementNS(svgNS, "g");
    this.wrapper.setAttribute("id", "everything");
    this.wrapper.appendChild(this.horizon);
    this.wrapper.appendChild(this.asi);
    this.wrapper.appendChild(this.alt);
    this.wrapper.appendChild(this.compass);

    this.parent.appendChild(this.wrapper);*/
}

Efis.prototype.createAsi = function(){
    var rectHeight = this.settings.general.height-this.settings.general.height/6;
    var main = document.createElementNS(svgNS, "svg");
    main.setAttribute("id", "asi");
    main.setAttribute("width", 94);
    main.setAttribute("height", rectHeight+16);
    main.setAttribute("style", "position:absolute; top:"+(this.settings.general.height/16-4)+"px;");
    main.appendChild(this.createFilters());

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

    var offsetBase = this.settings.general.height/this.settings.asi.aspectRatio;
    var tips = (this.settings.asi.speeds.vne / 20) + 8;
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
    start = -(this.settings.asi.speeds.vno/20)*(this.settings.general.height/this.settings.asi.aspectRatio);
    end = -(this.settings.asi.speeds.vne/20)*(this.settings.general.height/this.settings.asi.aspectRatio)-start;
    elem = document.createElementNS(svgNS, "path");
    elem.setAttribute("style", "stroke-width:10; stroke:orange;");
    elem.setAttribute("d", "M5 "+start+" l0 "+end);
    main.ladder.appendChild(elem);
    
    start = -(this.settings.asi.speeds.vs/20)*(this.settings.general.height/this.settings.asi.aspectRatio);
    end = -(this.settings.asi.speeds.vno/20)*(this.settings.general.height/this.settings.asi.aspectRatio)-start;
    elem = document.createElementNS(svgNS, "path");
    elem.setAttribute("style", "stroke-width:10; stroke:green;");
    elem.setAttribute("d", "M5 "+start+" l0 "+end);
    main.ladder.appendChild(elem);
    
    start = -(this.settings.asi.speeds.vso/20)*(this.settings.general.height/this.settings.asi.aspectRatio);
    end = -(this.settings.asi.speeds.vfe/20)*(this.settings.general.height/this.settings.asi.aspectRatio)-start;
    elem = document.createElementNS(svgNS, "path");
    elem.setAttribute("style", "stroke-width:4; stroke:white;");
    elem.setAttribute("d", "M2 "+start+" l0 "+end);
    main.ladder.appendChild(elem);
    
    start = -(this.settings.asi.speeds.vne/20)*(this.settings.general.height/this.settings.asi.aspectRatio);
    elem = document.createElementNS(svgNS, "path");
    elem.setAttribute("style", "stroke-width:4; stroke:red;");
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

    return main;
}

Efis.prototype.createAlt = function(){
    var rectHeight = this.settings.general.height-this.settings.general.height/6;
    var topPos = this.settings.general.height/16-4;
    var main = document.createElementNS(svgNS, "svg");
    main.setAttribute("id", "alt");
    main.setAttribute("width", 94);
    main.setAttribute("height", rectHeight+this.settings.general.height/10);
    main.setAttribute("style", "position:absolute; top:"+topPos+"px; left:"+(this.settings.general.width-94)+"px;");
    main.appendChild(this.createFilters());

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
    
    var tips = parseInt(this.settings.alt.maxAlt/200);
    var offset = null;
    var offsetBase = this.settings.general.height/this.settings.alt.aspectRatio;
    
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

    // Bg Digit
    var y = 24+(this.settings.general.height-this.settings.general.height/8)/2;
    elem = document.createElementNS(svgNS, "path");
    elem.setAttribute("style", "fill:#222;");
    elem.setAttribute("d", "M30 "+(topPos+rectHeight-10)+" h62 v24 h-62 Z");
    elem.setAttribute("filter", "url(#shadowSmall)");
    main.appendChild(elem);
    
    main.pressure = document.createElementNS(svgNS, "text");
    main.pressure.setAttribute("style", "font-size:22px; fill:white");
    main.pressure.setAttribute("x", 32);
    main.pressure.setAttribute("y", topPos+rectHeight+10);
    main.pressure.textContent = "0000";
    main.appendChild(main.pressure);
    
    return main;
}

Efis.prototype.createCompass = function(){
    var rectHeight = this.settings.general.height-this.settings.general.height/6;
    var main = document.createElementNS(svgNS, "svg");
    main.setAttribute("id", "hdg");
    main.setAttribute("width", this.settings.general.width/2+16);
    main.setAttribute("height", 74);
    main.setAttribute("style", "position:absolute; top:"+(this.settings.general.height-74)+"px; left:"+(this.settings.general.width/4-4)+"px;");
    //main.setAttribute("style", "position:fixed; bottom:0; left:"+(this.settings.general.width/4-4)+"px;");
    main.appendChild(this.createFilters());

    elem = document.createElementNS(svgNS, "rect");
    elem.setAttribute("x", 8);
    elem.setAttribute("y", 8);
    elem.setAttribute("rx", 12);
    elem.setAttribute("ry", 12);
    elem.setAttribute("height", 92);
    elem.setAttribute("width", this.settings.general.width/2);
    elem.setAttribute("style", "fill:black; fill-opacity:0.12; stroke:white; stroke-width:2; stroke-opacity:0.5;");
    elem.setAttribute("filter", "url(#shadow)");
    main.appendChild(elem);

    main.ladder = document.createElementNS(svgNS, "g");
    main.ladder.setAttribute("id", "compassLadder");

    var radius = this.settings.general.width/3;
    var x1 = this.settings.general.width/4+8;
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























Efis.prototype.createAi = function(){
    var rectHeight = this.settings.general.height-this.settings.general.height/6;
    var main = document.createElementNS(svgNS, "svg");
    main.setAttribute("id", "ai");
    main.setAttribute("width", this.settings.general.width);
    main.setAttribute("height", this.settings.general.height);
    main.setAttribute("style", "position:absolute;");
    main.appendChild(this.createFilters());

    
    // Animated parts
    main.horizonAnim = document.createElementNS(svgNS, "g");
    main.horizonAnim.setAttribute("id", "horizonAnim");
    // ground
    elem = document.createElementNS(svgNS, "rect");
    elem.setAttribute("id","ground");
    elem.setAttribute("x", -this.settings.general.width/4);
    elem.setAttribute("y", this.settings.general.height/2);
    elem.setAttribute("rx",0);
    elem.setAttribute("ry",0);
    elem.setAttribute("height", this.settings.general.height*3);
    elem.setAttribute("width", this.settings.general.width+(this.settings.general.width/2));
    elem.setAttribute("style", "fill:#BF8144; stroke:white; stroke-width:2");
    main.horizonAnim.appendChild(elem);
    // sky
    elem = document.createElementNS(svgNS, "rect");
    elem.setAttribute("id","sky");
    elem.setAttribute("x", -this.settings.general.width/4);
    elem.setAttribute("y", -(this.settings.general.height/2)*5);
    elem.setAttribute("rx",0);
    elem.setAttribute("ry",0);
    elem.setAttribute("height", this.settings.general.height*3);
    elem.setAttribute("width", this.settings.general.width+(this.settings.general.width/2));
    elem.setAttribute("style", "fill:#4C78A9; stroke:white; stroke-width:2");
    main.horizonAnim.appendChild(elem);
    
    main.horizonAnim.ladder = document.createElementNS(svgNS, "g");
    main.horizonAnim.ladder.setAttribute("id", "horizonLadder");
    
    var offsetBase = (this.settings.general.height / 2 - this.settings.general.height / 16) / 4;
    var longLineLength = this.settings.general.width / 3.2;
    var longLeftOffset = (this.settings.general.width - longLineLength)/2;
    var shortLineLength = this.settings.general.width / 5;
    var shortLeftOffset = (this.settings.general.width - shortLineLength)/2;
    
    for(var i=0; i<4; i++){
      if(i==3)
        continue;      

      elem = document.createElementNS(svgNS, "path");
      elem.setAttribute("style", "stroke:#FFF; stroke-width:2; stroke-opacity:0.6; fill-opacity:0");
      offset = (offsetBase*i)+offsetBase;
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
      offset = (offsetBase*-i)-offsetBase;
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
      offset = (offsetBase*i)+offsetBase/2;
      elem.setAttribute("d", "M"+shortLeftOffset+" "+offset+" h"+shortLineLength);
      main.horizonAnim.ladder.appendChild(elem);

      elem = document.createElementNS(svgNS, "path");
      elem.setAttribute("style", "stroke:#FFF; stroke-width:2; stroke-opacity:0.4; fill-opacity:0");
      offset = (offsetBase*-i)-offsetBase/2;
      elem.setAttribute("d", "M"+shortLeftOffset+" "+offset+" h"+shortLineLength);
      main.horizonAnim.ladder.appendChild(elem);
      
    }
    
    main.horizonAnim.ladder.setAttribute("transform", "translate(0 "+this.settings.general.height/2+")");
    main.horizonAnim.appendChild(main.horizonAnim.ladder);
    main.appendChild(main.horizonAnim);
    
    // Fixed central marker
    elem = document.createElementNS(svgNS, "path");
    elem.setAttribute("style", "stroke:#FFF; stroke-width:2; fill-opacity:0;");
    elem.setAttribute("d", "M"+shortLeftOffset+" "+this.settings.general.height/2+" h"+shortLineLength/6+" l"+shortLineLength/6+" 20 l"+shortLineLength/6+" -20 l"+shortLineLength/6+" 20 l"+shortLineLength/6+" -20 h"+shortLineLength/6+"");
    main.appendChild(elem);
    return main;
}

Efis.prototype.createFilters = function() {
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
  elem.setAttribute("y", -(this.settings.general.height/2 - this.settings.general.height/16)+9);
  elem.setAttribute("width", 78);
  elem.setAttribute("height", this.settings.general.height-(this.settings.general.height/8)-2);
  filter.appendChild(elem);
  defs.appendChild(filter);

  // ALT clip
  filter = document.createElementNS(svgNS, "clipPath");
  filter.setAttribute("id", "altClip");
  elem = document.createElementNS(svgNS, "rect");
  elem.setAttribute("x", -68);
  elem.setAttribute("y", -(this.settings.general.height/2 - this.settings.general.height/16)+9);
  elem.setAttribute("width", 78);
  elem.setAttribute("height", this.settings.general.height-(this.settings.general.height/8)-12);
  filter.appendChild(elem);
  defs.appendChild(filter);
  return defs;
}

Efis.prototype.setSpeed = function(v) {
    v = parseInt(v);
    if(v == this.data.spd) return;
    this.data.spd = v;
    var t = (v/20)*(this.settings.general.height/this.settings.asi.aspectRatio);
    this.asi.ladder.setAttribute("transform", "translate(0, "+t+")");
    this.asi.digits.textContent = v;
}

Efis.prototype.setAltitude = function(v) {
    v = parseInt(v);
    if(v == this.data.alt) return;
    this.data.alt = v;
    var t = (v/200)*(this.settings.general.height/this.settings.alt.aspectRatio);
    this.alt.ladder.setAttribute("transform", "translate(0, "+t+")");
    this.alt.digits.textContent = v;
}

Efis.prototype.setAttitude = function(params) {
  pitch = parseInt(-params.pitch)/10*56;
  roll = parseInt(params.roll);
  this.ai.horizonAnim.setAttribute("transform", "rotate("+roll+" "+this.settings.general.width/2+" "+this.settings.general.height/2+") translate(0, "+pitch+")");
}

Efis.prototype.setHeading = function(v) {
  v = parseInt(v);
  if(v == this.data.hdg) return;
  this.data.hdg = v;
  //this.compass.ladder.setAttribute("transform", "rotate("+(-v)+" "+this.settings.general.width/2+" "+this.settings.general.width/4+")");
  this.compass.ladder.setAttribute("transform", "rotate("+(-v)+" "+(this.settings.general.width/4+8)+" "+(this.settings.general.width/3+14)+")");
  this.compass.digits.textContent = v;
}

Efis.prototype.setPressure = function(v) {
  v = parseInt(v);
  if(v == this.data.pressure) return;
  this.data.pressure = v;
  this.alt.pressure.textContent = v;
}
