let scene, camera, renderer, clock;

var loader = new THREE.GLTFLoader();

let mesh;

var sign = 1;
var speed = 0.5;

let basicMaterial;

function loadObject( name ) {

  var glTFGeometry = new THREE.BufferGeometry();

  // Load a glTF resource
  let modelUrl = name
  loader.load( modelUrl, function( gltf ) {

      gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) {
          mesh = node
        };
      } );

      mesh.material = basicMaterial;
      mesh.material.morphTargets = true;
      //mesh.material.visible = false;
      scene.add( mesh );


    },
    // called while loading is progressing
    function( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function( error ) {
      console.log( 'An error happened', error );
    }
  );
}


function animate() {
  requestAnimationFrame( animate );
  TWEEN.update();
  renderer.render( scene, camera );
}


let shapeInfluences = { flat: 0, tall: 0 }
let tall = { flat: 0, tall: 1 }
let flat = { flat: 1, tall: 0 }
let rest = { flat: 0, tall: 0 }

function morph( morphValues, then ) {
  let tallTransition = new TWEEN.Tween( shapeInfluences )
    .to( morphValues, 1000 )
    .easing( TWEEN.Easing.Elastic.Out )
    .onUpdate( function() {
      mesh.morphTargetInfluences[ 0 ] = shapeInfluences.flat;
      mesh.morphTargetInfluences[ 1 ] = shapeInfluences.tall;
    } )
    .onComplete( function() {
      then();
    } )
    .start()
}


function createScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  camera.position.z = 10;

  clock = new THREE.Clock();

  // geometry = new THREE.BoxGeometry();
  basicMaterial = new THREE.MeshNormalMaterial( { color: 0xffffff } );
  //
  // mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );

  var light = new THREE.AmbientLight( 0xfff ); // soft white light
  scene.add( light );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.scene = scene;
}


$( 'body' ).on( 'click', function() {
  morph( tall, function() {
    morph( flat, function() {
      morph( rest, function() {} );
    } );
  } );
} );

createScene();
loadObject( "object.gltf" );
animate();