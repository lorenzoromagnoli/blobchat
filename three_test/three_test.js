let bubbles = [];
let bubblesCount = 5;
let scene, renderer, camera, controls;

let boundingBoxSize = 80;

class Bubble {
  constructor() {
    this.geometry = new THREE.SphereGeometry( 10, 32, 32 );
    this.material = new THREE.MeshToonMaterial( {
      color: 0xffffff,
    } );

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.position.x = Math.random() * boundingBoxSize - boundingBoxSize / 2;
    this.mesh.position.y = Math.random() * boundingBoxSize - boundingBoxSize / 2;
    this.mesh.position.z = Math.random() * boundingBoxSize - boundingBoxSize / 2;

    this.direction = {
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    }
  }

  updatePosition() {
    this.mesh.position.x += this.direction.x;
    this.mesh.position.y += this.direction.y;
    this.mesh.position.z += this.direction.z;
  }
}


class Orbital {
  constructor( radius, rotationVector ) {
    this.radius = radius;

    this.CircleGeometry = new THREE.CircleGeometry( this.radius, 100 );
    this.CircleGeometry.vertices.shift();

    this.circle = new THREE.Line(
      this.CircleGeometry,
      new THREE.LineDashedMaterial( { color: 'aqua' } )
    );

    this.planet = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 10, 32, 32 ),
      new THREE.MeshToonMaterial( { color: 'aqua' } )
    );
    this.planet.position.set( this.radius, 0, 0 );


    var dir = new THREE.Vector3( 0, 0, 1 ).normalize();
    var origin = this.CircleGeometry.position
    var length = 10;
    var hex = 0xffff00;
    this.arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );

    this.orbit = new THREE.Group();
    this.orbit.add( this.arrowHelper )
    this.orbit.add( this.circle );
    this.orbit.add( this.planet );

    this.orbit.rotation.x = rotationVector.x;
    this.orbit.rotation.y = rotationVector.y;
    this.orbit.rotation.z = rotationVector.z;

    scene.add( this.orbit );

    this.rotationAxis = dir;
    this.rotationSpeed = 0.005;

  }

  rotate() {
    //declared once at the top of your code
    //var axis = this.arrowHelper.rotation

    this.orbit.rotateOnAxis( this.rotationAxis, this.rotationSpeed );
  }
}


let o;

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0x111, 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );

  document.body.appendChild( renderer.domElement );

  camera.position.z = 100;

  var geometry = new THREE.BoxBufferGeometry( boundingBoxSize, boundingBoxSize, boundingBoxSize );

  var wireframe = new THREE.WireframeGeometry( geometry );

  var line = new THREE.LineSegments( wireframe );
  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;

  scene.add( line );

  var axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );



  let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )
  o = new Orbital( 50, rotVector );
}

function initObjects() {
  for ( let i = 0; i < bubblesCount; i++ ) {
    //let b = new Bubble();
    let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )

    let o = new Orbital( 50, rotVector );


    bubbles.push( o );
    //console.log( b );
    scene.add( o.orbit );
  }
}




function animate() {
  requestAnimationFrame( animate );

  for ( let i = 0; i < bubblesCount; i++ ) {
    bubbles[ i ].rotate();
  }

  o.rotate();

  renderer.render( scene, camera );
}

initScene();
initObjects()
animate();