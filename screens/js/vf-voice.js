/* VektorFlow Command Center — voice readout (browser TTS).
 * Free built-in Web Speech API. No backend, no cost, works on Android Chrome.
 * Default OFF; persisted in localStorage. Never mock: if unsupported, the
 * toggle hides itself and speak() is a no-op.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "vf_voice_enabled";
  var MAX_CHARS = 2000;

  function supported() {
    return (typeof window !== "undefined")
      && ("speechSynthesis" in window)
      && ("SpeechSynthesisUtterance" in window);
  }

  function pickVoice() {
    try {
      var voices = window.speechSynthesis.getVoices() || [];
      var i, lang;
      for (i = 0; i < voices.length; i++) {
        lang = voices[i] && voices[i].lang ? String(voices[i].lang) : "";
        if (/^en([-_]|$)/i.test(lang)) return voices[i];
      }
      return voices[0] || null;
    } catch (e) { return null; }
  }

  function stripMarkup(text) {
    return String(text == null ? "" : text)
      .replace(/<[^>]*>/g, " ")            // HTML tags
      .replace(/```[\s\S]*?```/g, " ")     // fenced code blocks
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // markdown links -> text
      .replace(/[*_#>`~|-]/g, " ")         // markdown/terminal glyphs
      .replace(/&[a-z]+;/gi, " ")          // HTML entities
      .replace(/\s+/g, " ")
      .trim();
  }

  var VfVoice = {
    isSupported: supported,

    isEnabled: function () {
      try { return localStorage.getItem(STORAGE_KEY) === "1"; }
      catch (e) { return false; }
    },

    setEnabled: function (on) {
      try { localStorage.setItem(STORAGE_KEY, on ? "1" : "0"); } catch (e) {}
      if (!on) VfVoice.stop();
    },

    speak: function (text) {
      if (!supported() || !VfVoice.isEnabled()) return;
      var clean = stripMarkup(text);
      if (!clean) return;
      if (clean.length > MAX_CHARS) clean = clean.slice(0, MAX_CHARS) + "…";
      try {
        window.speechSynthesis.cancel(); // never overlap utterances
        var u = new SpeechSynthesisUtterance(clean);
        var v = pickVoice();
        if (v) u.voice = v;
        u.rate = 1;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
      } catch (e) { /* TTS is best-effort; never break the UI */ }
    },

    stop: function () {
      try { if (supported()) window.speechSynthesis.cancel(); } catch (e) {}
    }
  };

  // Warm up the voice list (Chrome loads voices asynchronously).
  if (supported()) {
    try {
      window.speechSynthesis.getVoices();
      if ("onvoiceschanged" in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = function () {
          try { window.speechSynthesis.getVoices(); } catch (e) {}
        };
      }
    } catch (e) {}
  }

  window.VfVoice = VfVoice;
})();
