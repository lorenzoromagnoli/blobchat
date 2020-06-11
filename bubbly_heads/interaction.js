$( document ).ready( function() {
  let roomNameFromUrl = getRoomNameFromUrl();
  if ( roomNameFromUrl != "#" && roomNameFromUrl != "" && roomNameFromUrl != undefined ) {
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
  console.log( roomName );
  createConnection( roomName );
  showVideoChat();
  $( ".roomName" ).html( roomName );
}

function getRoomNameFromUrl() {
  let url = window.location.href;
  let lastSlashPosition = url.lastIndexOf( "/" );
  let roomName = url.substring( lastSlashPosition + 2, url.length );
  return ( roomName );
}

function renameUrl( roomName ) {
  let url = window.location.href;
  let lastSlashPosition = url.lastIndexOf( "/" );
  let baseUrl = url.substring( 0, lastSlashPosition + 1 );
  console.log( baseUrl )
  let chatUrl = baseUrl + "#" + roomName;
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