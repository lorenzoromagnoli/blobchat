//load css
import '../baseStyle.scss';
import './style.scss';

import * as JMEET from './jitsi_meet';
import ThreeScene from './3d_viz.js';


let scene = new ThreeScene();

$( document ).ready( function() {
  let roomNameFromUrl = getRoomNameFromUrl();
  if ( roomNameFromUrl != null ) {
    console.log( "the room name is set already" );
    startChat( roomNameFromUrl );
  }
} );


$( ".room-name .button" ).click( function() {
  let roomName = $( ".room-name input" ).val();
  if ( roomName != "" ) {
    startChat( roomName )
    renameUrl( roomName );
  }
} );

function startChat( roomName ) {
  setTimeout( function() {
    console.log( roomName );
    JMEET.createConnection(
      roomName,
      ( videoContainerID ) => { //called afterWebcamStarts
        console.log( "creating local bubble" );
        scene.initLocalBubble()
      },
      ( assignedJitsiUserID ) => { //called after conference is joined
      },
      ( participantID, videoContainer ) => { //called AfterSomeoneJoins
        console.log( "creating remote bubble" );
        scene.addBubble( videoContainer )
      },
      ( jistsiUserID ) => { //called afterSomeoneLeaves
        scene.deleteBubble( jistsiUserID );
      },
    );
    showVideoChat();
    $( ".roomName" ).html( roomName );
  }, 2000 )
}

function getRoomNameFromUrl() {
  let url = window.location.href;
  let lastSlashPosition = url.lastIndexOf( "#" );

  if ( lastSlashPosition == -1 ) {
    return null;
  } else {
    let roomName = url.substring( lastSlashPosition, url.length );
    if ( roomName = "#wouter" ) {
      console.log( "hey, it's wouter's birtday!" )
      $( 'body' ).css( "background-image", "url('https://media.giphy.com/media/l4KhTf1bkmfviq0Za/source.gif')" );
      $( 'body' ).css( "background-size", "cover" );

    }
    return ( roomName );
  }


}

function renameUrl( roomName ) {
  let url = window.location.href;
  let chatUrl = url + "/#" + roomName;
  window.location.replace( chatUrl )
}

function showVideoChat() {
  $( "#transition-wrapper" ).toggleClass( "show" ); //show the curtain
  setTimeout( function() { //wait 1s
    $( "#welcomeScreen" ).toggleClass( "hide" ); //hide the welcome screen
    $( "#video-chat" ).toggleClass( "hide" ); //shows the treejs canvas
    setTimeout( function() { //wait 1s
      $( ".transition" ).toggleClass( "show" ) //remove the curtain
    }, 600 );
  }, 600 );
}

function updateMuteIcon( isMuted ) {
  if ( isMuted ) {
    $( "#mutebtn i" ).removeClass( "fa-microphone" ).addClass( "fa-microphone-slash" )
  } else {
    $( "#mutebtn i" ).removeClass( "fa-microphone-slash" ).addClass( "fa-microphone" )

  }
}