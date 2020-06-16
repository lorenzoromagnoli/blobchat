let bubbles = [];
let bubblesCount = 5;
let scene, renderer, camera, controls;

let boundingBoxSize = 80;

var loader = new THREE.GLTFLoader();

let mesh;

let loadedScene;

let envMap;

let composer;

let worldLoaded = false;
let shapeLoaded = false;


function loadEnvMap() {
  var r = "cubemap/";
  var urls = [ r + "px.png", r + "nx.png",
    r + "py.png", r + "ny.png",
    r + "pz.png", r + "nz.png"
  ];

  envMap = new THREE.CubeTextureLoader().load( urls );
  envMap.format = THREE.RGBFormat;
}

function loadEnvitonment( done ) {

  loader.load( '3dmodels/island-stage.gltf', function( gltf ) {

      loadedScene = gltf.scene;

      loadedScene.traverse( function( child ) {

        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.envMap = envMap;
        } else if ( child.isLight ) {
          child.castShadow = true;
        }
      } );
      scene.add( gltf.scene );
    },
    // called while loading is progressing
    function( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      done();
    },
    // called when loading has errors
    function( error ) {
      console.log( 'An error happened', error );
    } )
}


function loadObject( name, done ) {

  var glTFGeometry = new THREE.BufferGeometry();

  // Load a glTF resource
  let modelUrl = name
  loader.load( modelUrl, function( gltf ) {

      gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) {
          mesh = node
        };
      } );
      mesh.material.morphTargets = true;
    },
    // called while loading is progressing
    function( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      done();
    },
    // called when loading has errors
    function( error ) {
      console.log( 'An error happened', error );
    }
  );
}



class Shape {
  constructor( textureID, userID ) {

    if ( textureID != null ) {
      this.video = document.getElementById( textureID );
      this.texture = new THREE.VideoTexture( this.video );
      this.texture.flipY = false;
      this.videoMaterial = new THREE.MeshStandardMaterial( { map: this.texture } );
      this.videoMaterial.envMap = envMap;

    } else {
      this.videoMaterial = new THREE.MeshBasicMaterial( {} )
    }

    this.videoMaterial.morphTargets = true;
    let baseGeometry = mesh.geometry.clone();

    this.shape = new THREE.Mesh(
      baseGeometry, this.videoMaterial
    );

    this.shape.name = textureID;

    let randomx = Math.random() * 10 - 5
    let randomz = Math.random() * 10 - 5

    this.shape.position.set( randomx, 20, randomz );
    this.shape.scale.set( 2, 2, 2, );
    this.shape.rotation.y = Math.PI / 2 * 3

    this.divName = textureID;
    this.jitsiUserID = userID;
  }

  setjitsiUserID( ID ) {
    this.jitsiUserID = ID;
  }

  land() {
    let position = new THREE.Vector3( this.shape.position.x, this.shape.position.y, this.shape.position.z );
    let landedPosition = new THREE.Vector3( this.shape.position.x, 0, this.shape.position.z );

    let landTransition = new TWEEN.Tween( position )
      .to( landedPosition, 1000 )
      .easing( TWEEN.Easing.Bounce.Out )
      .onUpdate( () => {
        this.shape.position.y = position.y;
      } )
      .onComplete( () => {
        //console.log( "done" );
      } )
      .onStart( () => {
        this.morph( this.flatShape, 1000, 250, () => {
          this.morph( this.restShape, 3000, 0, () => {} )
        } )
      } )
      .delay( 2000 )
      .start();
  }

  shapeInfluences = { flat: 0, tall: 0 }
  tallShape = { flat: 0, tall: 1 }
  flatShape = { flat: 1, tall: 0 }
  restShape = { flat: 0, tall: 0 }

  morph( morphValues, s, d, then ) {
    let tallTransition = new TWEEN.Tween( this.shapeInfluences )
      .to( morphValues, s )
      .easing( TWEEN.Easing.Elastic.Out )
      .onUpdate( () => {
        this.shape.morphTargetInfluences[ 0 ] = this.shapeInfluences.flat;
        this.shape.morphTargetInfluences[ 1 ] = this.shapeInfluences.tall;
      } )
      .onComplete( function() {
        then();
      } )
      .delay( d )
      .start()
  }


  currenShapeIndex = 0;

  changeShape( shapeIndex ) {
    if ( shapeIndex != this.currenShapeIndex ) {
      switch ( shapeIndex ) {
        case 0:
          this.morph( this.restShape, 1000, 0, function() {} )
          break;
        case 1:
          this.morph( this.tallShape, 1000, 0, function() {} )
          //this.jumpToRandomPlace();

          break;
        case 2:
          this.morph( this.flatShape, 1000, 0, function() {} )
          break;
      }
      this.currenShapeIndex = shapeIndex;
    }
  }

}

let o;

function assignIdToLocalTrack( ID ) {
  for ( let i = 0; i < bubbles.length; i++ ) {
    if ( bubbles[ i ].divName == "localVideo1" ) {
      bubbles[ i ].setjitsiUserID( ID )
    }
  }
}

// function createTerrain() {
//   var geometry = new THREE.PlaneGeometry( 1000, 1000, 90, 90 );
//   for ( var i = 0; i < geometry.vertices.length; i++ ) {
//     geometry.vertices[ i ].z = ( Math.random() * 2 - 1 ) * 10;
//   }
//
//   var terrainMaterial = new THREE.MeshLambertMaterial( {
//     color: '#FBB600',
//     flatShading: false,
//     side: THREE.DoubleSide
//   } );
//
//   let terrain = new THREE.Mesh(
//     geometry, terrainMaterial
//   );
//
//   terrain.rotation.x = Math.PI / 2;
//
//   terrain.name = "terrain";
//
//   scene.add( terrain );
// }

function getLocalBubble() {
  for ( let i = 0; i < bubbles.length; i++ ) {
    if ( bubbles[ i ].divName == "localVideo1" ) {
      return ( bubbles[ i ] );
    }
  }
}

function initlights() {
  const ambientLight = new THREE.AmbientLight( 0xFC7BE0, 4 );
  scene.add( ambientLight );

  // const pointLight = new THREE.PointLight( 0xffffff, 10 );
  // scene.add( pointLight );
  // pointLight.position.set( -10, 10, 5 );
  //  scene.add( camera );
}


function initScene() {
  scene = new THREE.Scene();
  //scene.background = new THREE.Color( 0xFC7BE0 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.name = "camera";
  scene.add( camera );
  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMapEnabled = true;



  $( "#video-chat" ).append( renderer.domElement );

  //document.body.appendChild( renderer.domElement );

  camera.position.set( 0, 4, 20 )
  camera.rotation.x = -0.25

  var geometry = new THREE.BoxBufferGeometry( boundingBoxSize, boundingBoxSize, boundingBoxSize );

  loadEnvMap();

  loadEnvitonment( function() {
    loadObject( "3dmodels/object.gltf", function() {

    } );
  } );

  initlights()
  window.scene = scene;

}


function initLocalBubble() {
  let o = new Shape( "localVideo1" );
  bubbles.push( o );
  //console.log( b );
  scene.add( o.shape );
  o.land()
}


function deleteBubble( id ) {
  var selectedObject = scene.getObjectByName( id );
  scene.remove( selectedObject );
  console.log( "removed" + id );
  for ( let i = 0; i < bubbles.length; i++ ) {
    if ( bubbles[ i ].shape.name == id ) {
      bubbles.splice( i, 1 );
      break;
    }
  }
}

function changeShape( id, shapeIndex ) {
  for ( let i = 0; i < bubbles.length; i++ ) {
    if ( bubbles[ i ].jitsiUserID == id ) {
      bubbles[ i ].changeShape( parseInt( shapeIndex ) );
      break;
    }

  }
}

function automaticallyAddLightsTo( inputScene ) {
  inputScene.children.forEach( ( x ) => {
    var light = new THREE.DirectionalLight( 0xffffff, 0 ), //placeholder
      isActuallyALight = false;
    if ( x.name.includes( "Sun" ) ) {
      light = new THREE.DirectionalLight( 0xffffff, 1 );
      isActuallyALight = true;
    } else if ( x.name.includes( "Point" ) ) {
      light = newTHREE.PointLight( 0xffffff, 1, 100 );
      isActuallyALight = true;
    } //etc for other lights
    light.position.copy( x.position );
    light.rotation.copy( x.rotation );
    light.scale.copy( x.scale );
    light.quaternion.copy( x.quaternion );
    if ( isActuallyALight )
      s.add( light );
  } );
}


function addBubble( id, videoId ) {
  let rotVector = new THREE.Vector3( Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2 )
  let o = new Shape( videoId );
  o.setjitsiUserID( id )
  bubbles.push( o );
  //console.log( b );
  scene.add( o.shape );
  o.land();

}


function animate() {
  requestAnimationFrame( animate );
  TWEEN.update();
  renderer.render( scene, camera );
}

initScene();
// initObjects()
animate();