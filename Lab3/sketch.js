let basemap;
let canvas;
// In the following variable, we will storage all the geoinformation
let geoinfo = [];
// Structure for geoinfo JSON. Initilized:
let news=[];

//------------------------------------------------------------------
// API Variables to find coordinates of a given city and country
var api_city_location = 'https://api.opencagedata.com/geocode/v1/json?';
var apiKey_city_location = '&key=229432bd0c2f4496884cabf60950782d&language=es&pretty=1';
//------------------------------------------------------------------
// API Variables to get the news 
var api_news = 'https://newsdata.io/api/1/news?apikey=';
var apiKey_news = 'pub_325415f550944d2c9892d7b854f60fc7bbd48';
//------------------------------------------------------------------
let input;
let legend;
let keywords_array=[];

const mappa = new Mappa('Leaflet');
const options = {
  lat: 15,
  lng: 0,
  zoom: 2,
  style: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  attributionControl: false
}


function preload(){
  cities = loadTable('data/paises_ciudades.csv', 'csv', 'header');
}
// p5.js setup
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  basemap = mappa.tileMap(options);
  basemap.overlay(canvas);
  drawInfo(news);
  basemap.onChange(updateLocations);

  
  //create input
  if(width<1100)
    {
      posx = 12;
      posy = 100;
    }
  else
    {
      posx = 70;
      posy=30;
    }
  input = createInput("");
  input.position(posx,posy);
  input.size(100);
  input.style('position: absolute; z-index: 1000; max-width: 200px; border: 3px solid #000;');
  //create button
  button = createButton('Search');
  button.style('position: absolute; z-index: 1000; max-width: 200px; border: 3px solid #000;');
  button.position(input.x + input.width, input.y);
  button.mousePressed(Event);
  
  //Create legend
  legend = createDiv('');
  legend.position(12,125);
  legend.style('position: absolute; z-index: 1000; max-width: 200px; border: 1px solid #900; padding: 10px;');
  legend.style('background-color', '#FFFFFF');
  legend.html('<p>Legend</p>');
      
  //Create WEB TITLE
  webtitle = createDiv('');
  webtitle.position(width / 2 - 300, 0);
  webtitle.style('position: absolute; z-index: 1000; max-width: 1000px; max-height: 100px; border: 0px solid #900; padding: 10px; overflow-y: auto;');
  webtitle.style('background-color', '#00000042');
  webtitle.style('font-family', 'Arial, sans-serif');
  webtitle.style('font-size', '24px'); // Tamaño del texto: 24px
  
  webtitle.html('<p>Fast News 4U: Search about the latest n  ews in real time</p>');
  
}
// p5.js draw
function draw() {}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
//In this section, after cleaning and organizing the data, I will create the needed functions to draw the received information in the map:
function drawInfo(news){  
  for(var i=0; i<Object.keys(news).length; i++)
    {
      push();      noticia=basemap.latLngToPixel(news[i].Country.Lat,news[i].Country.Long);
      translate(noticia.x,noticia.y);
      fill(news[i].Color);
      ellipse(0, 0, 10, 10);
      pop();
    }
}
//------------------------------------------------------------------
// The following function is used to display de news in case the mouse is in a specific location where a news is located:
function mousePressed() {
  // To erase the previous selected news:
  updateLocations();
  for (var i = 0; i < Object.keys(news).length; i++) {
    noticia = basemap.latLngToPixel(news[i].Country.Lat, news[i].Country.Long);
    let d = dist(mouseX, mouseY, noticia.x, noticia.y);
    if (d < 4) {
      // TITLE
      let txt_title = news[i].Title;
      //textStyle(BOLD);
      let formatted_title = txt_title.toUpperCase();
      // DESCRIPTION
      let txt_description = news[i].Description;
      let total_text = formatted_title+ '\n' +txt_description;
      
      let textWidthValue =textWidth(total_text);
      let textHeight = (textWidthValue/(0.28*width))*15;

      // WHITE RECTANGLE
      fill(255);
      let rectHeight = textHeight + 25;
      let rectWidth = 0.3 * width;
      rect(noticia.x, noticia.y, rectWidth, rectHeight);
      fill(0);
      textStyle(BOLD);
      text(formatted_title, noticia.x + 5, noticia.y+5, 0.28*width);
      let title_height = textWidth(formatted_title)/(0.28*width)*15;
      textStyle(NORMAL);
      textSize(10);
      text(txt_description, noticia.x + 5, noticia.y+15 +title_height, 0.28*width); 
    }
  }
}
function doubleClicked() {
  for (var i = 0; i < Object.keys(news).length; i++) {
    noticia = basemap.latLngToPixel(news[i].Country.Lat, news[i].Country.Long);
    let d = dist(mouseX, mouseY, noticia.x, noticia.y);
    if (d < 4) {
      window.open(news[i].Url, '_blank');
    }
  }
}
//------------------------------------------------------------------
// Function to update the map in case any drag or pan
function updateLocations() {
  clear();
  background(255, 255, 255, 100);
  drawInfo(news);
}
//------------------------------------------------------------------
//------------------------------------------------------------------
//------------------------------------------------------------------
// Function to get the news bassed on a keyword
function get_news(keywords){
  var url = api_news + apiKey_news + "&q=" + encodeURIComponent(keywords)+"&language=en";
  news_info = loadJSON(url,function(data){printdata_news(data,keywords)});
  print(url);
}
// Show info received in JSON format about the news
function printdata_news(data,keywords){
  rand_color = random_color()
  keywords_array.push(rand_color);
  for(var i=0; i<10; i++)
    {
      Keyword = keywords;
      title = data.results[i].title;      
      description = data.results[i].description; 
      link = data.results[i].link; 
      content = data.results[i].content;
      country = JSON.stringify(data.results[i].country).substring(2, JSON.stringify(data.results[i].country).length - 2);
      //-----------------------------------------------------------
      // I have a problem as the returned countries are written in lowercase, so we have to make a small change to put the first character of each word in capital letters:
      let words = split(country, ' ');
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
      }
      country = words.join(' ');
      //-----------------------------------------------------------
      city_country = one_city(country)
      print(city_country)
      city = split(city_country,',')[0];
      // We call another API to get the coordinates:
      CityCoordinates(city_country,title,description,content,country,city,Keyword,rand_color,link);
    }
}
//------------------------------------------------------------------
// Function to get 1 random city of a given country
function one_city(country){
  i=0;
  cities_list=[];
  for(var a=0; a<cities.getRowCount(); a++)
    {
      if(cities.get(a,"Pais")==country)
        {
          cities_list[i]=cities.get(a,"Ciudad");
          i++;
        }
    }
  return cities_list[int(random(20))]+","+country;
}
//------------------------------------------------------------------
// Function created to get the coordinates of the cities of a country
function CityCoordinates(city_country,title,description,content,country,city,Keyword,rand_color,link){
  // We use the function encodeURIComponent() in order to avoid spaces, as the url does not know how to interpretate this symbols
  var url = api_city_location + "q=" + encodeURIComponent(city) + apiKey_city_location
  city_info = loadJSON(url,function(data){printdata(data,title, description, country, content, city,Keyword,rand_color,link)});
}
// Show info received in JSON format about the city
function printdata(data,title, description, country, content, city,Keyword,rand_color,link){
  lat=data.results[0].geometry.lat;
  long=data.results[0].geometry.lng;
  add_news(title, description, country, content, city, lat, long,Keyword,rand_color,link);
}
//------------------------------------------------------------------
// Function to add the geoinformation to the 'geoinfo' variable
function add_news(news_name, description, country, content, city, lat_coor, long_coor,Keyword,rand_color,link){
  let City=one_city(country);
  let new_news=
      {
        Keyword: Keyword,
        Title: news_name,
        Description: description,
        Content: content,
        Country: 
        {
          Name: country,
          City: city,
          Lat: lat_coor,
          Long:long_coor
        },
        Color : rand_color,
        Url : link
      }
  news.push(new_news);
  updateLegend();
  print(news);
}
//------------------------------------------------------------------
//Now I define the function that executes when the buttom is pressed:
function Event(){
  var new_keywords = input.value();
  keywords_array.push(new_keywords);
  print(keywords_array);
  get_news(new_keywords);
  
   //Create Instructions
  comment = createDiv('');
  comment.position(width / 2 - 300, height-80);
  comment.style('position: absolute; z-index: 1000; max-width: 500px; border: 0px solid #900; padding: 10px;');
  comment.style('background-color', '#00000042');
  comment.style('border-radius', '45px');
  comment.html('<p style="font-size: 24px; color: white;">Double click to go to the news web page</p>');
  
}
//------------------------------------------------------------------
// Function to generate a random color
function random_color() {
  let r = random(0, 255);
  let g = random(0, 255);
  let b = random(0, 255);
  return color(r, g, b);
}
//------------------------------------------------------------------
// Function to generate a the dynamc legend
function updateLegend()
{
  legend.html('');
  let legendContent='';
  legendContent = '<p>Legend:<br>';
  for (let i = 0; i < keywords_array.length; i=i+2) {
    legendContent += `<div class="circle" style="background-color: ${keywords_array[i+1]};"></div> ${keywords_array[i].toUpperCase()}<br>`;
  }
  legendContent += '</p>';
  legend.html(legendContent);
}