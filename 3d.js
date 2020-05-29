var camera, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var activestreamsID = [];

var meshes = [];

function addNewStream( id ) {
  var video = $( "#" + id );
  video.on( "play", function() {
    let image = document.getElementById( id );
    var texture = new THREE.VideoTexture( image );

    var material = new THREE.MeshBasicMaterial( { map: texture } );

    var geometry = new THREE.CubeGeometry( 0.1, 0.1, 0.1 );

    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.y = ( Math.random() * 1 ) - 0.5;

    meshes.push( mesh );
    scene.add( mesh );
    console.log( "added new mesh" );
  } )

}



function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.z = 1;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( windowHalfX, windowHalfY );
  document.body.appendChild( renderer.domElement );


  var video = document.getElementById( 'localVideo1' );
  var texture = new THREE.VideoTexture( video );

  var material = new THREE.MeshBasicMaterial( { map: texture } );

  var geometry = new THREE.SphereGeometry( 0.1, 0.1, 0.1 );

  var mesh = new THREE.Mesh( geometry, material );

  meshes.push( mesh );
  scene.add( mesh );

}

function init3d() {
  init();
  animate();
}

function animate() {


  for ( let i = 0; i < meshes.length; i++ ) {
    meshes[ i ].rotation.y += 0.01;
    meshes[ i ].position.x += 0.01;

    if ( meshes[ i ].position.x > 1 ) {
      meshes[ i ].position.x = -1;
    }
  }

  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}


function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( windowHalfX, windowHalfY );

}