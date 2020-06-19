import * as THREE from 'three';


export default class ThreeScene {
  constructor() {
    this.bubbles = [];
    this.bubblesCount = 5;
    this.scene, this.renderer, this.camera, this.controls;
    this.boundingBoxSize = 80;

    this.initScene();
    // initObjects()
    this.animate();
    window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    this.renderer = new THREE.WebGLRenderer( { alpha: true } );
    this.renderer.setClearColor( 0xffffff, 0 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    this.scene.add( directionalLight );

    $( "#video-chat" ).append( this.renderer.domElement );

    //document.body.appendChild( renderer.domElement );

    this.camera.position.z = 100;

    var geometry = new THREE.BoxBufferGeometry( this.boundingBoxSize, this.boundingBoxSize, this.boundingBoxSize );

    var wireframe = new THREE.WireframeGeometry( geometry );

    var line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    window.scene = this.scene;
  }


  initLocalBubble() {
    let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )
    let o = new Orbital( 50, rotVector, "localVideo1" );
    this.bubbles.push( o );
    //console.log( b );
    this.scene.add( o.orbit );
  }

  deleteBubble( id ) {

    var selectedObject = scene.getObjectByName( id );
    scene.remove( selectedObject );
    console.log( "removed" + id );
    for ( let i = 0; i < this.bubbles.length; i++ ) {
      if ( this.bubbles[ i ].id == id ) {
        this.bubbles.splice( i, 1 );
      }
    }
  }

  addBubble( id ) {
    let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )
    let o = new Orbital( 50, rotVector, id );
    this.bubbles.push( o );
    //console.log( b );
    this.scene.add( o.orbit );
  }

  animate() {
    requestAnimationFrame( this.animate.bind( this ) );
    for ( let i = 0; i < this.bubbles.length; i++ ) {
      this.bubbles[ i ].rotate();
    }
    this.renderer.render( this.scene, this.camera );
  }
}



class Orbital {
  constructor( radius, rotationVector, textureID ) {

    if ( textureID != null ) {
      this.video = document.getElementById( textureID );
      console.log( this.video );
      this.texture = new THREE.VideoTexture( this.video );
      this.videoMaterial = new THREE.MeshBasicMaterial( { map: this.texture } );
    } else {
      this.videoMaterial = new THREE.MeshStandardMaterial( {} )
    }


    this.radius = radius;

    this.CircleGeometry = new THREE.CircleGeometry( this.radius, 100 );
    this.CircleGeometry.vertices.shift();

    this.circle = new THREE.Line(
      this.CircleGeometry,
      //new THREE.LineDashedMaterial( { color: 'aqua' } )
    );

    this.planet = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 20, 32, 32 ), this.videoMaterial
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

  }

  rotate() {
    //declared once at the top of your code
    //var axis = this.arrowHelper.rotation

    this.orbit.rotateOnAxis( this.rotationAxis, this.rotationSpeed );

    this.planet.lookAt( -100, 0, 0 );

  }
}