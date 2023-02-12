// module aliases
var Engine = Matter.Engine,
World = Matter.World,
Bodies = Matter.Bodies,
Body = Matter.Body,
Mouse = Matter.Mouse
Constraint = Matter.Constraint;
Collision = Matter.Collision;
Composite = Matter.Composite;

var bg, rocket, planet1, blackhole, earthImg, earthImg2
var myEngine, myWorld;
var cam
var objOfCenter

var mConstraint
var initialground
var slingshot

// plinko board variables
var plinkoBoundary1, plinkoBoundary2, plinkoCircles = []
var ball1
var ground1
var constraintTop, constraintSide

// dominoes variables
var dominoesArray = [];
var collisionDominoe

// asteroid explosion variables
var explosionBoundary1, explosionBoundary2, explosionBoundary3, explosionBoundary4
var explosionAsteroid
var explosionParticles = []

// pulley vars
var boxes=[];
var clickBoxes=[];
var circle;
var divisorMid;
var divisorL;
var divisorR;
var stopPulley;
var pulleyBoundary
//ball after pulley
var pulleyBall;
var tinyBalls = [];
//Drawing info
var drawCoords = new Array;
var drawnBoxes = [];

var obstacles = [];

var buttonBox, bouncyBall, ballBarrier, ballAfterDrawing;

var hitMiddle = false;
var simPaused = false;
var ballLaunched = false
var drawPhase = false;
var pastDrawing = false;
var shouldShowBouncyBall = true;
var shouldShowBallAfterDrawing = true;
var keepApplyingForce = false;
var stopSettingVelocity = false;
var externalForcePlaced = false;

var bouncyPlatforms = [];

//after orbit section
var zeroGravL;
var zeroGravR;
var bringBallToZG;

var tunnelLeft, tunnelRight;
var tunnelRamps = [];

var pendulumBalls = [];
var pendulumConstraints = [];
var pendulumConstraintsPositions = [];

var newtonsCradleBalls = [];
var newtonsCradleConstraints = [];
var newtonsCradleConstraintsPositions = [];

var seeSaw = undefined;
//var seeSawBall;

var final = false

function setup() {
  bg = loadImage('assets/background.jpeg');
  rocket = loadImage('assets/rocket.png');
  planet1 = loadImage('assets/planet.png');
  blackhole = loadImage('assets/blackhole.png');
  earthImg = loadImage('assets/earth.png');
  earthImg2 = loadImage('assets/destroyed.png');

  const canvas = createCanvas(windowWidth*3, windowHeight*5, WEBGL);
  myEngine = Engine.create();
  myWorld = myEngine.world
  Engine.run(myEngine);

  cam = createCamera()

  // initial starting object creations
  const mouseMatter = Mouse.create(canvas.elt);
  mouseMatter.pixelRatio = pixelDensity()
  var options ={
    mouse: mouseMatter,
  }
  mConstraint = Matter.MouseConstraint.create(myEngine, options);
  World.add(myWorld, mConstraint);

  var hammer = new Hammer(document.body, options);
  hammer.get('swipe').set({
    direction: Hammer.DIRECTION_ALL
  });
  hammer.on("swipe", swiped);

  initialground = Bodies.rectangle(175, 150, 150, 5)
  var options = {
    mass: .2,
    restitution: .8,
  }
  initBall = Bodies.circle(140, 680, 25/2, options)
  ball1 = Bodies.circle(175 , 135, 25/2, options)
  objOfCenter = initBall
  pulleyBall = Bodies.circle(1130, 680, 25/2, options);
  World.add(myWorld, [pulleyBall, initialground, Matter.Constraint.create({ 
    bodyA: initialground, 
    pointB: {x:175, y:150},
    stiffness: 1,
    length: 0
  })]);
  // slingshot = new SlingShot(75, 250, ball1)

  constraintTop = new Ground(203, 50, 500, 25, 0, "rgb(250, 250, 250)")
  constraintSide = new Ground(450, 130, 160, 5, Math.PI/2, "rgb(250, 250, 250)")

  // create plinko board
  plinkoBoundary1 = new Ground(200, 310, 225, 5, 1.1, "rgb(250, 250, 250)")
  plinkoBoundary2 = new Ground(400, 310, 225, 5, -1.1, "rgb(250, 250, 250)")
  var xVal = 200;
  for(var i = 0; i< 6; i++){
    plinkoCircles.push(new CircleParticle(xVal, 210, 5, 5, 1, true, "rgb(250, 250, 250)"));
    xVal+=40;
  }
  xVal = 220;
  for(var i = 0; i< 5; i++){
    plinkoCircles.push(new CircleParticle(xVal, 250, 5, 5, 1, true, "rgb(250, 250, 250)"));
    xVal+=40;
  }
  xVal = 240;
  for(var i = 0; i< 4; i++){
    plinkoCircles.push(new CircleParticle(xVal, 290, 5, 5, 1, true, "rgb(250, 250, 250)"));
    xVal+=40;
  }
  xVal = 260;
  for(var i = 0; i< 3; i++){
    plinkoCircles.push(new CircleParticle(xVal, 330, 5, 5, 1, true, "rgb(250, 250, 250)"));
    xVal+=40;
  }
  xVal = 280;
  for(var i = 0; i< 2; i++){
    plinkoCircles.push(new CircleParticle(xVal, 370, 5, 5, 1, true, "rgb(250, 250, 250)"));
    xVal+=40;
  }
  ground1 = new Ground(335, 435, 180, 5, .3, "rgb(250, 250, 250)")

  // create dominoes
  var options = {
    mass: .1,
    restitution: .8,
  }
  for (let index = 0; index < 9; index++) {
    var domRectangle = Bodies.rectangle(435 + index*20, 455, 5, 75);
    dominoesArray.push(domRectangle);
    World.add(myWorld, domRectangle)
  }

  // create explosion part
  explosionBoundary1 = new Ground(813, 460, 200, 5, -.5, "rgb(250, 250, 250)")
  explosionBoundary2 = new Ground(630, 603, 200, 5, 1.3, "rgb(250, 250, 250)")
  explosionBoundary3 = new Ground(700, 604, 200, 5, -1.3, "rgb(250, 250, 250)")
  explosionBoundary4 = new Ground(530, 505, 210, 5, 0, "rgb(250, 250, 250)")

  explosionAsteroid = Bodies.circle(675, 480, 50)

  World.add(myWorld, [explosionAsteroid, explosionParticles, dominoesArray])

  Engine.run(myEngine);
  myEngine.gravity.y = .6

  // pulley stuff
  pulleyBoundary = new Ground(635, 713, 50, 15, -.7, "rgb(250, 250, 250)")
  beforePulleyRamp = new Ground(735, 750, 225, 15, .2, "rgb(250, 250, 250)")
  //blockToLaunchBall = new Ground(1300, 700, 100, 50, 0, "rgb(250, 250, 250)")
  stopPulley = new Ground(1150, 710, 100, 50, 0, "rgb(250, 250, 250)")

  var options={
    isStatic: true
}

divisorMid=Bodies.rectangle(950, 1700, 30, 1400, options);
divisorL=Bodies.rectangle(700, 1700, 30, 350, options);
divisorR=Bodies.rectangle(1150, 1700, 30, 550, options);

//zeroG
zeroGravL=new Ground(2600, 2175, 30, 900, 0, "rgb(250, 250, 250)");

zeroGravR=new Ground(2800, 2300, 30, 900, 0, "rgb(250, 250, 250)");

bringBallToZG=new Ground(2425, 2680, 800, 20, .2, "rgb(250, 250, 250)");

//constraints
var prev=null;
//var checkInt=0;
    for(var x=530;x<1100;x+=20){
      
        var fixed=false;

        if(!prev){
          var newBox= new Box(x,740,150,50,false,.001);
     }
     else if(x+20>=1100){
         var newBox= new Box(x,740,150,50,false,.001108);
     }
     else{
         var newBox= new Box(x,740,20,20,fixed,.001);
     }

       boxes.push(newBox);

    if(prev){
     var constOptions={
        bodyA: newBox.body,
        bodyB: prev.body,
        length: 30,
        stiffness: 1
         }
     var constraint= Constraint.create(constOptions)
    
    //adding to world
    World.add(myWorld, constraint);
    }   
    prev=newBox;
    //checkInt++;
    // Body.setMass(boxes[boxes.length-1].body,10000);
    }
    Body.setMass(boxes[0].body, 8);
    setTimeout(() => {
      Body.setStatic(boxes[4].body,true);
    }, 1900);
//circle for pulley
    var circOptions={
        isStatic: true,
        friction: 1
    }
    circle=Bodies.circle(950,800,90,circOptions)
    circle.friction=100;
    World.add(myWorld, [circle,divisorMid,divisorL,divisorR]);

    // createPendulum(2400, 500, 3, 400);
    //stopPulley = new Ground(1100, 750, 100, 50, 0, "rgb(250, 250, 250)")
}

var drawingOver = false;
var collided = false
var launched = false
var slingged = false
var secondHalf = false;

var beforePulleyRamp
//var blockToLaunchBall
var checkNum;

var worked1 = false;
var worked2 = false;

var finalGround
var finalBall

function draw() {
  checkNum++
  background(5);
  Engine.update(myEngine)

  var gravCenterX = 1300;
  var gravCenterY = 200;
  var gravRadius = 400;
  var gravObj = Bodies.circle(1300, 200, 50)

  showPendulum();
  if(finalGround!=undefined){
    finalGround.show()
    if(!final)
      drawBall(finalBall, 50)
    }
  showNewtonsCradle();

  rectMode(CENTER);
  fill('red');
  image(blackhole, gravCenterX-gravRadius/2, gravCenterY-gravRadius/2, gravRadius);
  fill("white");
  if (simPaused) {
    textSize(15);
    strokeWeight(1);
    fill(250);
    if (!drawPhase) text("Swipe in the direction of the button!", 1500, 100);
    else text("Draw objects for your ball to bouce off of to avoid obstacles. Press up arrow When you're Done", 1800, 900);
  }
  if(!secondHalf){
    cam.setPosition(objOfCenter.position.x+950, objOfCenter.position.y+1050, 2200)
  }else if(!drawingOver){
    cam.setPosition(objOfCenter.position.x+1700, objOfCenter.position.y+2150, 3800)
  }else{
    cam.setPosition(objOfCenter.position.x+1700, objOfCenter.position.y+1850, 3800)
  }

  //pulley ball
  if((!(!simPaused && hitMiddle)) && !drawPhase) {
    noStroke()
    fill(150)
    ellipse(pulleyBall.position.x,pulleyBall.position.y,25,25)
  }

  //ground
  stroke(255);
  fill(170);
  strokeWeight(4);
  rectMode(CENTER);

  zeroGravL.show();
  zeroGravR.show();
  bringBallToZG.show();

  // switch camera from ball1 to dominoes
  if(Matter.Collision.collides(initBall, initialground)!=null && !collided && !slingged){
    World.add(myWorld, ball1)
    slingged = true
    objOfCenter = ball1
  }

  if(Matter.Collision.collides(ball1, dominoesArray[0])!=null && !collided){
    objOfCenter = dominoesArray[0]
  }

  if(explosionParticles.length>0){
    for(var j = 0; j<explosionParticles.length; j++){
      if(Matter.Collision.collides(explosionParticles[j], circle)!=null && !collided){
        objOfCenter = circle
      }
    }
  }

  // if(ballAfterDrawing!=undefined && Matter.Collision.collides(ballAfterDrawing, pendulumBalls[0])!=null && !collided){
  //   objOfCenter = pendulumBalls[0]
  // }

  // EXPLOSION of asteroid
  if(Matter.Collision.collides(dominoesArray[8], explosionAsteroid)!=null && !collided){
    collided = true;
    // create particles that are a result of the collision
    var options = {
      friction: .5,
      mass: 2,
      restitution: .8
    }
    for(var i = 0; i< 100; i++){
      explosionParticles.push(Bodies.circle(explosionAsteroid.position.x, explosionAsteroid.position.y, 5, options))
    }
    Body.setStatic(boxes[4].body,false);


    // add particles to the world
    World.add(myWorld, explosionParticles)

    // find the vector of the force (where the force is being applied)
    targetAngle = Matter.Vector.angle(dominoesArray[8].position, explosionAsteroid.position);
    var deltaVector = Matter.Vector.sub(dominoesArray[8].position, explosionAsteroid.position);
    var normalizedDelta = Matter.Vector.normalise(deltaVector);
    var forceVector = Matter.Vector.mult(normalizedDelta, -.0001);

    // apply that force onto all of the particles created by the explosion
    for(var i = 0; i< explosionParticles.length; i++){
      Matter.Body.applyForce(explosionParticles[i], explosionAsteroid.position, forceVector)
    }

    World.remove(myWorld, dominoesArray)
  }

  if(!collided){
    push()
    translate(explosionAsteroid.position.x-50, explosionAsteroid.position.y-50);
    rectMode(CENTER);
    rotate(explosionAsteroid.angle);
    fill(0, 250, 200);
    noStroke();
    image(planet1, 0, 0, 100, 100);
    pop()
  }else{
    World.remove(myWorld, [explosionAsteroid, plinkoCircles])
  }

  if(!ballLaunched && collided){
    maxIndex = 0;
    for(var i = 0; i<explosionParticles.length; i++){
      if(explosionParticles[i].position.y>explosionParticles[maxIndex].position.y){
        objOfCenter = explosionParticles[i]
        maxIndex = i
      }
    }
    for(var i = 0; i<explosionParticles.length; i++){
      if(explosionParticles[i].position.x>700){
        objOfCenter = circle;
    }
    }
  }

  // display particles created by collision
  if(!hitMiddle){
    rect(950, 1700, 30, 1400);
    rect(700, 1700, 30, 550);
    rect(1150, 1700, 30, 550);
    rect(1150, 735, 100, 100);
    constraintTop.show()
    constraintSide.show()
    // slingshot.show();

    // PLINKO
    plinkoBoundary1.show()
    plinkoBoundary2.show()

    for(var i = 0; i<plinkoCircles.length; i++){
      plinkoCircles[i].show();
    }
    ground1.show()

  push()
  translate(initialground.position.x, initialground.position.y);
  rectMode(CENTER);
  rotate(initialground.angle);
  fill(250, 250, 250);
  noStroke();
  rect(0, 0, 150, 5);
  pop()

    // rect(130, 815, 100, 3);

    push()
    translate(initBall.position.x-50, initBall.position.y-15);
    rectMode(CENTER);
    fill(0, 250, 200);
    noStroke();
    image(rocket, 0, 0, 80, 150);
    pop()

    if(initBall.position.y<100){
      slingged = true
      World.remove(myWorld, initBall)
    }

    if(launched){
      Body.setVelocity(initBall, {x:0, y:-3.2})
    }

    drawBall(ball1, 25);

    textSize(15)
    strokeWeight(1)
    fill(250)
    textWrap(CHAR);

    if(!launched){
      textAlign(CENTER);
      text("Press the L key to launch your rocket to open a rift in space", 130, 840, 225)
    }

    for(var i = 0; i< explosionParticles.length; i++){
      drawBall(explosionParticles[i],10);
    }

      explosionBoundary1.show()
      explosionBoundary2.show()
      explosionBoundary3.show()
      explosionBoundary4.show()

      // dominoes
    for(var i =0; i< dominoesArray.length; i++){
      push()
      translate(dominoesArray[i].position.x, dominoesArray[i].position.y);
      rectMode(CENTER);
      rotate(dominoesArray[i].angle);
      fill(200, 200, 200);
      noStroke();
      rect(0, 0, 5, 75);
      pop()
    }

    //Pulley
    fill(255)
    pulleyBoundary.show()
    beforePulleyRamp.show()
    //blockToLaunchBall.show()
    //boxes
    for(var i=0; i<boxes.length;i++){
      boxes[i].show();
    }
    for(var i=0; i<clickBoxes.length;i++){
      clickBoxes[i].show();
    }
    //circle
    ellipse(circle.position.x,circle.position.y,180,180)
  }

  if (pulleyBall != undefined && stopPulley != undefined &&  Collision.collides(boxes[boxes.length-1].body, stopPulley.body) && !ballLaunched) {
    Body.setStatic(boxes[boxes.length-1].body);
    Body.applyForce(pulleyBall, pulleyBall.position, {x: 0, y: -.013});
    objOfCenter = pulleyBall
    ballLaunched = true;
  }

  var velocity = pulleyBall.velocity;
  var pulleyBallPos = pulleyBall.position;
  var dist = Math.sqrt(Math.pow((pulleyBallPos.x-gravCenterX), 2) + Math.pow((pulleyBallPos.y-gravCenterY), 2) );
  if (dist < gravRadius/2 && !hitMiddle) {
    World.remove(myWorld, explosionParticles)
    myEngine.gravity.y = 0;
    //apply force in direction of center
    if (dist > 20) {
      Body.applyForce(pulleyBall, pulleyBallPos, {x: (gravCenterX-pulleyBallPos.x)/800000, y: (gravCenterY-pulleyBallPos.y)/800000});
      objOfCenter = gravObj;
    } else {
      hitMiddle = true;
      simPaused = true;
      Body.setStatic(pulleyBall, true);
      buttonBox = new Box(1700, 300, 80, 80, {isStatic: true});
      var options = {
        restitution: .8
      }
      bouncyBall = Bodies.circle(1900, 100, 25, options);
      World.add(myWorld, bouncyBall)
      ballBarrier = new Box(1900, 150, 100, 10, {isStatic: true});
    }
    Body.applyForce(pulleyBall, pulleyBallPos, {x: velocity.x/200000, y: velocity.y/200000});
  } else {
    myEngine.gravity.y = 1;
  } 

  for (var i=0; i<tinyBalls.length; i++) {
    tinyBalls[i].show();
    if (buttonBox != undefined && Collision.collides(buttonBox.body,tinyBalls[i].body)) {
      Composite.remove(myWorld, buttonBox.body);
      buttonBox.shouldShow = false;
      worked1 = true;

      Composite.remove(myWorld, ballBarrier.body);
      ballBarrier.shouldShow = false;
      removeTinyBalls();

      let bouncyPlat1 = new Ground(1900,600,100,10,5.9,"rgb(250, 250, 250)");
      let bouncyPlat2 = new Ground(1460,800,100,10,.5,"rgb(250, 250, 250)")
      bouncyPlatforms.push(bouncyPlat1);
      bouncyPlatforms.push(bouncyPlat2);
    }
  }

  if (buttonBox != undefined) buttonBox.show();
  if (bouncyBall != undefined && !drawingOver && shouldShowBouncyBall){
    drawBall(bouncyBall, 50);
  }
  if (ballBarrier != undefined) ballBarrier.show();
  if (ballAfterDrawing != undefined && shouldShowBallAfterDrawing){
    drawBall(ballAfterDrawing, 50);

    // if (ballAfterDrawing.position.x > zeroGravL.body.position.x+40 || keepApplyingForce) {
    //   if (!stopSettingVelocity) {
    //     Body.setVelocity(ballAfterDrawing, {x: 0, y:0});
    //     stopSettingVelocity = true;
    //   }
    //   Body.applyForce(ballAfterDrawing, ballAfterDrawing.position, {x: 0, y: -.0008});
    //   keepApplyingForce = true;
    // }

    if(drawingOver && Matter.Collision.collides(pendulumBalls[0], pendulumBalls[1])!=null){
      console.log("yay")
      World.remove(myWorld, ballAfterDrawing)
      gravity = .6
      World.add(myWorld, [finalBall, finalGround])
    }

    if(finalBall!=undefined && Matter.Collision.collides(newtonsCradleBalls[newtonsCradleBalls.length-1], pendulumBalls[0])!=null){
      objOfCenter = pendulumBalls[0]
      // Body.setVelocity(finalBall, {x: -20, y:0})
    }

    if(drawingOver){
      for(var i = 0; i<pendulumBalls.length; i++){
        if(Matter.Collision.collides(objOfCenter, pendulumBalls[i])!=null){
          objOfCenter=pendulumBalls[i]
        }
      }
    }

    if(finalBall!=undefined && Matter.Collision.collides(finalBall, pendulumBalls[pendulumBalls.length-1])!=null){
      console.log("final")
      objOfCenter = finalBall
      // Body.setVelocity(finalBall, {x: -20, y:0})
    }
    if(finalBall!=undefined && Matter.Collision.collides(finalBall, earth)!=null){
      console.log("MISSION SUCCESS")
      final = true
      checkFinal()
    }

    if(earth!=undefined){
      if(!final){
        push()
        translate(earth.position.x, earth.position.y);
        rotate(earth.angle);
        imageMode(CENTER)
        image(earthImg, 0, 0, 2000, 2000);
        pop()
      }else{
        push()
        translate(earth.position.x, earth.position.y);
        rotate(earth.angle);
        imageMode(CENTER)
        image(earthImg2, 0, 0, 2000, 2000);
        pop()
      }
    }
    

//Collision.collides(ballAfterDrawing, zeroGravR.body)
    if(ballAfterDrawing.position.x > zeroGravL.body.position.x&& !resetGrav){
      newtonsCradleBalls[newtonsCradleBalls.length-1].isStatic=true;
      myEngine.gravity.y= -1;

    }
  
    if(ballAfterDrawing.position.x > zeroGravL.body.position.x+40&&ballAfterDrawing.position.y < 1800){
     // seeSaw.isStatic=false;
      newtonsCradleBalls[newtonsCradleBalls.length-1].isStatic=false;
      resetGrav=true;
      myEngine.gravity.y=.1;
    }

  };

  if (tunnelLeft != undefined) tunnelLeft.show();
  if (tunnelRight != undefined) tunnelRight.show();
  if (seeSaw != undefined) {
    push()
    translate(seeSaw.position.x, seeSaw.position.y);
    rectMode(CENTER);
    rotate(seeSaw.angle);
    fill(250, 250, 250);
    noStroke();
    rect(0, 0, 300, 20);
    pop();


    if (seeSaw != undefined && ballAfterDrawing != undefined) print(sqrt(pow((seeSaw.position.x-ballAfterDrawing.position.x),2) + pow(seeSaw.position.y-ballAfterDrawing.position.y),2))
    if (seeSaw != undefined && ballAfterDrawing != undefined && ballAfterDrawing.position.x > 2400 && ballAfterDrawing.position.y < 2000) {
      Body.setStatic(seeSaw,false);
      objOfCenter = newtonsCradleBalls[0]
      //Body.setDensity(seeSaw,.1);

      // if (!externalForcePlaced) {
      //   Body.applyForce(seeSawBall, seeSawBall.position, {x: 0.0014, y:0});
      //   externalForcePlaced = true;
      // }
      // Body.applyForce(seeSawBall,seeSawBall.position, {x: (pendulumBalls[0].position.x-seeSawBall.position.x)/10000000, x: (pendulumBalls[0].position.x-seeSawBall.position.x)/10000000})
    }
  }



  // if (seeSawBall != undefined) drawBall(seeSawBall, 60);

  for (var i=0; i<bouncyPlatforms.length; i++) {
    bouncyPlatforms[i].show();
  }

  for (var i=0; i<drawnBoxes.length; i++) {
    drawnBoxes[i].show();

    let angle = drawnBoxes[i].a;
    let slope = tan(angle);
    let newSlope = -(1/slope);
    // if (ballAfterDrawing != undefined && Collision.collides(drawnBoxes[i].body, ballAfterDrawing.body)) {
    //   Body.applyForce(ballAfterDrawing.body, .5, .5*newSlope);
    // }
  }

  if (bouncyBall != undefined && bouncyBall.position.y > 1000 && !pastDrawing) startDrawingPause();
  if(ballAfterDrawing!=undefined && drawingOver){
    if(ballAfterDrawing.position.x>2050 && ballAfterDrawing.position.x < 2350 && ballAfterDrawing.position.y>1600 && ballAfterDrawing.position.y<2600){
      worked2 = true
    }
  }
  for (var i=0; i<obstacles.length; i++) {
    obstacles[i].show();
    if (ballAfterDrawing != undefined && Collision.collides(obstacles[i].body, ballAfterDrawing)) {
      // ballAfterDrawing.friction = 0;
      // ballAfterDrawing.airFriction = 0;
      window.location.href = "/missionFail.html";
      Composite.remove(myWorld, ballAfterDrawing);
      // ballAfterDrawing.shouldShow = false;
      shouldShowBallAfterDrawing = false;
    }
  }

  for (var i=0; i<tunnelRamps.length; i++) {
    tunnelRamps[i].show();
  }
}

var resetGrav=false;

function swiped(event) {
  if (hitMiddle && simPaused && !drawPhase) {
    simPaused = false;
    let lastX = pulleyBall.position.x;
    let lastY = pulleyBall.position.y;
    Composite.remove(myWorld, pulleyBall);
    var forceOnBalls = {x: event.velocityX, y: event.velocityY};
    objOfCenter = bouncyBall;
    secondHalf = true;
    for (var i=0; i<10; i++) {
      tinyBalls.push(new CircleParticle(lastX, lastY, 15, 15, 1, false, "rgb(250, 250, 250)"));
      Body.setMass(tinyBalls[i].body, 15);
      Body.applyForce(tinyBalls[i].body, tinyBalls[i].body.position, forceOnBalls);
    }
    setTimeout(()=>{
      if(!worked1){
        window.location.href = "/missionFail.html";
      }
    }, 1000)
  }
}

function removeTinyBalls() {
  for (var i=0; i<tinyBalls.length; i++) {
    Composite.remove(myWorld, tinyBalls[i].body);
  }
  tinyBalls = [];
}

function mouseReleased(){
  if (drawPhase) {
    print("hi");
    for (var i=0; i<drawCoords.length-1; i++) {
      let changeX = drawCoords[i+1][0] - drawCoords[i][0];
      let changeY = drawCoords[i+1][1] -drawCoords[i][1];
      let angle = atan(changeY/changeX);
      let dist = sqrt(pow(changeX,2) + pow(changeY,2));
      drawnBoxes.push(new Ground(drawCoords[i][0], drawCoords[i][1], dist*1.1, 10, angle, "rgb(255,255,255)"));
      Body.setStatic(drawnBoxes[drawnBoxes.length-1].body, true);
    }
  }
  // Body.applyForce(pendulumBalls[0], pendulumBalls[0].position, {x: 0.0000001, y: 0});
}

function mouseDragged() {
  drawCoords.push(new Array(mouseX+900, mouseY+950));
  // drawCoords.push(new Array(mouseX, mouseY));
}

function mousePressed() {
  drawCoords = []; 
  // for (var i=0; i<pendulumBalls.length; i++) Body.setStatic(pendulumBalls[i],false);
}

function startDrawingPause() {
  simPaused = true;
  drawPhase = true;
  pastDrawing = true;
  Body.setStatic(bouncyBall, true);

  obstacles.push(new Ground(2000, 1200, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1950, 1250, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1900, 1250, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1850, 1250, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1800, 1250, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1750, 1250, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1700, 1250, 50, 50, 0, "rgb(255,0,0)"));

  obstacles.push(new Ground(1600, 1500, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1650, 1500, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1700, 1500, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1750, 1500, 50, 50, 0, "rgb(255,0,0)"));
  obstacles.push(new Ground(1800, 1500, 50, 50, 0, "rgb(255,0,0)"));

  tunnelLeft = new Ground(2050,2100,30,1000,0,"rgb(255,255,255)");
  tunnelRight = new Ground(2350,2075,30,950,0,"rgb(255,255,255)");

  tunnelRamps.push(new Ground(2130, 1800, 10, 200, 2.4, "rgb(255,255,255)"));
  tunnelRamps.push(new Ground(2270, 2000, 10, 200, .7, "rgb(255,255,255)"));
  tunnelRamps.push(new Ground(2130, 2300, 10, 200, 2.4, "rgb(255,255,255)"));

  seeSaw = Bodies.rectangle(2800,1700,300,10);
  World.add(myWorld, [seeSaw, Matter.Constraint.create({ 
    bodyA: seeSaw, 
    pointB: {x:2800, y:1700},
    stiffness: 1,
    length: 0
    //density: .3
  })]);
 // World.add(myWorld, seeSaw);
  Body.setStatic(seeSaw,true);

  // seeSawBall = Bodies.circle(2700,1650,30);
  // World.add(myWorld, seeSawBall);
  // Body.setMass(seeSawBall, 0.1)

  createPendulum(3360, 1700, 5, 500);
  createNewtonsCradle(3310, 1700, 7, 250, 50);

  // createNewtonsCradle(3210, 4280, 7, 50);
  var options ={
    isStatic: true
  }
  earth = Bodies.circle(2500, 5000, 1000, options)
  World.add(myWorld, earth)
}

var earth

function exitDrawingPause() {
  simPaused = false;
  drawPhase = false;
  let lastX = bouncyBall.position.x;
  let lastY = bouncyBall.position.y;
  shouldShowBouncyBall = false;
  World.remove(myWorld, bouncyBall);

  drawingOver = true;
  var options = {
    restitution: .8,
    mass: .1,
    friction: 0
  }
  ballAfterDrawing = Bodies.circle(lastX, lastY, 25, options);
  World.add(myWorld, ballAfterDrawing)
  objOfCenter = ballAfterDrawing

  setTimeout(()=>{
    if(!worked2){
      window.location.href = "/missionFail.html";
    }
  }, 5000)
}

function keyPressed(){
  if (key == "l"){
    launched = true;
    World.add(myWorld, initBall)
  }
  if (keyCode ===  UP_ARROW && drawPhase) {
    exitDrawingPause();
  }
}

function drawBall(aBall, size) {
  push()
  translate(aBall.position.x, aBall.position.y);
  rectMode(CENTER);
  rotate(aBall.angle);
  fill(200, 200, 200);
  noStroke();
  ellipse(0, 0, size);
  pop();
}

function createPendulum(initX, initY, numBalls, stepLen) {
  finalGround = new Ground(initX, initY+(stepLen*numBalls)+30, 100, 15, 0, "rgb(250, 250, 250)")
  var options={
    restitution:0.5,
    mass:0.025
  }
  finalBall = Bodies.circle(initX, initY+(stepLen*numBalls), 25, options)
  for (var i=0; i<numBalls; i++) {
    var options={
      mass: .4
    }
    newCircle = Bodies.circle(initX, initY + (stepLen*i), 25, options);
    pendulumBalls.push(newCircle)
    World.add(myWorld, newCircle);
  }
  for (var i=0; i<numBalls; i++) {
    let options = {
      pointA: {
        x: initX,
        y: pendulumBalls[i].position.y + (stepLen/2)
      },
      bodyB: pendulumBalls[i],
      stiffness: .5,
      length: stepLen/2
    }
    pendulumConstraintsPositions.push({
      x: initX,
      y: pendulumBalls[i].position.y + (stepLen/2)
    });
    let myConstraint = Constraint.create(options);
    World.add(myWorld, myConstraint);
  }
}

function showPendulum() {
  for (var i=0; i<pendulumBalls.length; i++) {
    drawBall(pendulumBalls[i], 50);
    line(pendulumBalls[i].position.x, pendulumBalls[i].position.y, pendulumConstraintsPositions[i].x, pendulumConstraintsPositions[i].y);
  }
}

function createNewtonsCradle(initX, initY, numBalls, length, ballSize) {
  for (var i=0; i<numBalls; i++) {
    if(i==numBalls-1){
    newCircle = Bodies.circle((initX-90) - (i*ballSize), (initY-140), 25);
 
    }
    else{
      newCircle = Bodies.circle(initX - (i*ballSize), initY, 25);
    }
    
    newtonsCradleBalls.push(newCircle)
  
    World.add(myWorld, newCircle);
    // if(i==numBalls-1){
    //   newCircle.isStatic=true;
    // }
  }
  for (var i=0; i<numBalls; i++) {
    let options = {
      pointA: {
        x: initX - (i*ballSize),
        y: initY - (length)
      },
      bodyB: newtonsCradleBalls[i],
      stiffness: .5,
      length: length
    }
    newtonsCradleConstraintsPositions.push({
      x: initX - (i*ballSize),
      y: initY-length
    });
    let myConstraint = Constraint.create(options);
    World.add(myWorld, myConstraint);
  }

}

function showNewtonsCradle() {
  for (var i=0; i<newtonsCradleBalls.length; i++) {
    drawBall(newtonsCradleBalls[i], 50);
    line(newtonsCradleBalls[i].position.x, newtonsCradleBalls[i].position.y, newtonsCradleConstraintsPositions[i].x, newtonsCradleConstraintsPositions[i].y);
  }
}

function checkFinal(){
  World.remove(myWorld, finalBall)
  setTimeout(()=>{
    if(final){
      window.location.href = "/missionSuccess.html";
    }
  }, 800)
}