imgX = 0;
imgY = 0;
imgW = 0;
imgH = 0;

panFromX = 0;
panFromY = 0;
panToY = 0;
panToX = 0;
xShift = 0;
yShift = 0;

//Change the % of the small photo related to the big one
factor = 0.3;

// Variables to create the rectangle on the minimap
left_up_cornerX =0;
minimapW=0;
minimapH=0;

bldgCode=0;
bldgName="";

//Pop up message
x_pos = 0;
y_pos = 0;
popup=false;

// Save the images of the different buildings:
let images = [];

let input, button, qText;
let bldgFound = '';

go=false;

function preload(){
  img = loadImage('data/Campus100dpi.jpg');
  imgBldgs = loadImage('data/Buildings100dpi.png');
  tblBldgs = loadTable('data/Building_Codes.csv', 'csv', 'header');
}

function setup() {
  createCanvas(img.width,img.height);
  imgW = img.width;
  imgH = img.height;
  imgW_miniMap=imgW;
  imgH_miniMap=imgH;
  
  input = createInput();
  input.position(15, 15);
  qText = '';
  
  //In order to be able to delete the building selection, we will save the original pixels in a variable:
  img.loadPixels();
  imgBldgs.loadPixels();
    for(var a=0; a<tblBldgs.getRowCount(); a++)
    {
      if(tblBldgs.get(a,"Text"))
        {
          gray_val = tblBldgs.get(a,"Pixel_Val");
          for (let i = 0; i < img.width; i++) 
              {
                for (let j = 0; j < img.height; j++) 
                {
                  if(imgBldgs.pixels[4*(j+i*imgBldgs.height)]==gray_val)
                    {
                      img.pixels[4*(j+i*imgBldgs.height)] = 250;   // Red
                      img.pixels[4*(j+i*imgBldgs.height) + 1] = 0; // Green
                      img.pixels[4*(j+i*imgBldgs.height) + 2] = 100; // Blue
                      img.pixels[4*(j+i*imgBldgs.height) + 3] = 255; // Alpha
                    }
                  }
                  img.updatePixels();
                  image(img, 0, 0);
              }
        }
    }
      
  original_pixels=img.pixels;
  
  //We create an array of all the building images
  for(var i=0; i<tblBldgs.getRowCount(); i++) 
  {
    var url = tblBldgs.get(i,"url");
    images[i]=createImg(url);
    images[i].hide();
    //print(i," ",url);
  }
}

function draw() {
  
  background(0);  
  image(img,imgX,imgY,imgW,imgH);

  fill(color(255,255,255));
  
  rect(width-(factor*imgW_miniMap)-3,0,factor*imgW_miniMap+3,((imgW_miniMap*factor))/((imgW_miniMap)/imgH_miniMap)+3);
  
  // We create the small map on the right up corner
  left_up_cornerX = width-(factor*imgW_miniMap);
  minimapW=imgW_miniMap*factor;
  minimapH=((imgW_miniMap*factor))/((imgW_miniMap)/imgH_miniMap);
  
  
  image(img, left_up_cornerX, 0, minimapW,minimapH);
  
  
  //------------------------------------------------------------
  qText = input.value();
  if (qText !== bldgFound && go) 
  {    
    bldgFound = getFeatureByName(qText, tblBldgs);
  }
  fill(200, 125, 100);
  text(bldgFound,200, 35);
  //------------------------------------------------------------
  //Small rectangle on minimap:  
  tag(); 
  //------------------------------------------------------------
  // Draw the building in green
  if(go)
    {
      pixls(bldgFound);
      go=false;
    }
  //------------------------------------------------------------
  //Create the popup message
  popup_funct(find_text(bldgCode,tblBldgs),bldgName,find_index(bldgCode,tblBldgs));
  
}

function mousePressed(){
  panFromX = mouseX;
  panFromY = mouseY;
  
  px = (-imgX + mouseX)/(imgW/width);
  py = (-imgY + mouseY)/(imgH/height);
  popup=false;
  pixls(255);
}

function doubleClicked() {
    bldgCode = red(imgBldgs.get(px,py));
  
  //---------------------------------------------
  //This makes the program a little bit slower but improves the visualization
  pixls(bldgCode);
  //---------------------------------------------
  
  bldgName = getFeatureName(bldgCode, tblBldgs);
  //---------------------------------------------
  if(bldgName=="Non SDSU Structure")
      {
        popup=false;
      }
  //---------------------------------------------
}

function mouseDragged(){
  panToX = mouseX;
  panToY = mouseY;
  
  xShift = panToX - panFromX;
  yShift = panToY - panFromY;
  imgX = imgX + xShift;
  imgY = imgY + yShift;
  
  if(imgX>0 || imgX<-imgW+width)
    {
      if(imgX>0)
        {
          imgX=0;
        }
      else
        {
          imgX=-imgW+width;
        }
    }
  if(imgY>0 || imgY<-imgH+height)
    {
      if(imgY>0)
        {
          imgY=0;
        }
      else
        {
          imgY=-imgH+height;
        }
    }
  
  panFromX = panToX;
  panFromY = panToY;
}

function keyPressed(){
  let change = false;
  
  
  
  
  if(key == '+')
    {
      scaleFactor = -0.05;
      change = true;
    }
  if(key == '-')
    {
      scaleFactor = 0.05;
      change = true;
    }
  if(keyCode === ENTER)
    {
      go=true;
      popup=false;
    }
  if(change)
    {
      
      
      // Calcula la posición relativa del mouse dentro de la imagen
      mx = mouseX - imgX;
      my = mouseY - imgY;

      // Calcula las nuevas dimensiones de la imagen después del zoom
      newWidth = imgW * (1-scaleFactor);
      newHeight = imgH * (1-scaleFactor);

      // Calcula las nuevas coordenadas de la esquina superior izquierda de la imagen
      imgX = mouseX - mx * (newWidth / imgW);
      imgY = mouseY - my * (newHeight / imgH);
      
      if(imgX>0 || imgX<-imgW+width)
      {
      if(imgX>0)
        {
          imgX=0;
        }
      else
        {
          imgX=-imgW+width;
        }
    }
      if(imgY>0 || imgY<-imgH+height)
      {
      if(imgY>0)
        {
          imgY=0;
        }
      else
        {
          imgY=-imgH+height;
        }
    }

      // Actualiza las dimensiones de la imagen
      if(newWidth<width)
        {
          newWidth=width;
          newHeight=height; 
        }
      imgW = newWidth;
      imgH = newHeight;
    }
  
}

function mouseWheel(event) {
  // Calcula el factor de zoom en función del evento de la rueda del mouse
  scaleFactor = 0.001*event.delta; 
  //If scaleFactor is positive it zooms out
  if(imgW/width>=1)
    {
    // Calcula la posición relativa del mouse dentro de la imagen
    mx = mouseX - imgX;
    my = mouseY - imgY;

    // Calcula las nuevas dimensiones de la imagen después del zoom
    newWidth = imgW * (1-scaleFactor);
    newHeight = imgH * (1-scaleFactor);

    // Calcula las nuevas coordenadas de la esquina superior izquierda de la imagen
    imgX = mouseX - mx * (newWidth / imgW);
    imgY = mouseY - my * (newHeight / imgH);

    // Actualiza las dimensiones de la imagen
    imgW = newWidth;
    imgH = newHeight;
      if(imgW/width<1)
        {
          imgW = width;
          imgH = height;
          imgX=0;
          imgY=0;
        }
    }
  else
    {
      imgW = width;
      imgH = height;
      imgX=0;
      imgY=0;
    }
}

function tag(top_left_x,top_left_y){
  if(imgW/width!=1)
    {
    point_x=-imgX*(minimapW/imgW);
    point_y=-imgY*(minimapH/imgH);
    push();
    translate(left_up_cornerX,0);
    let sca = imgW/width;
    // We know the width of the small map isminimapW
    // And the height is minimapH
    // We have to work in this small section determined by the rectangle which vertexs are: (left_up_cornerX,0),(left_up_cornerX,minimapH),(width,0),(width,minimapH).
    //Once we use the translate fucntion, we can simplify this to:
    //(0,0),(0,minimapH),(minimapW,0),(minimapW,minimapH)
    //Every single point has its representation on this minimap, the only thing we need to do is use a conversion factor

    fill(0, 0, 255, 30);
    rect(point_x,point_y,(width/imgW)*minimapW,(height/imgH)*minimapH);
    pop();
    }
}

function getFeatureName(grayVal, tbl) {
  name ="";
  for (var i=1; i<tbl.getRowCount(); i++) {
    var code = tbl.get(i,"Pixel_Val");
    if(grayVal == code) {
      name = tbl.get(i, "Name");
      //---------------------------------
      popup=true;
      //---------------------------------
      return name;
    }
  }
}

function pixls(gray_val){
  
  // With the following lines of code we re-set the original image in order to highlight only the new requested building
  img.loadPixels();
  img.pixels.set(original_pixels);
  img.updatePixels();
  
  imgBldgs.loadPixels();
  img.loadPixels();
  if(gray_val!=255)
    {
      for (let i = 0; i < img.width; i++) 
      {
        for (let j = 0; j < img.height; j++) 
        {
          if(imgBldgs.pixels[4*(j+i*imgBldgs.height)]==gray_val)
            {
              img.pixels[4*(j+i*imgBldgs.height)] = 0;   // Red
              img.pixels[4*(j+i*imgBldgs.height) + 1] = 255; // Green
              img.pixels[4*(j+i*imgBldgs.height) + 2] = 0; // Blue
              img.pixels[4*(j+i*imgBldgs.height) + 3] = 255; // Alpha
            }
          }
          img.updatePixels();
          image(img, 0, 0);
      }
    }
  
}

function getFeatureByName(qText, tbl) {
  for (var i=1; i<tbl.getRowCount(); i++) {
    var name = tbl.get(i,"Name");
    if (name.toLowerCase().startsWith(qText.toLowerCase(),0)) {
      return tbl.get(i,"Pixel_Val");
    }

  }
}

function popup_funct(text_input,bldgName,index){
  if(popup)
    {
      popup_width=width/3;
      
      if(text_input)
        {
          popup_height=height/1.7-5;
          y_pos=height-popup_height-5;
          if(panFromX>width/2)
            {
              x_pos=10;
            }
          else
            {
              x_pos=width-popup_width-10;
            }
          fill(255);
          rect(x_pos, y_pos-25, popup_width, 20);
          fill(0);
          textSize(12); 
          text(bldgName,x_pos+3, y_pos-10)
          fill(255);
          rect(x_pos, y_pos, popup_width, popup_height);
          fill(0);      
          if(images[index].width!=0)
             {
             image(images[index],x_pos+15,y_pos+5,popup_width-30,((images[index].height)/(images[index].width))*popup_width-30);
              textSize(12); 
              let maxTextWidth = popup_width - 2;
              textWrap(WORD);
              text(text_input, x_pos + 3, y_pos + ((images[index].height)/(images[index].width))*popup_width-30+10, maxTextWidth);
              }
          else
            {
              textSize(12); 
              let maxTextWidth = popup_width - 2;
              textWrap(WORD);
              text(text_input, x_pos + 3, y_pos +10, maxTextWidth);
            }
          
        }
      else
        {
          if(panFromX>width/2)
            {
              x_pos=panFromX-popup_width;
            }
          else
            {
              x_pos=panFromX;
            }
          fill(255);
          rect(x_pos, panFromY-25, popup_width, 20);
          fill(0);
          textSize(12); 
          text(bldgName,x_pos+3, panFromY-10)
        }
    }
}

function find_text(grayVal, tbl){
  text_input ="";
  for (var i=1; i<tbl.getRowCount(); i++) {
    var code = tbl.get(i,"Pixel_Val");
    if(grayVal == code) {
      text_input = tbl.get(i,"Text");
      return text_input;
    }
  }
}

// In order to find the index of the building we are displaying 
function find_index(grayVal, tbl){
  
  for (var i=1; i<tbl.getRowCount(); i++) {
    var code = tbl.get(i,"Pixel_Val");
    if(grayVal == code) {
      index = tbl.get(i,"Number")-1;
      return index;
    }
  }
}