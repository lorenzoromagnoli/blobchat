const URL = "https://teachablemachine.withgoogle.com/models/F8s_wBw74/";
let model, webcamCanvas, ctx, labelContainer, maxPredictions;

async function initTFjs( videoContainerID ) {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load( modelURL, metadataURL );
  maxPredictions = model.getTotalClasses();


  labelContainer = document.getElementById( 'label-container' );
  for ( let i = 0; i < maxPredictions; i++ ) { // and class labels
    labelContainer.appendChild( document.createElement( 'div' ) );
  }

  webcamCanvas = document.getElementById( videoContainerID )
  window.requestAnimationFrame( loop );

}


async function loop( timestamp ) {
  predict();
  setTimeout( loop, 1000 );
}

async function predict() {

  // console.log( "starting prediction" );
  // console.log( webcamCanvas );

  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose( webcamCanvas );
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict( posenetOutput );

  //console.log( prediction );

  let selectedClass = -1;
  let maxProbability = 0;
  for ( let i = 0; i < prediction.length; i++ ) {
    if ( prediction[ i ].probability > maxProbability ) {
      maxProbability = prediction[ i ].probability;
      selectedClass = i;
    }
  }

  getLocalBubble().startMorfing( selectedClass );

  //  startMorfing( "localVideo1", selectedClass );
  for ( let i = 0; i < maxPredictions; i++ ) {
    const classPrediction =
      prediction[ i ].className + ': ' + prediction[ i ].probability.toFixed( 2 );
    labelContainer.childNodes[ i ].innerHTML = classPrediction;
  }

  // finally draw the poses
  //  drawPose( pose );
}