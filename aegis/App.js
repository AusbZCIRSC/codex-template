import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, StatusBar, ToastAndroid, Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import './global.css';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [inputText, setInputText] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intelItems, setIntelItems] = useState([]);
  const [partialResult, setPartialResult] = useState('');

  const restartTimerRef = useRef(null);
  const apiKeyRef = useRef('');
  const isListeningRef = useRef(false);

  const radarOpacity = useSharedValue(1);

  useEffect(() => {
    apiKeyRef.current = apiKey;
  }, [apiKey]);

  useEffect(() => {
    isListeningRef.current = isListening;

    if (isListening) {
      radarOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1, // infinite
        true
      );
    } else {
      radarOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isListening]);

  const radarStyle = useAnimatedStyle(() => {
    return {
      opacity: radarOpacity.value,
    };
  });

  useEffect(() => {
    requestPermissions();
    loadApiKey();

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  const onSpeechStart = (e) => {
    setIsListening(true);
  };

  const onSpeechEnd = (e) => {
    // Continue listening if explicitly toggled on
    if (isListeningRef.current) {
      restartTimerRef.current = setTimeout(() => {
        startListening();
      }, 500);
    }
  };

  const onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    // 7 means no match, 6 means speech timeout, 8 means busy
    if (e.error && (e.error.code === '7' || e.error.code === '6' || e.error.code === '8')) {
      if (isListeningRef.current) {
         restartTimerRef.current = setTimeout(() => {
            startListening();
         }, 500);
      }
    } else {
        if (Platform.OS === 'android') {
            ToastAndroid.show(`Voice Error: ${e.error.message}`, ToastAndroid.SHORT);
        }
        setIsListening(false);
    }
  };

  const onSpeechResults = (e) => {
    if (e.value && e.value.length > 0) {
      const text = e.value[0];
      processTextWithLLM(text);
      setPartialResult('');
    }
    // Will restart from onSpeechEnd
  };

  const onSpeechPartialResults = (e) => {
    if (e.value && e.value.length > 0) {
      setPartialResult(e.value[0]);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          Alert.alert(
            "Permissions Required",
            "Aegis requires microphone access to extract intel.",
            [{ text: "OK" }]
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const startListening = async () => {
    try {
      // Re-check permissions before starting just in case
      if (Platform.OS === 'android') {
        const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (!check) {
          await requestPermissions();
          const reCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          if (!reCheck) return;
        }
      }
      await Voice.start('de-DE');
      setIsListening(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Voice Error", "Microphone access or recognition service failed.");
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const processTextWithLLM = async (text) => {
    if (!text.trim() || text.length < 5) return; // Ignore very short/empty strings

    setIsProcessing(true);
    try {
      const systemPrompt = `Du bist ein System zur Extraktion und Überprüfung von Geheimdienstinformationen.
Eingabe: Ein roher, fehlerhafter Transkript-Text gesprochener Sprache.
Aufgabe:
1. Filtere Füllwörter, Smalltalk und unbedeutende Aussagen heraus.
2. Extrahiere konkrete Behauptungen (Claims) aus dem Text. (Wenn nur "Hallo" kommt, gib [] zurück).
3. Überprüfe jede extrahierte Behauptung.
4. Bestimme den Wahrheitsgehalt ("truth_status"): "TRUE" (korrekt), "FALSE" (falsch), "UNVERIFIABLE" (nicht überprüfbar, Meinung, Prognose).
5. Prüfe auf inhaltliche Warnungen ("content_flag"):
   - "HARMFUL": Aufrufe zu Gewalt, Selbstverletzung, Illegales, extreme Gefährdung.
   - "DELUSIONAL": Wahnhaft, völlig realitätsfremd, absurde und grundlose Verschwörungstheorien.
   - "POLITICAL": Erwähnung von Politik, Wahlen, Regierungen, Parteien, Ideologien.
   - "NONE": Keine dieser Kategorien trifft zu.
6. Gib einen sehr kurzen, kompakten Kontext (1 Satz) zur Erklärung/Korrektur.

Antworte AUSSCHLIESSLICH mit gültigem JSON nach folgendem Schema:
{
  "claims": [
    {
      "claim": "Die extrahierte Behauptung",
      "truth_status": "TRUE|FALSE|UNVERIFIABLE",
      "content_flag": "NONE|HARMFUL|DELUSIONAL|POLITICAL",
      "context": "Kurze Begründung."
    }
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeyRef.current}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{
            parts: [{ text: text }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (err) {
         // Sometimes it wraps in markdown blocks
         const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
         parsedData = JSON.parse(cleaned);
      }

      if (parsedData && parsedData.claims && parsedData.claims.length > 0) {
        const newItems = parsedData.claims.map(claim => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...claim
        }));
        setIntelItems(prev => [...newItems, ...prev]);
      }

    } catch (error) {
      console.error('LLM Processing Error:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show("Data link error", ToastAndroid.SHORT);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const loadApiKey = async () => {
    try {
      const storedKey = await AsyncStorage.getItem('@gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
        apiKeyRef.current = storedKey;
        setIsKeyValid(true);
      }
    } catch (e) {
      console.error('Failed to load API key', e);
    }
  };

  const saveApiKey = async () => {
    if (inputText.trim().length < 20) {
      Alert.alert("Error", "Please enter a valid Gemini API Key.");
      return;
    }
    try {
      await AsyncStorage.setItem('@gemini_api_key', inputText.trim());
      setApiKey(inputText.trim());
      apiKeyRef.current = inputText.trim();
      setIsKeyValid(true);
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  };

  const clearApiKey = async () => {
    try {
      await AsyncStorage.removeItem('@gemini_api_key');
      setApiKey('');
      apiKeyRef.current = '';
      setIsKeyValid(false);
      setInputText('');
    } catch (e) {
      console.error('Failed to clear API key', e);
    }
  };

  if (!isKeyValid) {
    return (
      <SafeAreaView className="flex-1 bg-[#030305] justify-center items-center p-5">
        <StatusBar barStyle="light-content" backgroundColor="#030305" />
        <View className="w-full max-w-[400px] bg-[rgba(20,20,25,0.9)] p-6 rounded-lg border border-[#333]">
          <Text className="text-white text-xl font-bold mb-2 text-center font-mono">SYSTEM CALIBRATION</Text>
          <Text className="text-[#a1a1aa] text-sm mb-6 text-center">Enter Gemini API Key to initialize Aegis.</Text>
          <TextInput
            className="bg-[#0f0f13] text-white p-3 rounded-md border border-[#27272a] mb-4 font-mono"
            placeholder="AIzaSy..."
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
            secureTextEntry
          />
          <TouchableOpacity className="bg-blue-600 p-[14px] rounded-md items-center" onPress={saveApiKey}>
            <Text className="text-white font-bold font-mono">INITIALIZE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    let borderColor = 'border-slate-500'; // UNVERIFIABLE
    if (item.truth_status === 'TRUE') borderColor = 'border-emerald-500';
    if (item.truth_status === 'FALSE') borderColor = 'border-amber-500';

    let flagColor = null;
    if (item.content_flag === 'HARMFUL') flagColor = 'bg-red-500';
    if (item.content_flag === 'DELUSIONAL') flagColor = 'bg-fuchsia-500';
    if (item.content_flag === 'POLITICAL') flagColor = 'bg-sky-500';

    return (
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        className={`bg-[rgba(20,20,25,0.9)] p-4 rounded-lg border border-[#333] border-l-[4px] relative ${borderColor}`}
      >
        {flagColor && item.content_flag !== 'NONE' && (
          <View className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-xl border border-white/20 ${flagColor}`}>
            <Text className="text-white text-[10px] font-bold font-mono">{item.content_flag}</Text>
          </View>
        )}
        <Text className="text-white text-base font-medium mb-2 mt-1">{item.claim}</Text>
        <Text className="text-slate-400 text-[13px] pl-3 border-l border-slate-600">{item.context}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#030305]">
      <StatusBar barStyle="light-content" backgroundColor="#030305" />

      <View className="flex-row justify-between items-center p-4 border-b border-[#333] bg-[rgba(20,20,25,0.9)]">
        <View className="flex-row items-center">
          <Text className="text-white text-lg font-bold font-mono mr-2">AEGIS INTEL</Text>
          {isListening && (
            <Animated.View style={radarStyle}>
               <Feather name="radio" size={16} color="#10b981" className="mt-0.5" />
            </Animated.View>
          )}
        </View>

        <View className="flex-row items-center gap-4">
           <Text className="text-slate-500 text-xs font-mono">{intelItems.length} ITEMS</Text>
           <TouchableOpacity onPress={clearApiKey}>
             <Text className="text-red-500 text-xs font-mono">CLR KEY</Text>
           </TouchableOpacity>
        </View>
      </View>

      <View className="p-4 flex-row items-center justify-between border-b border-zinc-800">
        <TouchableOpacity
          className={`flex-row items-center py-2.5 px-4 rounded-lg gap-2 ${isListening ? 'bg-red-500' : 'bg-zinc-700'}`}
          onPress={toggleListening}
        >
          <Feather name={isListening ? "mic" : "mic-off"} size={20} color="#fff" />
          <Text className="text-white font-bold font-mono text-sm">
            {isListening ? "TERMINATE SCAN" : "INITIATE SCAN"}
          </Text>
        </TouchableOpacity>

        {isProcessing && (
          <View className="bg-amber-400 px-2 py-1 rounded">
             <Text className="text-black text-[10px] font-bold font-mono">PROCESSING...</Text>
          </View>
        )}
      </View>

      {partialResult.length > 0 && isListening && (
        <View className="p-4 bg-[rgba(20,20,25,0.5)] border-b border-[#333]">
          <Text className="text-zinc-400 italic">"{partialResult}"</Text>
        </View>
      )}

      <FlatList
        data={intelItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Text className="text-slate-500 font-mono">NO INTEL ACQUIRED</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}