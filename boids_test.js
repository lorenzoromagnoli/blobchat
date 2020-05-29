class Boids {
  constructor( NbBoids, MaxPosition ) {
    this.boids = [];
    for ( var i = 0; i != NbBoids; i++ ) {
      this.boids[ i ] = {
        pos: new THREE.Vector3( Math.random() * MaxPosition.x, Math.random() * MaxPosition.y, Math.random() * MaxPosition.z ),
        vel: new THREE.Vector3( 0, 0, 0 )
      }
    }
  }

  // rule0: a boid move to center of boids.
  BoidRule0( move_index ) {
    var center = new THREE.Vector3( 0 );
    for ( var i = 0; i != this.boids.length; i++ ) {
      if ( i != move_index )
        center.add( this.boids[ i ].pos );
    }
    center.divideScalar( this.boids.length - 1 )

    // calculate offset using center position.
    const kDivisionNum = 100.0;
    center.sub( this.boids[ move_index ].pos );
    center.divideScalar( kDivisionNum );

    this.boids[ move_index ].vel.add( center );
  }

  // rule1: a boid keep the constant distance between the other boid.
  BoidRule1( move_index ) {
    const kDistanceMin = 0.1;
    for ( var i = 0; i != this.boids.length; i++ ) {
      if ( i != move_index ) {
        var distance = this.boids[ i ].pos.distanceTo( this.boids[ move_index ].pos );
        if ( distance < kDistanceMin ) {
          var diff = new THREE.Vector3();
          diff.subVectors( this.boids[ i ].pos, this.boids[ move_index ].pos )
          this.boids[ move_index ].vel.sub( diff );
        }
      }
    }

  }

  // rule2: a boid keep his velocity to mean velocity of boids
  BoidRule2( move_index ) {
    var mean_velocity = new THREE.Vector3( 0 );
    for ( var i = 0; i != this.boids.length; i++ ) {
      if ( i != move_index ) {
        mean_velocity.add( this.boids[ i ].vel );
      }
    }
    const kDivisionNum = 10.0;
    mean_velocity.divideScalar( this.boids.length - 1 );
    var diff = new THREE.Vector3();
    diff.subVectors( mean_velocity, this.boids[ move_index ].vel );
    diff.divideScalar( kDivisionNum );
    this.boids[ move_index ].vel.add( diff );
  }

  MoveObjects( kMaxPosition ) {
    for ( var i = 0; i != this.boids.length; i++ ) {
      this.BoidRule0( i );
      this.BoidRule1( i );
      this.BoidRule2( i );

      //Limit speed
      var boid = this.boids[ i ];
      var speed = boid.vel.length();
      const kMaxSpeed = 0.1;
      if ( speed > kMaxSpeed ) {
        var r = kMaxSpeed / speed;
        boid.vel.multiplyScalar( r );
      }
      // Inverse velocity when out of screen.
      if ( ( this.boids[ i ].pos.x < 0 && this.boids[ i ].vel.x < 0 ) || ( this.boids[ i ].pos.x > kMaxPosition.x && this.boids[ i ].vel.x > 0 ) )
        this.boids[ i ].vel.x *= -1;
      if ( ( this.boids[ i ].pos.y < 0 && this.boids[ i ].vel.y < 0 ) || ( this.boids[ i ].pos.y > kMaxPosition.y && this.boids[ i ].vel.y > 0 ) )
        this.boids[ i ].vel.y *= -1;
      if ( ( this.boids[ i ].pos.z < 0 && this.boids[ i ].vel.z < 0 ) || ( this.boids[ i ].pos.z > kMaxPosition.z && this.boids[ i ].vel.z > 0 ) )
        this.boids[ i ].vel.z *= -1;

      this.boids[ i ].pos.add( this.boids[ i ].vel );
    }

  }
}

var scene;
var scene_object = [];
var boids_inst;

var CreateSphere = function( radius, position, color = { color: 0xffff00 } ) {
  var geometry = new THREE.SphereGeometry( radius );
  var material = new THREE.MeshPhongMaterial( color );
  var sphere = new THREE.Mesh( geometry, material );
  sphere.position = position;
  return sphere;
}

var CreateBox = function( w, h, d, pos_x, pos_y, pos_z, color = { color: 0x00ffff } ) {
  var box_geometry = new THREE.BoxGeometry( w, h, d );
  var geometry = new THREE.EdgesGeometry( box_geometry );
  var material = new THREE.LineBasicMaterial( color );
  var box = new THREE.LineSegments( geometry, material );
  box.position.set( pos_x, pos_y, pos_z );
  return box;
}

var init = function() {
  const kNbBoids = 50;
  const kMaxPosition = new THREE.Vector3( 10.0, 10.0, 10.0 );
  boids_inst = new Boids( kNbBoids, kMaxPosition );

  renderer = new THREE.WebGLRenderer();

  var size = getWindowSize();
  container.style.cssText = "width: " + size.width + "px; height: " + size.height + "px;";
  renderer.setSize( size.width, size.height );
  container = document.getElementById( "container" );
  container.appendChild( renderer.domElement );

  var center = new THREE.Vector3( kMaxPosition.x / 2, kMaxPosition.y / 2, kMaxPosition.z / 2 );
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 45, 1.0, 1, 1000 );
  const kCameraRadius = 30;
  const kCameraY = 20;
  camera.position.set( kCameraRadius, kCameraY, kCameraRadius );
  camera.lookAt( center );

  var light = new THREE.DirectionalLight( 0xffffff );
  scene.add( light );
  light.position.set( 1, 1, 1 );

  for ( var i = 0; i != boids_inst.boids.length; i++ ) {
    var r = Math.floor( Math.random() * 255 );
    var g = Math.floor( Math.random() * 255 );
    var b = Math.floor( Math.random() * 255 );
    var rgb = "rgb(" + r + ", " + g + ", " + b + ")";
    var sphere = CreateSphere( 0.1, boids_inst.boids[ i ].pos, { color: rgb } );
    //var sphere = CreateSphere(0.1, boids_inst.boids[i].pos, {color: 0x00ffff});
    scene_object.push( sphere );
    scene.add( sphere );
  }

  var center_box = new THREE.Vector3( 0, 0, 0 );
  var box = CreateBox( kMaxPosition.x, kMaxPosition.y, kMaxPosition.z, center.x, center.y, center.z );
  scene.add( box );

  onWindowResize();

  //simulation loop
  var theta = 0;
  var SimulationLoop = function() {
    requestAnimationFrame( SimulationLoop );
    boids_inst.MoveObjects( kMaxPosition );
    for ( var i = 0; i != boids_inst.boids.length; i++ ) {
      scene_object[ i ].position.x = boids_inst.boids[ i ].pos.x;
      scene_object[ i ].position.y = boids_inst.boids[ i ].pos.y;
      scene_object[ i ].position.z = boids_inst.boids[ i ].pos.z;
    }
    var camera_x = kCameraRadius * Math.cos( theta );
    var camera_z = kCameraRadius * Math.sin( theta );
    camera.position.set( camera_x, kCameraY, camera_z );
    camera.lookAt( center );
    theta += 0.01;
    renderer.render( scene, camera );
  }
  SimulationLoop();
}

// full screen: reference: http://www.inazumatv.com/contents/archives/8484
getWindowSize = function() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

onWindowResize = function() {
  var size = getWindowSize();
  container.style.cssText = "width: " + size.width + "px; height: " + size.height + "px;";
  renderer.setSize( size.width, size.height );

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
}

onWindowClick = function() {
  var sphere = CreateSphere( 0.1 );
  scene_object.push( sphere );
  scene.add( sphere );
  boids_inst.boids.push( { pos: new THREE.Vector3( 0, 0, 0 ), vel: new THREE.Vector3( 0, 0, 0 ) } );
}

window.addEventListener( 'DOMContentLoaded', init );
window.addEventListener( 'resize', onWindowResize );
window.addEventListener( 'click', onWindowClick );