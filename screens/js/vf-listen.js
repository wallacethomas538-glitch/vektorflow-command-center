/* VektorFlow Command Center — voice input (browser speech recognition).
 * Free built-in Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * No backend, no cost. Works on Android Chrome over HTTPS.
 * Never mock: if unsupported or the mic is denied, start() reports an honest
 * error and the UI must surface it instead of faking a listening state.
 */
(function () {
  "use strict";

  function recogCtor() {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  var current = null;   // active SpeechRecognition instance
  var listening = false;

  function humanMessage(code) {
    switch (String(code)) {
      case "no-speech":
        return "Didn't catch that \u2014 no speech detected. Tap the mic and try again.";
      case "audio-capture":
        return "No microphone was found on this device.";
      case "not-allowed":
      case "service-not-allowed":
        return "Microphone access was denied. Allow microphone permission in your browser settings to use voice input.";
      case "network":
        return "Speech recognition needs a network connection right now.";
      case "aborted":
        return "Listening stopped.";
      case "unsupported":
        return "Speech recognition is not supported in this browser. Type your directive instead.";
      case "init-failed":
      case "start-failed":
        return "Could not start the microphone. Try again.";
      default:
        return "Speech recognition ran into an issue (" + code + "). Try again.";
    }
  }

  var VfListen = {
    isSupported: function () { return !!recogCtor(); },

    isListening: function () { return listening; },

    start: function (onResult, onEnd, onError) {
      var Ctor = recogCtor();
      if (!Ctor) {
        if (typeof onError === "function") {
          try { onError("unsupported", humanMessage("unsupported")); } catch (e) {}
        }
        return false;
      }
      // Tear down any previous session first.
      VfListen.stop();

      var rec;
      try {
        rec = new Ctor();
      } catch (e) {
        if (typeof onError === "function") {
          try { onError("init-failed", humanMessage("init-failed")); } catch (e2) {}
        }
        return false;
      }

      rec.lang = "en-US";
      rec.interimResults = true;
      rec.continuous = false; // one utterance per tap: predictable on mobile
      rec.maxAlternatives = 1;

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        if (current === rec) { current = null; listening = false; }
        if (typeof onEnd === "function") { try { onEnd(); } catch (e) {} }
      }

      rec.onresult = function (ev) {
        var text = "", isFinal = false;
        try {
          var res = ev.results || [];
          var startIdx = ev.resultIndex || 0;
          for (var i = startIdx; i < res.length; i++) {
            if (res[i] && res[i][0] && res[i][0].transcript) text += res[i][0].transcript;
            if (res[i] && res[i].isFinal) isFinal = true;
          }
        } catch (e) {}
        if (typeof onResult === "function") { try { onResult(text, isFinal); } catch (e) {} }
      };

      rec.onerror = function (ev) {
        var code = (ev && ev.error) ? String(ev.error) : "unknown";
        // "aborted" fires on intentional stop(); not an error worth surfacing.
        if (code !== "aborted" && typeof onError === "function") {
          try { onError(code, humanMessage(code)); } catch (e) {}
        }
      };

      rec.onend = finish;

      try {
        rec.start();
      } catch (e) {
        if (typeof onError === "function") {
          try { onError("start-failed", humanMessage("start-failed")); } catch (e2) {}
        }
        return false;
      }

      current = rec;
      listening = true;
      return true;
    },

    stop: function () {
      var rec = current;
      current = null;
      listening = false;
      if (rec) { try { rec.stop(); } catch (e) {} }
      // Note: rec.onend still fires asynchronously and calls onEnd once.
    }
  };

  window.VfListen = VfListen;
})();
