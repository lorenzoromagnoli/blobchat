const URL = "https://teachablemachine.withgoogle.com/models/qPL5gjP7I/";

export default class posenetPredictor {
  constructor( onNewClassRecognized ) {
    this.model;
    this.webcamCanvas;
    this.ctx;
    this.labelContainer;
    this.maxPredictions;

    this.lastPredicion = 0;

    this.callback = onNewClassRecognized;
  }


  async initTFjs( videoContainerID ) {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    this.model = await tmPose.load( modelURL, metadataURL );
    this.maxPredictions = this.model.getTotalClasses();


    this.labelContainer = document.getElementById( 'label-container' );
    for ( let i = 0; i < this.maxPredictions; i++ ) { // and class labels
      this.labelContainer.appendChild( document.createElement( 'div' ) );
    }

    this.webcamCanvas = document.getElementById( videoContainerID )
    window.requestAnimationFrame( this.loop.bind( this ) );
  }


  async loop( timestamp ) {
    this.predict();
    setTimeout( this.loop.bind( this ), 1000 );
  }


  async predict() {

    // console.log( "starting prediction" );
    // console.log( webcamCanvas );

    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await this.model.estimatePose( this.webcamCanvas );
    // Prediction 2: run input through teachable machine classification model
    const prediction = await this.model.predict( posenetOutput );

    //console.log( prediction );

    let selectedClass = -1;
    let maxProbability = 0;
    for ( let i = 0; i < prediction.length; i++ ) {
      if ( prediction[ i ].probability > maxProbability ) {
        maxProbability = prediction[ i ].probability;
        selectedClass = i;
      }
    }

    if ( this.lastPrediction != selectedClass ) {

      this.callback( selectedClass );
      this.lastPrediction = selectedClass;
    }


    //  startMorfing( "localVideo1", selectedClass );
    for ( let i = 0; i < this.maxPredictions; i++ ) {
      const classPrediction =
        prediction[ i ].className + ': ' + prediction[ i ].probability.toFixed( 2 );
      this.labelContainer.childNodes[ i ].innerHTML = classPrediction;
    }

    // finally draw the poses
    //  drawPose( pose );
  }


}