let bubbles = [];
let bubblesCount = 5;
let scene, renderer, camera, controls;

let boundingBoxSize = 80;

var loader = new THREE.GLTFLoader();

let geometries = [];

let tempPerc = 1;


function loadMesh( name ) {

  var glTFGeometry = new THREE.BufferGeometry();

  // Load a glTF resource
  let modelUrl = './3dmodels/' + name + '.gltf'
  loader.load( modelUrl, function( gltf ) {

      var mesh = gltf.scene.children[ 0 ]

      var geometry = new THREE.Geometry().fromBufferGeometry( mesh.geometry );
      mesh.geometry = geometry;

      mesh.geometry.scale( 10, 10, 10 );
      mesh.geometry.rotateZ( -Math.PI / 2 );

      mesh.geometry.name = name;

      geometries.push( mesh.geometry );


    },
    // called while loading is progressing
    function( xhr ) {
      //  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function( error ) {

      console.log( 'An error happened', error );

    }
  );
}



class Orbital {
  constructor( radius, rotationVector, textureID ) {

    if ( textureID != null ) {
      this.video = document.getElementById( textureID );
      console.log( this.video );
      this.texture = new THREE.VideoTexture( this.video );
      this.videoMaterial = new THREE.MeshBasicMaterial( { map: this.texture } );
    } else {
      this.videoMaterial = new THREE.MeshBasicMaterial( {} )
    }


    this.radius = radius;

    this.CircleGeometry = new THREE.CircleGeometry( this.radius, 100 );
    this.CircleGeometry.vertices.shift();

    this.circle = new THREE.Line(
      this.CircleGeometry,
      //new THREE.LineDashedMaterial( { color: 'aqua' } )
    );
    this.activeGeometryIndex = 0;

    let baseGeometry = geometries[ this.activeGeometryIndex ].clone();


    this.planet = new THREE.Mesh(
      baseGeometry, this.videoMaterial
    );
    this.planet.position.set( this.radius, 0, 0 );


    var dir = new THREE.Vector3( 0, 0, 1 ).normalize();
    var origin = this.CircleGeometry.position
    var length = 10;
    var hex = 0xffff00;
    this.arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );

    this.orbit = new THREE.Group();
    //this.orbit.add( this.arrowHelper )
    //this.orbit.add( this.circle );
    this.orbit.add( this.planet );

    this.orbit.rotation.x = rotationVector.x;
    this.orbit.rotation.y = rotationVector.y;
    this.orbit.rotation.z = rotationVector.z;

    this.orbit.name = textureID;

    scene.add( this.orbit );

    this.rotationAxis = dir;
    this.rotationSpeed = 0.005;

    this.morfStarted = false;
    this.morfTarget;
    this.morfAmount = 0;
    this.currentGeometryIndex = 0;
  }

  rotate() {
    //declared once at the top of your code
    //var axis = this.arrowHelper.rotation

    this.orbit.rotateOnAxis( this.rotationAxis, this.rotationSpeed );

    this.planet.lookAt( -100, 0, 0 );

  }

  morfUpdate() {
    if ( this.morfStarted ) {
      this.morfAmount += 0.01;
      this.morf()
      //console.log( this.morfAmount );
      if ( this.morfAmount > 1 ) {
        this.morfStarted = false;
        this.morfAmount = 0;
        this.currentGeometryIndex = this.morfTarget;
        console.log( "done", this.currentGeometryIndex );
      }
    }
  }

  startMorfing( targetIndex ) {
    this.morfTarget = targetIndex
    this.morfStarted = true;
  }

  morf() {
    let currentGeometry = this.planet.geometry;

    var vertexCount = currentGeometry.vertices.length;
    //console.log( vertexCount );

    for ( var i = 0; i < vertexCount; i++ ) {
      var pos1 = currentGeometry.vertices[ i ].clone();
      var pos2 = geometries[ this.morfTarget ].vertices[ i ].clone();
      currentGeometry.vertices[ i ].copy( pos1.lerp( pos2, this.morfAmount ) );
    }
    currentGeometry.verticesNeedUpdate = true;
    currentGeometry.computeVertexNormals();
    currentGeometry.computeFaceNormals();
  }
}

let o;

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.setClearColor( 0xffffff, 0 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( directionalLight );

  $( "#video-chat" ).append( renderer.domElement );

  //document.body.appendChild( renderer.domElement );

  camera.position.z = 100;

  var geometry = new THREE.BoxBufferGeometry( boundingBoxSize, boundingBoxSize, boundingBoxSize );

  var wireframe = new THREE.WireframeGeometry( geometry );

  var line = new THREE.LineSegments( wireframe );
  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;

  //scene.add( line );

  var axesHelper = new THREE.AxesHelper( 5 );
  //scene.add( axesHelper );

  window.scene = scene;

  loadMesh( "sphere" );
  loadMesh( "cube" );
}


function initLocalBubble() {
  let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )
  let o = new Orbital( 50, rotVector, "localVideo1" );
  bubbles.push( o );
  //console.log( b );
  scene.add( o.orbit );

  // setInterval( function() {
  //   if ( o.currentGeometryIndex == 0 ) {
  //     o.startMorfing( 1 );
  //
  //   } else if ( o.currentGeometryIndex == 1 ) {
  //     o.startMorfing( 0 );
  //   }
  // }, 10000 );
}


function startMorfing( id, morfTargetID ) {
  for ( let i = 0; i < bubbles.length; i++ ) {
    if ( bubbles[ i ].orbit.name == id ) {
      if ( bubbles[ i ].currentGeometryIndex != morfTargetID ) {
        bubbles[ i ].startMorfing( morfTargetID );
      } else {}
    }
  }
}


function deleteBubble( id ) {
  var selectedObject = scene.getObjectByName( id );
  scene.remove( selectedObject );
  console.log( "removed" + id );
  for ( let i = 0; i < bubbles.length; i++ ) {
    if ( bubbles[ i ].orbit.name == id ) {
      bubbles.splice( i, 1 );
    }
  }
}


function addBubble( id ) {
  let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )
  let o = new Orbital( 50, rotVector, id );
  bubbles.push( o );
  //console.log( b );
  scene.add( o.orbit );
}


function animate() {
  requestAnimationFrame( animate );


  for ( let i = 0; i < bubbles.length; i++ ) {
    bubbles[ i ].rotate();
    bubbles[ i ].morfUpdate();
  }

  renderer.render( scene, camera );
}

initScene();
// initObjects()
animate();