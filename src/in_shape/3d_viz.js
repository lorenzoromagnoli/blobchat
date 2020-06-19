import TWEEN from '@tweenjs/tween.js';


//load threejs library
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

import cmapNX from '../assets/images/cubemap/nx.png';
import cmapNY from '../assets/images/cubemap/ny.png';
import cmapNZ from '../assets/images/cubemap/nz.png';
import cmapPX from '../assets/images/cubemap/px.png';
import cmapPY from '../assets/images/cubemap/py.png';
import cmapPZ from '../assets/images/cubemap/pz.png';


const loader = new GLTFLoader();

let shapegeometry;

export default class ThreeScene {
  constructor() {

    this.bubbles = [];
    this.bubblesCount = 5;
    this.scene, this.renderer, this.camera, this.controls;

    this.boundingBoxSize = 80;

    this.loadedScene;

    this.envMap;

    this.composer;

    this.worldLoaded = false;
    this.shapeLoaded = false;


    this.mesh;
    this.loadModels();
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

  loadModels() {
    this.loadEnvMap();
    this.loadEnvitonment( () => {
      this.loadObject( "/3dModels/object.gltf", function() {
        console.log( "objects loaded" );
      } );
    } );
  }

  loadEnvMap() {
    var r = "cubemap/";
    var urls = [
      cmapPX, cmapNX,
      cmapPY, cmapNY,
      cmapPZ, cmapNZ
    ];

    this.envMap = new THREE.CubeTextureLoader().load( urls );
    this.envMap.format = THREE.RGBFormat;
  }

  loadObject( name, done ) {

    var glTFGeometry = new THREE.BufferGeometry();

    // Load a glTF resource
    let modelUrl = name
    loader.load( modelUrl, ( gltf ) => {

        gltf.scene.traverse( ( node ) => {
          if ( node.isMesh ) {
            this.mesh = node
          };
        } );
        this.mesh.material.morphTargets = true;
        done();

      },
      // called while loading is progressing
      function( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function( error ) {
        console.error( 'An error happened', error );
      }
    );
  }

  loadEnvitonment( done ) {

    loader.load( '/3dModels/island-stage.gltf', ( gltf ) => {

        this.loadedScene = gltf.scene;

        this.loadedScene.traverse( ( child ) => {

          if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.envMap = this.envMap;
          } else if ( child.isLight ) {
            child.castShadow = true;
          }
        } );
        this.scene.add( gltf.scene );
      },
      // called while loading is progressing
      function( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        done();
      },
      // called when loading has errors
      function( error ) {
        console.error( 'An error happened', error );
      } )
  }



  assignIdToLocalTrack( ID ) {
    for ( let i = 0; i < this.bubbles.length; i++ ) {
      if ( this.bubbles[ i ].divName == "localVideo1" ) {
        this.bubbles[ i ].setjitsiUserID( ID )
        break;
      }
    }
  }


  getLocalBubble() {
    for ( let i = 0; i < this.bubbles.length; i++ ) {
      if ( this.bubbles[ i ].divName == "localVideo1" ) {
        return ( this.bubbles[ i ] );
      }
    }
  }

  initlights() {
    const ambientLight = new THREE.AmbientLight( 0xFC7BE0, 4 );
    this.scene.add( ambientLight );
  }


  initScene() {
    this.scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0xFC7BE0 );

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera.name = "camera";
    this.scene.add( this.camera );
    this.renderer = new THREE.WebGLRenderer( { alpha: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMapEnabled = true;

    $( "#video-chat" ).append( this.renderer.domElement );

    //document.body.appendChild( renderer.domElement );

    this.camera.position.set( 0, 4, 20 )
    this.camera.rotation.x = -0.25

    var geometry = new THREE.BoxBufferGeometry( this.boundingBoxSize, this.boundingBoxSize, this.boundingBoxSize );


    this.initlights()
    window.scene = this.scene;

  }


  initLocalBubble() {
    let o = new Shape( "localVideo1", this.mesh );
    this.bubbles.push( o );
    //console.log( b );
    this.scene.add( o.shape );
    o.land()
  }


  deleteBubble( id ) {
    var selectedObject = scene.getObjectByName( id );
    scene.remove( selectedObject );
    console.log( "removed" + id );
    for ( let i = 0; i < this.bubbles.length; i++ ) {
      if ( this.bubbles[ i ].shape.name == id ) {
        this.bubbles.splice( i, 1 );
        break;
      }
    }
  }

  changeShape( id, shapeIndex ) {
    for ( let i = 0; i < this.bubbles.length; i++ ) {
      if ( this.bubbles[ i ].jitsiUserID == id ) {
        this.bubbles[ i ].changeShape( parseInt( shapeIndex ) );
        break;
      }

    }
  }

  automaticallyAddLightsTo( inputScene ) {
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


  addBubble( id, videoId ) {
    let o = new Shape( videoId, this.mesh );
    o.setjitsiUserID( id )
    this.bubbles.push( o );
    //console.log( b );
    this.scene.add( o.shape );
    o.land();

  }

  animate() {
    requestAnimationFrame( this.animate.bind( this ) );
    TWEEN.update();
    this.renderer.render( this.scene, this.camera );
  }




}


class Shape {
  constructor( textureID, mesh, userID ) {

    this.mesh;

    if ( textureID != null ) {
      this.video = document.getElementById( textureID );
      this.texture = new THREE.VideoTexture( this.video );
      this.texture.flipY = false;
      this.videoMaterial = new THREE.MeshStandardMaterial( { map: this.texture } );
      this.videoMaterial.envMap = this.envMap;

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


    this.shapeInfluences = { flat: 0, tall: 0 }
    this.tallShape = { flat: 0, tall: 1 }
    this.flatShape = { flat: 1, tall: 0 }
    this.restShape = { flat: 0, tall: 0 }

    this.currenShapeIndex = 0;


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