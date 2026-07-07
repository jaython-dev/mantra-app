const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt');

if (!fs.existsSync(targetFile)) {
  console.log("react-native-track-player's MusicModule.kt was not found. Skipping patch.");
  process.exit(0);
}

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Patch JNI Coroutine Job Return Type Issue by changing `= scope.launch {` to `{ scope.launch {`
const regexSearch = /(@ReactMethod\s+(?:@[^\s]+\s+)*fun\s+\w+\([^)]*\)\s*)=\s*(scope\.launch\s*\{)/;
let patchedCount = 0;

while (true) {
  const match = regexSearch.exec(content);
  if (!match) {
    break;
  }

  const matchIndex = match.index;
  const funHeader = match[1]; // "fun method(...)"
  
  // We want to replace "=" with "{"
  const equalCharIndex = matchIndex + funHeader.length;
  
  // Find the closing brace of the launch block
  const launchBlockStartIndex = content.indexOf('{', equalCharIndex);
  if (launchBlockStartIndex === -1) {
    break;
  }
  
  // Balance braces to find the matching closing brace
  let braceCount = 1;
  let index = launchBlockStartIndex + 1;
  while (braceCount > 0 && index < content.length) {
    if (content[index] === '{') {
      braceCount++;
    } else if (content[index] === '}') {
      braceCount--;
    }
    index++;
  }
  
  if (braceCount !== 0) {
    break;
  }
  
  const launchBlockEndIndex = index; // character index just after matching '}'
  
  // Replace "=" with "{" and append "}" at the end of the block
  const before = content.slice(0, equalCharIndex);
  const rest = content.slice(equalCharIndex + 1); // skip the "="
  const relativeEndIndex = launchBlockEndIndex - (equalCharIndex + 1);
  const modifiedRest = '{' + rest.slice(0, relativeEndIndex) + ' }' + rest.slice(relativeEndIndex);
  
  content = before + modifiedRest;
  patchedCount++;
}

// 2. Patch JNI/Kotlin Stricter Null Safety for Arguments.fromBundle
// Replacing `musicService.tracks[index].originalItem` -> `musicService.tracks[index].originalItem ?: Bundle()`
const originalItemRegex = /Arguments\.fromBundle\(\s*musicService\.tracks\[index\]\.originalItem\s*\)/g;
content = content.replace(originalItemRegex, 'Arguments.fromBundle(musicService.tracks[index].originalItem ?: Bundle())');

// Replacing `musicService.tracks[musicService.getCurrentTrackIndex()].originalItem` -> `musicService.tracks[musicService.getCurrentTrackIndex()].originalItem ?: Bundle()`
const activeItemRegex = /Arguments\.fromBundle\(\s*musicService\.tracks\[musicService\.getCurrentTrackIndex\(\)\]\.originalItem\s*\)/g;
content = content.replace(activeItemRegex, 'Arguments.fromBundle(musicService.tracks[musicService.getCurrentTrackIndex()].originalItem ?: Bundle())');

if (patchedCount > 0 || content.includes('?: Bundle()')) {
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`Successfully patched ${patchedCount} JNI signatures & corrected nullability in react-native-track-player.`);
} else {
  console.log("react-native-track-player is already patched.");
}

// 3. Patch TurboModuleRegistry lookup for TrackPlayerModule under New Architecture
const filesToPatch = [
  path.join(__dirname, '../node_modules/react-native-track-player/src/TrackPlayerModule.ts'),
  path.join(__dirname, '../node_modules/react-native-track-player/lib/src/TrackPlayerModule.js')
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file)) {
    let jsContent = fs.readFileSync(file, 'utf8');
    if (!jsContent.includes('TurboModuleRegistry')) {
      jsContent = jsContent.replace(
        "import { NativeModules } from 'react-native';",
        "import { NativeModules, TurboModuleRegistry } from 'react-native';"
      );
      jsContent = jsContent.replace(
        "const { TrackPlayerModule } = NativeModules;",
        "const TrackPlayerModule = NativeModules.TrackPlayerModule || (typeof TurboModuleRegistry !== 'undefined' ? TurboModuleRegistry.get('TrackPlayerModule') : null);"
      );
      fs.writeFileSync(file, jsContent, 'utf8');
      console.log(`Successfully patched TurboModuleRegistry lookup in ${file}`);
    }
  }
});

// 4. Patch ForegroundServiceStartNotAllowedException & ReactNativeHost direct usage in MusicService.kt
const serviceFile = path.join(__dirname, '../node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/service/MusicService.kt');
if (fs.existsSync(serviceFile)) {
  let serviceContent = fs.readFileSync(serviceFile, 'utf8');

  // Add try-catch to startForeground
  if (!serviceContent.includes('catch (e: Exception)')) {
    serviceContent = serviceContent.replace(
      `        val notification = notificationBuilder.build()
        startForeground(EMPTY_NOTIFICATION_ID, notification)
        @Suppress("DEPRECATION")
        stopForeground(true)`,
      `        val notification = notificationBuilder.build()
        try {
            startForeground(EMPTY_NOTIFICATION_ID, notification)
            @Suppress("DEPRECATION")
            stopForeground(true)
        } catch (e: Exception) {
            Timber.e(e, "Failed to start empty foreground service to avoid ANR")
        }`
    );
  }

  // Add imports for New Architecture ReactHost/ReactApplication
  if (!serviceContent.includes('import com.facebook.react.ReactHost')) {
    serviceContent = serviceContent.replace(
      `import com.facebook.react.HeadlessJsTaskService`,
      `import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.ReactHost
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext`
    );
  }

  // Replace ReactNativeHost calls in emit/emitList with safe ReactHost lookup
  if (!serviceContent.includes('private val currentReactContext: ReactContext?')) {
    serviceContent = serviceContent.replace(
      `    @MainThread
    private fun emit(event: String, data: Bundle? = null) {
        reactNativeHost.reactInstanceManager.currentReactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(event, data?.let { Arguments.fromBundle(it) })
    }

    @MainThread
    private fun emitList(event: String, data: List<Bundle> = emptyList()) {
        val payload = Arguments.createArray()
        data.forEach { payload.pushMap(Arguments.fromBundle(it)) }

        reactNativeHost.reactInstanceManager.currentReactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(event, payload)
    }`,
      `    private val currentReactContext: ReactContext?
        get() {
            return try {
                (application as ReactApplication).reactHost?.currentReactContext
            } catch (e: Throwable) {
                try {
                    reactNativeHost.reactInstanceManager.currentReactContext
                } catch (e2: Throwable) {
                    null
                }
            }
        }

    @MainThread
    private fun emit(event: String, data: Bundle? = null) {
        currentReactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(event, data?.let { Arguments.fromBundle(it) })
    }

    @MainThread
    private fun emitList(event: String, data: List<Bundle> = emptyList()) {
        val payload = Arguments.createArray()
        data.forEach { payload.pushMap(Arguments.fromBundle(it)) }

        currentReactContext
            ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(event, payload)
    }`
    );
  }

  fs.writeFileSync(serviceFile, serviceContent, 'utf8');
  console.log("Successfully patched MusicService.kt to handle ReactNativeHost restrictions under New Architecture.");
}
