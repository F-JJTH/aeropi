function Unit(data) {
  // Variables
/*  this.id = '';
  this.type = '';
  this.icon = '';
  this.heading = 0;
  this.altitude = 0;
  this.latitude = 0;
  this.longitude = 0;
  this.speed = 0;
  this.pitch = 0;
  this.bank = 0;
  this.altimeterMb = 1013.25;
  this.googleMarker = null;
  this.vertSpeed = 0;*/

  // Methods
  this.update = function(data) {

    if (data != undefined) {    
      if(data.hdg != undefined)
        this.heading = data.hdg;
      if(data.alt != undefined)
        this.altitude = data.alt;
      if(data.lat != undefined)
        this.latitude = data.lat;
      if(data.lon != undefined)
        this.longitude = data.lon;
      if(data.spd != undefined)
        this.speed = data.spd;
      if(data.pitch != undefined)
        this.pitch = data.pitch;
      if(data.bank != undefined)
        this.bank = data.bank;
      if(data.altMb != undefined)
        this.altimeterMb = data.altMb;
      if(data.vs != undefined)
        this.vertSpeed = data.vs/1000;
    }
  }

  // Constructor (kinda)
  if (data != undefined) {
    this.update(data);
  }
}


function Instruments() {
  // Updates the indicators
  this.update = function(data, indicators) {
    // Checks if we have data
    if (data != undefined) {
      // Unit instance
      unit = new Unit(data)
      // Updates the indicators
      if(unit.bank != undefined)
        indicators.attitude.setRoll(unit.bank);
      if(unit.pitch != undefined)
        indicators.attitude.setPitch(unit.pitch);
      if(unit.heading != undefined)
        indicators.heading.setHeading(unit.heading);
      if(unit.vertSpeed != undefined)
        indicators.variometer.setVario(unit.vertSpeed);
      if(unit.speed != undefined)
        indicators.airspeed.setAirSpeed(unit.speed);
      if(unit.speed != undefined)
        indicators.altimeter.setAltitude(unit.altitude);
      if(unit.altimeterMb != undefined)
        indicators.altimeter.setPressure(unit.altimeterMb);
    }
  }
}

function getMainHeight() {
  var bodyHeight = $(window).width();
  var top = $('#top').height();
  var bottom = $('#bottom').height();
  return bodyHeight-top-bottom;
}


(function($) {
	function FlightIndicator( placeholder, type, options ) {
		// Initial configuration
		var attitude = this;
		var settings = $.extend({
			size : ($(window).width()/100)*40,
			roll : 0,
			pitch : 0,
			rollOffset : 0,
			pitchOffset : 0,
			heading: 0,
			vario: 0,
			airspeed: 0,
			altitude: 0,
			pressure: 1000,
			showBox : false,
			img_directory : 'img/'
		}, options );

		var constants = {
			pitch_bound:30,
			vario_bound : 1.95,
			airspeed_bound_l : 0,
			airspeed_bound_h : 160
		}

		// Creation of the instrument
		placeholder.each(function(){
			switch(type){
				case 'heading':
					$(this).html('<div class="instrument heading"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><div class="heading box"><img src="' + settings.img_directory + 'heading_yaw.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'heading_mechanics.svg" class="box" alt="" /><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
					_setHeading(settings.heading);
				break;
				case 'variometer':
					$(this).html('<div class="instrument vario"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><img src="' + settings.img_directory + 'vertical_mechanics.svg" class="box" alt="" /><div class="vario box"><img src="' + settings.img_directory + 'fi_needle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
					_setVario(settings.vario);
				break;
				case 'airspeed':
					$(this).html('<div class="instrument airspeed"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><img src="' + settings.img_directory + 'speed_mechanics.svg" class="box" alt="" /><div class="speed box"><img src="' + settings.img_directory + 'fi_needle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
					_setAirSpeed(settings.airspeed);
				break
				case 'altimeter':
					$(this).html('<div class="instrument altimeter"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><div class="pressure box"><img src="' + settings.img_directory + 'altitude_pressure.svg" class="box" alt="" /></div><img src="' + settings.img_directory + 'altitude_ticks.svg" class="box" alt="" /><div class="needleSmall box"><img src="' + settings.img_directory + 'fi_needle_small.svg" class="box" alt="" /></div><div class="needle box"><img src="' + settings.img_directory + 'fi_needle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
					_setAltitude(settings.altitude);
					_setPressure(settings.pressure);
				break;
				default:
					$(this).html('<div class="instrument attitude"><img src="' + settings.img_directory + 'fi_box.svg" class="background box" alt="" /><div class="roll box"><img src="' + settings.img_directory + 'horizon_back.svg" class="box" alt="" /><div class="pitch box"><img src="' + settings.img_directory + 'horizon_ball.svg" class="box" alt="" /></div><img src="' + settings.img_directory + 'horizon_circle.svg" class="box" alt="" /></div><div class="mechanics box"><img src="' + settings.img_directory + 'horizon_mechanics.svg" class="box" alt="" /><img src="' + settings.img_directory + 'fi_circle.svg" class="box" alt="" /></div></div>');
					_setRoll(settings.roll);
					_setPitch(settings.pitch);
			}
			$(this).find('div.instrument').css({height : settings.size, width : settings.size});
			$(this).find('div.instrument img.box.background').toggle(settings.showBox);
		});

		// Private methods
		function _setRoll(roll){
			placeholder.each(function(){
			        settings.roll = roll;
				roll = roll + settings.rollOffset;
				$(this).find('div.instrument.attitude div.roll').css('transform', 'rotate('+(roll)+'deg)');
			});
		}

		function _setPitch(pitch){
			settings.pitch = pitch;
		        pitch = pitch + settings.pitchOffset;
			if(pitch>constants.pitch_bound){pitch = constants.pitch_bound;}
			else if(pitch<-constants.pitch_bound){pitch = -constants.pitch_bound;}
			placeholder.each(function(){
				$(this).find('div.instrument.attitude div.roll div.pitch').css('top', pitch*0.7 + '%');
			});
		}

		function _setHeading(heading){
			placeholder.each(function(){
				$(this).find('div.instrument.heading div.heading').css('transform', 'rotate(' + -heading + 'deg)');
			});	
		}

		function _setVario(vario){
			if(vario > constants.vario_bound){vario = constants.vario_bound;}
			else if(vario < -constants.vario_bound){vario = -constants.vario_bound;}
			vario = vario*90;
			placeholder.each(function(){
				$(this).find('div.instrument.vario div.vario').css('transform', 'rotate(' + vario + 'deg)');
			});	
		}

		function _setAirSpeed(speed){
			if(speed > constants.airspeed_bound_h){speed = constants.airspeed_bound_h;}
			else if(speed < constants.airspeed_bound_l){speed = constants.airspeed_bound_l;}
			speed = 90+speed*2;
			placeholder.each(function(){
				$(this).find('div.instrument.airspeed div.speed').css('transform', 'rotate(' + speed + 'deg)');
			});	
		}

		function _setAltitude(altitude){
			var needle = 90 + altitude%1000 * 360 / 1000;
			var needleSmall = altitude / 10000 * 360;
			placeholder.each(function(){
				$(this).find('div.instrument.altimeter div.needle').css('transform', 'rotate(' + needle + 'deg)');
				$(this).find('div.instrument.altimeter div.needleSmall').css('transform', 'rotate(' + needleSmall + 'deg)');
			});	
		}

		function _setPressure(pressure){
			pressure = 2*pressure - 1980;
			placeholder.each(function(){
				$(this).find('div.instrument.altimeter div.pressure').css('transform', 'rotate(' + pressure + 'deg)');
			});	
		}

		function _resize(size){
			placeholder.each(function(){
				$(this).find('div.instrument').css({height : size, width : size});
			});
		}

		function _showBox(){
			placeholder.each(function(){
				$(this).find('img.box.background').show();
			});
		}

		function _hideBox(){
			placeholder.each(function(){
				$(this).find('img.box.background').hide();
			});
		}
		
		function _calibrate(){
			settings.pitchOffset = -settings.pitch;
			settings.rollOffset = -settings.roll;
		}

		// Public methods
		this.calibrate = function(){_calibrate();}
		this.setRoll = function(roll){_setRoll(roll);}
		this.setPitch = function(pitch){_setPitch(pitch);}
		this.setHeading = function(heading){_setHeading(heading);}
		this.setVario = function(vario){_setVario(vario);}
		this.setAirSpeed = function(speed){_setAirSpeed(speed);}
		this.setAltitude = function(altitude){_setAltitude(altitude);}
		this.setPressure = function(pressure){_setPressure(pressure);}
		this.resize = function(size){_resize(size);}
		this.showBox = function(){_showBox();}
		this.hideBox = function(){_hideBox();}

		return attitude;
	};

	// Extension to jQuery
	$.flightIndicator = function(placeholder, type, options){
		var flightIndicator = new FlightIndicator($(placeholder), type, options)
		return flightIndicator;
	}

	$.fn.flightIndicator = function(data, type, options){
		return this.each(function(){
			$.flightIndicator(this, type, options);
		});
	}
}( jQuery ));
