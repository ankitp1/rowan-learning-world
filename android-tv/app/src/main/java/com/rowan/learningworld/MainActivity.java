package com.rowan.learningworld;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends Activity {
    private static final String LIVE_URL = "https://rowan-learning-world-ap1.web.app/?tv=1";
    private static final String LOCAL_FALLBACK_URL = "file:///android_asset/index.html";
    private static final int REQ_RECORD_AUDIO = 1001;
    private static final int REQ_VOICE_INTENT = 1002;

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private SpeechRecognizer speechRecognizer;
    private boolean pendingVoiceStart = false;

    public class TtsBridge {
        @JavascriptInterface
        public boolean isReady() {
            return ttsReady && tts != null;
        }

        @JavascriptInterface
        public void speak(String text, float rate, float pitch, boolean flush) {
            if (tts == null || !ttsReady || text == null || text.trim().isEmpty()) return;
            try {
                // Pitch shifting on Android TTS engine triggers metallic phase-vocoder distortion.
                // Keeping pitch close to natural 1.0f produces clean, human-like voice synthesis.
                tts.setSpeechRate(Math.max(0.75f, Math.min(1.3f, rate)));
                tts.setPitch(Math.max(0.96f, Math.min(1.06f, pitch)));
                int queueMode = flush ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD;
                Bundle params = new Bundle();
                params.putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, AudioManager.STREAM_MUSIC);
                params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
                tts.speak(text, queueMode, params, UUID.randomUUID().toString());
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null && ttsReady) {
                try {
                    tts.stop();
                } catch (Exception ignored) {
                }
            }
        }
    }

    public class SttBridge {
        @JavascriptInterface
        public boolean isAvailable() {
            return true;
        }

        @JavascriptInterface
        public void startListening() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    startNativeVoiceListening();
                }
            });
        }

        @JavascriptInterface
        public void stopListening() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (speechRecognizer != null) {
                        try {
                            speechRecognizer.stopListening();
                        } catch (Exception ignored) {
                        }
                    }
                    sendVoiceStateToJs("idle", "");
                }
            });
        }
    }

    private void sendVoiceResultToJs(final String transcript, final boolean isFinal) {
        if (webView == null || transcript == null) return;
        final String escaped = transcript.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ");
        webView.post(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(
                        "if(window.__rlwOnVoiceResult){window.__rlwOnVoiceResult('" + escaped + "'," + (isFinal ? "true" : "false") + ");}",
                        null
                );
            }
        });
    }

    private void sendVoiceStateToJs(final String state, final String err) {
        if (webView == null) return;
        final String escapedErr = (err == null ? "" : err).replace("\\", "\\\\").replace("'", "\\'");
        webView.post(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(
                        "if(window.__rlwOnVoiceState){window.__rlwOnVoiceState('" + state + "','" + escapedErr + "');}",
                        null
                );
            }
        });
    }

    private void startNativeVoiceListening() {
        if (tts != null && ttsReady) {
            try {
                tts.stop();
            } catch (Exception ignored) {
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                pendingVoiceStart = true;
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_RECORD_AUDIO);
                return;
            }
        }
        try {
            if (SpeechRecognizer.isRecognitionAvailable(this)) {
                if (speechRecognizer == null) {
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
                    speechRecognizer.setRecognitionListener(new RecognitionListener() {
                        @Override
                        public void onReadyForSpeech(Bundle params) {
                            sendVoiceStateToJs("listening", "");
                        }

                        @Override
                        public void onBeginningOfSpeech() {
                        }

                        @Override
                        public void onRmsChanged(float rmsdB) {
                        }

                        @Override
                        public void onBufferReceived(byte[] buffer) {
                        }

                        @Override
                        public void onEndOfSpeech() {
                        }

                        @Override
                        public void onError(int error) {
                            // Fall back to system RecognizerIntent dialog if direct SpeechRecognizer fails on TV
                            if (error == SpeechRecognizer.ERROR_CLIENT || error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
                                launchVoiceIntentDialog();
                            } else {
                                sendVoiceStateToJs("idle", "error_" + error);
                            }
                        }

                        @Override
                        public void onResults(Bundle results) {
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                sendVoiceResultToJs(matches.get(0), true);
                            } else {
                                sendVoiceStateToJs("idle", "");
                            }
                        }

                        @Override
                        public void onPartialResults(Bundle partialResults) {
                            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                sendVoiceResultToJs(matches.get(0), false);
                            }
                        }

                        @Override
                        public void onEvent(int eventType, Bundle params) {
                        }
                    });
                }
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US.toString());
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                sendVoiceStateToJs("listening", "");
                speechRecognizer.startListening(intent);
                return;
            }
        } catch (Exception ignored) {
        }
        launchVoiceIntentDialog();
    }

    private void launchVoiceIntentDialog() {
        try {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.US.toString());
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Say your answer or command!");
            sendVoiceStateToJs("listening", "");
            startActivityForResult(intent, REQ_VOICE_INTENT);
        } catch (Exception e) {
            sendVoiceStateToJs("error", "Mic unavailable");
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_RECORD_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED && pendingVoiceStart) {
                pendingVoiceStart = false;
                startNativeVoiceListening();
            } else {
                pendingVoiceStart = false;
                launchVoiceIntentDialog();
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_VOICE_INTENT) {
            if (resultCode == RESULT_OK && data != null) {
                ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matches != null && !matches.isEmpty()) {
                    sendVoiceResultToJs(matches.get(0), true);
                    return;
                }
            }
            sendVoiceStateToJs("idle", "");
        }
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUI();

        // Initialize native Android Text-to-Speech (com.google.android.tts on Chromecast)
        tts = new TextToSpeech(getApplicationContext(), new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status == TextToSpeech.SUCCESS && tts != null) {
                    tts.setLanguage(Locale.US);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        try {
                            Set<Voice> voices = tts.getVoices();
                            if (voices != null) {
                                Voice bestVoice = null;
                                for (Voice v : voices) {
                                    if (v.getLocale() != null && Locale.US.getLanguage().equalsIgnoreCase(v.getLocale().getLanguage())) {
                                        if (bestVoice == null || v.getQuality() > bestVoice.getQuality()) {
                                            bestVoice = v;
                                        }
                                    }
                                }
                                if (bestVoice != null) {
                                    tts.setVoice(bestVoice);
                                }
                            }
                        } catch (Exception ignored) {
                        }
                    }
                    AudioAttributes attrs = new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build();
                    tts.setAudioAttributes(attrs);
                    ttsReady = true;
                }
            }
        }, "com.google.android.tts");

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0d1b2a"));
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        String ua = settings.getUserAgentString();
        settings.setUserAgentString(ua + " RowanAndroidTV/1.2 CrKey");

        webView.addJavascriptInterface(new TtsBridge(), "AndroidTTS");
        webView.addJavascriptInterface(new SttBridge(), "AndroidSTT");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame() && !LOCAL_FALLBACK_URL.equals(view.getUrl())) {
                    view.loadUrl(LOCAL_FALLBACK_URL);
                }
            }
        });

        setContentView(webView);
        webView.requestFocus();

        if (isNetworkAvailable()) {
            webView.loadUrl(LIVE_URL);
        } else {
            webView.loadUrl(LOCAL_FALLBACK_URL);
        }
    }

    @Override
    protected void onDestroy() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {
            }
        }
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception ignored) {
            }
        }
        super.onDestroy();
    }

    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            if (cm == null) return true;
            NetworkInfo info = cm.getActiveNetworkInfo();
            return info != null && info.isConnected();
        } catch (Exception e) {
            return true;
        }
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        if (code == KeyEvent.KEYCODE_SEARCH || code == KeyEvent.KEYCODE_VOICE_ASSIST) {
            if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
                startNativeVoiceListening();
            }
            return true;
        }
        if (code == KeyEvent.KEYCODE_BACK) {
            if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0 && webView != null) {
                webView.evaluateJavascript(
                        "(function(){ return (window.__rlwBack && window.__rlwBack()) ? 'handled' : 'none'; })()",
                        new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {
                                if (value == null || !value.contains("handled")) {
                                    if (webView.canGoBack()) {
                                        webView.goBack();
                                    } else {
                                        finish();
                                    }
                                }
                            }
                        }
                );
            }
            return true;
        }
        return super.dispatchKeyEvent(event);
    }
}
