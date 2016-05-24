/*Derived marker implementing rotation*/
L.RotatedMarker = L.Marker.extend({
  options: {
    heading:0
  },
  _setPos: function(pos){
    L.Marker.prototype._setPos.call(this, pos);
    if(L.DomUtil.TRANSFORM){
      this._icon.style[L.DomUtil.TRANSFORM]+='rotate('+this.options.heading+'deg)';
    }else if(L.Browser.ie){
      var rad=this.options.heading*(Math.PI/180),costheta=Math.cos(rad),sintheta=Math.sin(rad);
      this._icon.style.filter+='progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'autoexpand\',M11='+costheta+',M12='+(-sintheta)+',M21='+sintheta+',M22='+costheta+')';
    }
  }
});

/*Derived rotating marker drawing an aircraft*/
L.AircraftMarker = L.RotatedMarker.extend({
  options: {
    heading: 0,
    clickable: true,
    keyboard: false,
    getProperties: function(){
      return{};
    },
    icon: L.divIcon({
      iconSize: [60,60],
      iconAnchor: [30,30],
      className: 'aircraft-marker-icon',
      html: '<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet"><path d="M250.2,59.002c11.001,0,20.176,9.165,20.176,20.777v122.24l171.12,95.954v42.779l-171.12-49.501v89.227l40.337,29.946v35.446l-60.52-20.18-60.502,20.166v-35.45l40.341-29.946v-89.227l-171.14,49.51v-42.779l171.14-95.954v-122.24c0-11.612,9.15-20.777,20.16-20.777z" fill="#808080" stroke="black" stroke-width="5"/></svg>',
    }),
    zIndexOffset: 10000,
    updateInterval: 100,
  },
  initialize: function(latlng,options){
    L.RotatedMarker.prototype.initialize(latlng,options);
    L.Util.setOptions(this,options);
  },
  onAdd: function(map){
    L.RotatedMarker.prototype.onAdd.call(this,map);
    this.addTo(this._map);
  },
  onRemove: function(map){
    L.RotatedMarker.prototype.onRemove.call(this,map);
  },
  setHeading: function(hdg){
    this.options.heading=hdg;
  }
});

/*Aircraft marker helper*/
L.aircraftMarker = function(latlng,options){
  return new L.AircraftMarker(latlng,options);
}

L.rotatedMarker = function(pos,options){
  return new L.RotatedMarker(pos,options);
}

/*Derived control for building a custom layer list*/
L.Control.ExternLayers = L.Control.Layers.extend({
  getLayers: function(){
    var arr = [];
    for(i in this._layers){
      arr.push(this._layers[i]);
    }
    return arr;
  },
  getBaseLayers: function(){
    var arr = [];
    for(i in this._layers){
      if(!this._layers[i].overlay)
        arr.push(this._layers[i]);
    }
    return arr;
  },
  getOverlays: function(){
    var arr = [];
    for(i in this._layers){
      if(this._layers[i].overlay)
        arr.push(this._layers[i]);
    }
    return arr;
  }
});

L.control.externLayers = function(baseLayers,overlays,options){
  return new L.Control.ExternLayers(baseLayers,overlays,options);
};

/*Derived control who follow aircraft*/
L.FollowControl = L.Control.extend({
  onAdd: function(map){
    var container = L.DomUtil.create('div','followAircraft');
    container.innerHTML='<img src="img/followAircraft.svg" title="Center on Aircraft"/>';
    container.onclick = function(){
      _followAircraft = true;
      if(_lastPosition != null)
        map.panTo(_lastPosition, {animate:true, noMoveStart:true});
      return true;
    };
    return container;
  }
});

L.followControl = function(){
  return new L.FollowControl();
}

/*Derived control who show menu*/
L.MenuControl = L.Control.extend({
  onAdd: function(map){
    var container = L.DomUtil.create('div','showMenu');
    container.innerHTML = '<img src="menu.svg" title="Show menu"/>';
    container.onclick = function(){
      $("#menu").toggle("slide");
      return false;
    };
    return container;
  }
});

L.menuControl = function(){
  return new L.MenuControl();
}

/*Derived control who show menu*/
L.RecControl = L.Control.extend({
  onAdd: function(map){
    var container = L.DomUtil.create('div','record');
    container.innerHTML = '<img src="rec.svg" title="Record"/>';
    container.onclick = function(){
      this.innerHTML = '<img src="stop.svg" title="Record"/>';
      return false;
    };
    return container;
  }
});

L.recControl = function(){
  return new L.RecControl();
}

/*Derived control who toggle fullscreen*/
L.FullscreenControl = L.Control.extend({
  onAdd: function(map){
    var container = L.DomUtil.create('div','fullScreen');
    container.innerHTML = '<img src="fullscreen.svg" title="Fullscreen"/>';
    container.onclick = function(){
      var element = document.documentElement;
      if(element.requestFullscreen){
        element.requestFullscreen();
      }else if(element.mozRequestFullScreen){
        element.mozRequestFullScreen();
      }else if(element.webkitRequestFullscreen){
        element.webkitRequestFullscreen();
      }else if(element.msRequestFullscreen){
        element.msRequestFullscreen();
      }
      return true;
    };
    return container;
  }
});

L.fullscreenControl = function(){
  return new L.FullscreenControl();
}


/*Derived control who select next wp on GoTo*/
L.NextControl = L.Control.extend({
  onAdd: function(map){
    map.hasNextControl = this;
    var container = L.DomUtil.create('div','nextWaypoint');
    container.innerHTML = '<img src="img/next.svg" title="Next waypoint"/>';
    container.onclick = function(){
      _gotoPositions.shift();
      geo_success(_lastCoord);
      if(_gotoPositions.length <= 1)
        map.removeControl(nextControl);
      return true;
    };
    return container;
  },
  onRemove: function(map){
    delete map.hasNextControl;
  }
});

L.nextControl = function(){
  return new L.NextControl();
}


/*Derived control who clear Goto*/
L.ClearControl = L.Control.extend({
  onAdd: function(map){
    map.hasClearControl = this;
    var container = L.DomUtil.create('div','clearRoute');
    container.innerHTML = '<img src="img/clear.svg" title="Clear route"/>';
    container.onclick = function(){
      map.removeLayer(gotoPath);
      _gotoPositions = [];
      geo_success(_lastCoord);
      map.removeControl(clearControl);
      if(map.hasNextControl)
        map.removeControl(nextControl);
      return true;
    };
    return container;
  },
  onRemove: function(map){
    delete map.hasClearControl;
  }
});

L.clearControl = function(){
  return new L.ClearControl();
}
