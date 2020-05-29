/** Set up relative positions and scales **/
var VIEW = {};
VIEW.SAFE_WIDTH = 100;
VIEW.SAFE_HEIGHT = 100;
VIEW.scale = Math.min( window.innerWidth / VIEW.SAFE_WIDTH, window.innerHeight / VIEW.SAFE_HEIGHT );
VIEW.width = window.innerWidth / VIEW.scale;
VIEW.height = window.innerHeight / VIEW.scale;
VIEW.centerX = VIEW.width / 2;
VIEW.centerY = VIEW.height / 2;
VIEW.offsetX = ( VIEW.width - VIEW.SAFE_WIDTH ) / 2 / VIEW.scale;
VIEW.offsetY = ( VIEW.height - VIEW.SAFE_HEIGHT ) / 2 / VIEW.scale;

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create( {
  element: document.body,
  engine: engine
} );

// create two boxes and a ground
var boxA = Bodies.circle( 400, 200, 200, 200 );
var boxB = Bodies.rectangle( 450, 50, 80, 80 );
var ground = Bodies.rectangle( 400, 610, 810, 60, { isStatic: true } );


function generateNewBody() {
  var bodiesDom = document.querySelectorAll( '.videoContainer' );
  var bodies = [];
  for ( var i = 0, l = bodiesDom.length; i < l; i++ ) {
    var body = Bodies.rectangle(
      VIEW.centerX,
      20,
      VIEW.width * bodiesDom[ i ].offsetWidth / window.innerWidth,
      VIEW.height * bodiesDom[ i ].offsetHeight / window.innerHeight
    );
    bodiesDom[ i ].id = body.id;
    bodies.push( body );
  }
  World.add( engine.world, bodies );
}


// add all of the bodies to the world
World.add( engine.world, [ boxA, boxB, ground ] );

// run the engine
Engine.run( engine );

// run the renderer
Render.run( render );