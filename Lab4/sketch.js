//https://www.census.gov/data/tables/time-series/dec/center-pop-text.html
var geojson;
// control that shows state info on hover
var info = L.control();
// Buttons
var buttons = L.control();
//Define tables
let colors_csv;
let centroids_csv;
let attributes_0_1;
let data;
//Global variables
var current_year = 1964;
var current_attribute = "Norm_Population";
var newColor='#FF0000';
var map ;
let polyline;
let polyline_pop;
let lastCircle = null;
let lastCircle_pop = null;

let state;
let value;
let value_rate;
let columnName;
let columnName_rate;
let max_value;

//------------------------------------------------------------------------------------
// Here I preload the CSV I am going to use
function preload(){
  colors_csv = loadTable('color_combinations.csv', 'csv', 'header');
  centroids_csv = loadTable('data/StateCentroids.csv', 'csv', 'header');
  attributes_0_1 = loadTable('data/data_normalized_0_to_1.csv', 'csv', 'header');
  lines = loadTable('data/CentroidMassByAttributeAndYear.csv', 'csv', 'header');
  data = loadTable('data/CrimeByState.csv', 'csv', 'header');
}
//------------------------------------------------------------------------------------
function findValue(layer) {
  max_value = Number.MIN_SAFE_INTEGER;
  state=layer.feature.properties.name;
    // Mapeo de nombres de atributos
    const attributeMap = {
        'Norm_Population': 'Population',
        'total_crime_index': '',
        'Index.offenses.total': 'Index offenses total',
        'Violent.crime.total': 'Violent crime total',
        'Murder.and.nonnegligent.Manslaughter': 'Murder and nonnegligent Manslaughter',
        'Forcible.rape': 'Forcible rape',
        'Robbery': 'Robbery',
        'Aggravated.assault': 'Aggravated assault',
        'Property.crime.total': 'Property crime total',
        'Burglary': 'Burglary',
        'Larceny.theft': 'Larceny-theft',
        'Motor.vehicle.theft': 'Motor vehicle'
      
    };
  const attributeMap_rate = {
        'Norm_Population': 'Population rate',
        'total_crime_index': '',
        'Index.offenses.total': 'Index offense rate',
        'Violent.crime.total': 'Violent Crime rate',
        'Murder.and.nonnegligent.Manslaughter': 'Murder and nonnegligent manslaughter rate',
        'Forcible.rape': 'Forcible rape rate',
        'Robbery': 'Robbery rate',
        'Aggravated.assault': 'Aggravated assault rate',
        'Property.crime.total': 'Property crime rate',
        'Burglary': 'Burglary rate',
        'Larceny.theft': 'Larceny-theft rate',
        'Motor.vehicle.theft': 'Motor vehicle theft rate'
      
    };


    if (attributeMap.hasOwnProperty(current_attribute)) {
    columnName = attributeMap[current_attribute];
    columnName_rate = attributeMap_rate[current_attribute];

    // Buscar el valor máximo en la tabla CSV
    for (let i = 0; i < data.getRowCount(); i++) {
        const csvYear = Number(data.get(i, 'Year'));
        const csvState = data.get(i, 'State');
        const value_to_check = Number(data.get(i, columnName));
        const value_to_check_rate = Number(data.get(i, columnName_rate));

        if (csvYear === current_year && value_to_check_rate > max_value) {
            max_value = value_to_check_rate;
          print(csvState);
        }

        if (csvYear === current_year && csvState === state) {
            value = value_to_check;
            value_rate = value_to_check_rate;
        }
    }
    }
}
//------------------------------------------------------------------------------------

function setup() { 
  noCanvas();
map = L.map('mapid', {
    dragging: false,  // Desactivar la capacidad de arrastre del mapa
    zoomControl: false 
  }).setView([35, -96], 4);
	L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
    attribution: ''
}).addTo(map);
  
    map.scrollWheelZoom.disable();

  
  //-------------------------------------------------------------------
  info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

  info.update = function (props) {
    if(current_attribute!="Norm_Population" && current_attribute!="total_crime_index")
      {
        this._div.innerHTML = '<h4 style="color:'+this.titleColor+';">Statistics</h4>' +  (props ?
			'<b>' +"State: "+ props.name + '</b><br />' +                                                        props.density + ' people / mi<sup>2</sup>'+'<br />'+
             columnName+" in "+current_year+": "+value+","+'<br />'+
             "The "+columnName_rate+" was: "+value_rate+'<br />'+
            "The maximum rate value in "+current_year+" in the US was: "+max_value+'<br />'                                                      
			: 'Hover over a state');
	}
    else if(current_attribute==="Norm_Population"){
        this._div.innerHTML = '<h4 style="color:'+this.titleColor+';">Statistics</h4>' +  (props ?
			'<b>' +"State: "+ props.name + '</b><br />' +                                                        props.density + ' people / mi<sup>2</sup>'+'<br />'+  
                                                                                           "Population in "+current_year+": "+value+'<br />'
			: 'Hover over a state');
	}
    else{
        this._div.innerHTML = '<h4 style="color:'+this.titleColor+';">Statistics</h4>' +  (props ?
			'<b>' +"State: "+ props.name + '</b><br />' +                                                        props.density + ' people / mi<sup>2</sup>'+'<br />'
			: 'Hover over a state');
	}
  info.updateColor = function (newColor) {
    this.titleColor = newColor; // Asignar el nuevo color al atributo 'colorTitulo'
    this.update(); // Llamar a 'update' para actualizar el contenido con el nuevo color
        
      }
		
};
  
  info.addTo(map);	
  //-------------------------------------------------------------------
  

  buttons.onAdd = function (map) 
  {
  this._div = L.DomUtil.create('div', 'button_settings');
  //------------------------------------------------------------
  //Population
  const button = L.DomUtil.create('button', 'buttons', this._div);
  button.innerHTML = 'Population';
  button.style.backgroundColor = colors_csv.get(0,2);
  button.style.color = 'white';

    button.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Population');
    current_attribute="Norm_Population";
    newColor=colors_csv.get(0,2);
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
    clearLine();
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
      
  });
  //------------------------------------------------------------
  //Total_crime_index
  const button2 = L.DomUtil.create('button', 'buttons', this._div);
  button2.innerHTML = 'TotalCrime';
  button2.style.backgroundColor = colors_csv.get(1,2);
  button2.style.color = 'white';
  button2.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('total_crime_index');
    current_attribute="total_crime_index";
    newColor=colors_csv.get(1,2);
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
    clearLine();
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Index.offenses.total
  const button3 = L.DomUtil.create('button', 'buttons', this._div);
  button3.innerHTML = 'TotalOffenses';
  button3.style.backgroundColor = colors_csv.get(2,2);
  button3.style.color = 'white';
  button3.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Index.offenses.total');
    current_attribute="Index.offenses.total";
    newColor=colors_csv.get(2,2);
    clearLine();
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Violent.crime.total
  const button4 = L.DomUtil.create('button', 'buttons', this._div);
  button4.innerHTML = 'ViolentCrime';
    button4.style.backgroundColor = colors_csv.get(3,2);
    button4.style.color = 'white';
    button4.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Violent.crime.total');
    current_attribute="Violent.crime.total";
    newColor=colors_csv.get(3,2);
    info.updateColor(newColor);
      slider.noUiSlider.set(1960);
      clearLine();
      var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
  //------------------------------------------------------------
  //Murder.and.nonnegligent.Manslaughter
  const button5 = L.DomUtil.create('button', 'buttons', this._div);
  button5.innerHTML = 'Mrdr&Nonegnt';
  button5.style.backgroundColor = colors_csv.get(4,2);
  button5.style.color = 'rgb(0,0,0)';
  button5.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Murder.and.nonnegligent.Manslaughter');
    current_attribute="Murder.and.nonnegligent.Manslaughter";
    newColor=colors_csv.get(4,2);
    clearLine();
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Forcible.rape
  const button6 = L.DomUtil.create('button', 'buttons', this._div);
  button6.innerHTML = 'ForcibleRape';
  button6.style.backgroundColor = colors_csv.get(5,2);
  button6.style.color = 'rgb(0,0,0)';
  button6.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Forcible.rape');
    current_attribute="Forcible.rape";
    newColor=colors_csv.get(5,2);
    info.updateColor(newColor);
    clearLine();
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;

  });
  //------------------------------------------------------------
  //Robbery
  const button8 = L.DomUtil.create('button', 'buttons', this._div);
  button8.innerHTML = 'Robbery';
  button8.style.backgroundColor = colors_csv.get(6,2);
  button8.style.color = 'white';
  button8.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Robbery');
    current_attribute="Robbery";
    newColor=colors_csv.get(6,2);
    info.updateColor(newColor);
    clearLine();
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Aggravated.assault
  const button9 = L.DomUtil.create('button', 'buttons', this._div);
  button9.innerHTML = 'AgrvtdAssault';
  button9.style.backgroundColor = colors_csv.get(7,2);
  button9.style.color = 'rgb(0,0,0)';
  button9.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Aggravated.assault');
    current_attribute="Aggravated.assault";
    newColor=colors_csv.get(7,2);
    info.updateColor(newColor);
    clearLine();
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Property.crime.total
  const button10 = L.DomUtil.create('button', 'buttons', this._div);
  button10.innerHTML = 'PropertyCrime';
    button10.style.backgroundColor = colors_csv.get(8,2);
    button10.style.color = 'white';
    button10.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Property.crime.total');
    newColor=colors_csv.get(8,2);
    info.updateColor(newColor);
      clearLine();
    current_attribute="Property.crime.total";
    slider.noUiSlider.set(1960);
      var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
  //------------------------------------------------------------
  //Burglary
  const button11 = L.DomUtil.create('button', 'buttons', this._div);
  button11.innerHTML = 'Burglary';
  button11.style.backgroundColor = colors_csv.get(9,2);
  button11.style.color = 'white';
  button11.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Burglary');
    current_attribute="Burglary";
    clearLine();
    newColor=colors_csv.get(9,2);
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Larceny.theft
  const button13 = L.DomUtil.create('button', 'buttons', this._div);
  button13.innerHTML = 'LarcenyTheft';
    button13.style.backgroundColor = colors_csv.get(10,2);
    button13.style.color = 'white';
    button13.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Larceny.theft');
    current_attribute="Larceny.theft";
    newColor=colors_csv.get(10,2);
      clearLine();
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
      var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
    //Motor.vehicle.theft
  const button15 = L.DomUtil.create('button', 'buttons', this._div);
  button15.innerHTML = 'VehicleTheft';
    button15.style.backgroundColor = colors_csv.get(11,2);
    button15.style.color = 'white';
  button15.addEventListener('click', function() {
    // Acciones al hacer clic en el botón del nuevo control
    console.log('Motor.vehicle.theft');
    current_attribute="Motor.vehicle.theft";
    newColor=colors_csv.get(11,2);
    clearLine();
    info.updateColor(newColor);
    slider.noUiSlider.set(1960);
    var noUiHandle = document.querySelector('.noUi-handle');
    noUiHandle.style.backgroundColor = newColor;
  });
    //------------------------------------------------------------
  return this._div;
};

// Añadir el nuevo control al mapa
buttons.addTo(map);
    //-------------------------------------------------------------------
  geojson = L.geoJson(statesData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);

  //-------------------------------------------------------------------
// Modifica el código donde creas el control deslizante para agregar un elemento para mostrar el año seleccionado
var sliderControl = L.control({
    position: 'topright'
});

sliderControl.onAdd = function (map) {
    var slider = L.DomUtil.create('div', 'year-slider');
    slider.innerHTML = '<div id="year-slider"></div>' +
        '<div class="selected-year-container"><div id="selected-year"></div></div>';
    L.DomEvent.disableClickPropagation(slider);
    return slider;
};


sliderControl.addTo(map);

var slider = document.getElementById('year-slider');
var selectedYear = document.getElementById('selected-year'); // Obtén el elemento para mostrar el año seleccionado

noUiSlider.create(slider, {
    start: [1960],
    step: 1,
    range: {
        'min': 1960,
        'max': 2014
    }
});

slider.noUiSlider.on('update', function (values, handle) {
    // Actualiza el valor del año seleccionado en el elemento HTML
    selectedYear.innerHTML = 'Year: ' + parseInt(values[handle]);
});

slider.noUiSlider.on('change', function (values, handle) {
    // Llama a una función para dibujar la línea según el valor del slider
    drawLines(parseInt(values[handle]));
});

    slider.noUiSlider.on('update', function (values, handle) {
    var selectedYear = parseInt(values[handle]);
    current_year = selectedYear;

    // Recorrer cada estado en el GeoJSON y actualizar su estilo según el nuevo año
    geojson.eachLayer(function (layer) {
        layer.setStyle(style(layer.feature));
    });
});
  
    //-------------------------------------------------------------------
// Crear una línea
  var lineCoordinates = [
    [0, 0], // Punto inicial (latitud, longitud)
    [0, 0] // Punto final (latitud, longitud)
  ];

  polyline = L.polyline(lineCoordinates, { color: 'rgb(240,13,13)' }).addTo(map);
  //-------------------------------------------------------------------
  
  //-------------------------------------------------------------------
  // Add centroids
  for (let i = 0; i < centroids_csv.getRowCount(); i++) 
  {
    let state = centroids_csv.get(i, 'State');
    let latitude = centroids_csv.get(i, 'latitude');
    let longitude = centroids_csv.get(i, 'longitude');

    // Con esta linea que he comentado en vez de aparecer puntos aparecen marcadores donde puedo pinchar en ellos
    // Verificar que las coordenadas sean válidas antes de dibujar el punto
    if (!isNaN(latitude) && !isNaN(longitude)) 
    {
      L.circle([latitude, longitude], {
    color: 'red', // Color del borde del círculo
    fillColor: 'red', // Color de relleno del círculo
    fillOpacity: 1, // Opacidad del relleno del círculo
    radius: 9000 // Radio del círculo en metros
  }).addTo(map);
    }
  } 
  //-------------------------------------------------------------------
  
  var SwitchControl = L.Control.extend({
    onAdd: function(map) {
      var container = L.DomUtil.create('div', 'switch-control-container');
      container.style.position = 'absolute';
      container.style.top = '6px'; 
      container.style.left = '490px'; 
      
      var checkbox = L.DomUtil.create('input', 'switch-control-input', container);
      checkbox.type = 'checkbox';
      checkbox.checked = false; // Valor inicial del interruptor
      checkbox.style.backgroundColor = newColor; // Cambia el color de fondo del botón
      checkbox.style.color = 'white'; // Cambia el color del texto del botón
      checkbox.style.position = 'absolute';
      checkbox.style.top = '0px'; 
      checkbox.style.left = '-150px'; 
      

      checkbox.type = 'checkbox';
      checkbox.checked = false; // Valor inicial del interruptor

      checkbox.addEventListener('change', function() {
        if (this.checked) {
          map.setView([38, -92], 6.5);
          

        } else {
          map.setView([35, -100], 4);
          

        }
        

      return container;
      });
      var text = L.DomUtil.create('span', 'switch-control-text', container);
      text.innerHTML = 'Zoom In'; // Aquí puedes poner el texto que desees
      text.style.position = 'absolute';
      text.style.top = '0px'; 
      text.style.left = '-130px'; 
      

      return container;
    }
  });
  var switchControl = new SwitchControl({ position: 'topright' });
  switchControl.addTo(map);

} 



function draw() { 
}

//------------------------------------------------------------------------------------
function drawLines(year) {  
    let filteredData = []; // Aquí almacenaremos los datos filtrados
    let filteredDataPopulation = []; // Aquí almacenaremos los datos filtrados
  
  
    let lastLatitude;
    let lastLongitude;
    let lastLatitude_pop;
    let lastLongitude_pop;
    for (let i = 0; i < lines.getRowCount(); i++) {
      
      let csvYear = lines.get(i, 'Year');
      let csvAttribute = lines.get(i, 'Attribute');
      let latitude = lines.get(i, 'Weighted_Latitude');
      let longitude = lines.get(i, 'Weighted_Longitude');
      
      let latitude_pop = lines.get(i, 'Weighted_Latitude');
      let longitude_pop = lines.get(i, 'Weighted_Longitude');

        // Comprueba si el año está dentro del rango y si el atributo coincide
        if (csvYear <= year && csvAttribute === current_attribute) {
            filteredData.push([csvYear,latitude, longitude]);
          if(csvYear == year)
            {
                lastLatitude = latitude;
                lastLongitude = longitude;
                long=longitude;
            }
        }
        if(csvYear <= year && csvAttribute==="Norm_Population")
          {
            filteredDataPopulation.push([csvYear,latitude, longitude]);
            if(csvYear == year)
            {
                lastLatitude_pop = latitude;
                lastLongitude_pop = longitude;
            }
          }
    }
      let coordinates = [];
      let coordinates_pop = [];
    // Borrar la línea existente si hay alguna
      filteredData.sort((a, b) => a[0] - b[0]);
      filteredDataPopulation.sort((a, b) => a[0] - b[0]); 
      for (let i = 0; i < filteredData.length; i++) {
      let latitude1 = filteredData[i][1];
      let longitude1 = filteredData[i][2];
      let latitudePop = filteredDataPopulation[i][1];
      let longitudePop = filteredDataPopulation[i][2];
    
      coordinates.push([latitude1, longitude1]);
      coordinates_pop.push([latitudePop, longitudePop]);
      }      
  
  
    clearLine();
    // Iterar a través de los datos filtrados para dibujar líneas entre cada par de puntos
        polyline = L.polyline(coordinates, { color: newColor }).addTo(map);
        polyline_pop = L.polyline(coordinates_pop, { color: 'black' }).addTo(map);


        // Añadir un círculo en la última posición de la línea
        lastCircle = L.circle([lastLatitude, lastLongitude], {
            color: 'black',
            fillColor: 'newColor',
            fillOpacity: 0.35,
            radius: 9000
        }).addTo(map);
  
        // Añadir un círculo en la última posición de la línea
        lastCircle_pop = L.circle([lastLatitude_pop, lastLongitude_pop], {
            color: 'black',
            fillColor: 'black',
            fillOpacity: 0.35,
            radius: 9000
        }).addTo(map);
}
function clearLine() {
    if (polyline && map.hasLayer(polyline)) {
        map.removeLayer(polyline); // Eliminar la línea del mapa si está presente
    }
  if (polyline_pop && map.hasLayer(polyline_pop)) {
        map.removeLayer(polyline_pop); // Eliminar la línea del mapa si está presente
    }
  if (lastCircle) {
        map.removeLayer(lastCircle);
        lastCircle = null; // Limpiar la referencia al círculo
    }
  if (lastCircle_pop) {
        map.removeLayer(lastCircle_pop);
        lastCircle_pop = null; // Limpiar la referencia al círculo
    }
}


//------------------------------------------------------------------------------------
// Create a function to find the color scale according to the attribute and normalized value of the attribute
function find_value(state){
  let attributeIndex = attributes_0_1.columns.indexOf(current_attribute);
  for (let i = 0; i < attributes_0_1.getRowCount(); i++) {
    let current_row = attributes_0_1.getRow(i);
    let csvYear = current_row.getNum('Year');
    let csvState = current_row.getString('State');
    let csvValue = current_row.get(attributeIndex);
    if (csvYear === current_year && csvState === state) {
      return csvValue;
    }
    
  }
}
function scaleColor(state) {
  let colorOne;
  let colorZero;
  //--------------------------------------------------------------
  let normalizedValue =find_value(state);
  // Retrieve the corresponding colors for the attribute from the 'colors' variable
  //----------------------------------------------------------------
   for (let i = 0; i < colors_csv.getRowCount(); i++) {
      let attribute = colors_csv.get(i,0);
      if (attribute === current_attribute) {
        
        colorOne = colors_csv.get(i, 'one_color');
        colorZero = colors_csv.get(i, 'zero_color');
        break;
      }
    }
  
  // Interpolating colors using lerpColor()
  let interpolatedColor = lerpColor(color(colorZero), color(colorOne), normalizedValue);
  // Returning the color in hexadecimal notation
  let final_color = '#' + hex(interpolatedColor.levels[0], 2) + hex(interpolatedColor.levels[1], 2) + hex(interpolatedColor.levels[2], 2);
  return final_color;
}
//------------------------------------------------------------------------------------
function style(feature) {
    return {
        fillColor: scaleColor(feature.properties.name),
        weight: 2,
        opacity: 1,
        color: 'rgb(0,0,0)',
        dashArray: '3',
        fillOpacity: 0.7
    };
}




//------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------
// This executes when we hover over a state
function highlightFeature(e) {
		var layer = e.target;
        findValue(layer);
        var buttons = document.querySelectorAll('.buttons');
        Array.from(buttons).forEach(function(button) {
        button.style.opacity = 0; // Cambiar la opacidad de cada botón
    });
		layer.setStyle({
			weight: 5,
			color: newColor,
			dashArray: '',
			fillOpacity: 1
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}
        //map.setView([45, -100], 4);
		info.update(layer.feature.properties);
	}
//------------------------------------------------------------------------------------

function resetHighlight(e) {
		geojson.resetStyle(e.target);
        var buttons = document.querySelectorAll('.buttons');
        Array.from(buttons).forEach(function(button) {
        button.style.opacity = 100; // Cambiar la opacidad de cada botón
    });
        
		info.update();
	}

//------------------------------------------------------------------------------------
// With the following function we say what to do 
function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
		});
	}	



