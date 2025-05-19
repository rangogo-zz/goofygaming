function startPICO8() {
  run();
}

function showSplashscreen() {
  var $splash = $(".splashscreen");
  if ($splash.length) {
    $splash.css({display: "block"});
    setTimeout(function() {
      $splash.fadeOut();
    }, 6000);
  }
}

function registerAudioUnlock() {
  $("#holder").on("touchend mouseup keyup", function(evt) {
    unlockAudio();
  });
}

var tries = 0;
function unlockAudio() {
  // attempt to unlock
  var ctx = window.pico8AudioContext;
  if (!ctx) {
    console.warn("Could not unlock audio, couldn't find PICO-8's audio context.");
    window.unlockAudio = function() {};
    return;
  }
  if (ctx.state != 'running') {
    console.log("Attempting unlock...");
    $(".debug").html("Audio unlock #" + (tries++));
    if (ctx.resume) {
      $(".debug").html("Trying a resume #" + (tries));
      ctx.resume();
    } else {
      $(".debug").html("Trying a buffer play #" + (tries));
      var buffer = ctx.createBuffer(1, 1, 22050);
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      // connect to output (your speakers)
      source.connect(ctx.destination);
      // play the file
      if (source.start) {
        source.start();
      } else if (source.noteOn) {
        source.noteOn(0);
      }
    }
  } else {
    $(".debug").html("Audio already running.");
  }
}

function startMobile(enterFullScreen) {
  // hide canvas for a second
  $("#canvas").css({display: "none"});
  $(".btns").css({display: "none"});

  var elem = $("#holder")[0]
  var reqFs = grabMethod(elem, "requestFullscreen");
  if (enterFullScreen && reqFs) {
    // listen for the actual change
    $(document).one("webkitfullscreenchange mozfullscreenchange fullscreenchange", function(evt) {
      finalizeMobileMode();
    });
    // request full screen mode
    reqFs.call(elem);
  } else {
    // no full-screen needed/possible
    finalizeMobileMode();
  }
}

function finalizeMobileMode() {
  $("#holder").addClass("fullscreen");
  // preserve correct layout for orientation/size
  doMobileLayout();
  $(window).on("resize", doMobileLayout);
  console.log("In mobile mode.");
}

// =================================================
// Layout
// =================================================

function doMobileLayout() {
  console.log("Resizin!");
  $(".debug").html("Resizing attempt!");
  var w = $(window).width(), h = $(window).height();
  $(".debug").html("Screen: " + w + "x" + h);
  if (w>h) {
    doHorizLayout(w, h);
  } else {
    doVerticalLayout(w, h);
  }
}
function doHorizLayout(w, h) {
  var canvasSize = h - 10;
  //canvasSize = Math.floor(canvasSize / 128) * 128;
  var gameX = Math.floor((w-canvasSize)/2);
  var gameY = Math.floor((h-canvasSize)/2);
  console.log("Screen: " + w + "x" + h);
  console.log("Game: " + canvasSize + "x" + canvasSize);
  console.log("Game loc:" + gameX + "," + gameY);

  $("#holder").css({height: h});
  $("#canvas, .splashscreen")
    .css({
      width: canvasSize,
      height: canvasSize,
      left: gameX, top: gameY,
    })
    .addClass("fullscreen");
  $("#canvas").show();
}

function doVerticalLayout(w, h) {
  var canvasSize = w - 10;
  //canvasSize = Math.floor(canvasSize / 128) * 128;
  var gameX = Math.floor((w-canvasSize)/2);
  var gameY = Math.floor((h-canvasSize)/2);
  console.log("Screen: " + w + "x" + h);
  console.log("Game: " + canvasSize + "x" + canvasSize);
  console.log("Game loc:" + gameX + "," + gameY);
  $("#holder").css({height: h});
  $("#canvas, .splashscreen")
    .css({
      width: canvasSize,
      height: canvasSize,
      left: gameX, top: gameY,
    })
    .addClass("fullscreen");
  $("#canvas").show();
}

// =================================================
// Helpers
// =================================================

function grabMethod(object, name) {
  if (object[name]) return object[name];
  var capitalized = name.substring(0,1).toUpperCase() + name.substring(1)
  var mozName = "moz" + capitalized
  var wkName = "webkit" + capitalized
  if (object[mozName]) return object[mozName]
  if (object[wkName]) return object[wkName]
  return null;
}
