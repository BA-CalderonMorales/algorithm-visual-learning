# Echo narration

These are AI-generated recordings of the site's original teaching scripts, made
locally with Lemonade, Kokoro (`kokoro-v1`), and the stock `am_echo` voice at 0.98×.
They are not a recording or clone of a person or chat voice.

The app plays these static MP3 files. Students do not need Lemonade, a speech
service, a microphone, an account, or an API key. Voice is optional, begins only
after a user action, and is silent during reverse playback. Captions and a full
transcript remain available without audio.

Scripts: `src/sorting-narration.js`. Generated metadata: `src/narration-clips.json`.
Scene fingerprints prevent out-of-date recordings from playing after a model
change. Run `npm run generate:narration` with local Lemonade on port 13305 after
editing a script or film, then `npm run build` and `npm run test:narration`.
Unchanged clips are reused; content-addressed names avoid stale browser caches.
Neither the build nor the app performs synthesis or reads credentials.

Model source and license information:
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0 model weights),
[Kokoro ONNX](https://github.com/thewh1teagle/kokoro-onnx),
[Lemonade](https://github.com/lemonade-sdk/lemonade).

The generated clips are project media under the repository's MIT license.
