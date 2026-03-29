import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../store/authStore";

// const API_BASE = "http://172.16.211.92:3000";
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

// CLOTH CARD 
//@ts-ignore
function ClothCard({ item, label }) {
  return (
    <View className="flex-row bg-cream border border-sand rounded-2xl mb-3 overflow-hidden">

      <View className="w-9 bg-sand items-center justify-center">
        <Text className="text-[8px] text-taupe font-bold -rotate-90 w-[60px] text-center">
          {label.toUpperCase()}
        </Text>
      </View>

      <View className="w-[100px] h-[110px] bg-sand items-center justify-center">
        {item?.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-[90px] h-[100px]"
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="shirt-outline" size={32} color="#a89880" />
        )}
      </View>

      <View className="flex-1 p-3 justify-center gap-2">
        <Text className="text-espresso text-[13px]">
          {item?.embeddingHint || "Clothing Item"}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {item?.color?.primary && (
            <View className="flex-row items-center bg-sand px-2 py-1 rounded-full gap-1">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color.primary }}
              />
              <Text className="text-taupe text-[10px]">
                {item.color.primary}
              </Text>
            </View>
          )}

          {item?.formality && (
            <View className="bg-sand px-2 py-1 rounded-full">
              <Text className="text-taupe text-[10px]">
                {item.formality}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// RESULT CARD 
//@ts-ignore
function OutfitResultCard({ outfit, onReset }) {
  return (
    <View className="px-5 mt-4">

      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-espresso text-2xl font-extrabold">
            {outfit.outfitName}
          </Text>
          <Text className="text-taupe text-[9px] tracking-[3px] mt-1">
            FROM YOUR WARDROBE
          </Text>
        </View>

        <View className="bg-cream px-3 py-2 rounded-full border border-sand">
          <Text className="text-terracotta font-bold">
            {outfit.compatibilityScore}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-sand mb-5" />

      <ClothCard item={outfit.top} label="Top" />
      <ClothCard item={outfit.bottom} label="Bottom" />
      <ClothCard item={outfit.shoes} label="Shoes" />

      {/* WHY */}
      <View className="bg-cream border border-sand rounded-xl p-4 mt-3">
        <Text className="text-taupe text-[10px] tracking-[2px] mb-1">
          WHY IT WORKS
        </Text>
        <Text className="text-espresso text-sm">
          {outfit.whyItWorks}
        </Text>
      </View>

      {/* TIP */}
      <View className="bg-cream border border-sand rounded-xl p-4 mt-3">
        <Text className="text-terracotta text-[10px] tracking-[2px] mb-1">
          STYLING TIP
        </Text>
        <Text className="text-espresso text-sm">
          {outfit.stylingTip}
        </Text>
      </View>

      {/* RESET */}
      <TouchableOpacity
        onPress={onReset}
        className="bg-espresso rounded-xl py-4 mt-5 items-center"
      >
        <Text className="text-ivory font-bold tracking-[2px]">
          TRY ANOTHER QUERY
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────
export default function OutfitMakerScreen() {
  const { token } = useAuthStore();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setOutfit(null);

    try {
      const res = await fetch(`${API_BASE}/api/outfit-maker/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setOutfit(data.outfit);
    } catch (err) {
      //   setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setOutfit(null);
    setQuery("");
    setError(null);
  }

  return (
    <View className="flex-1 bg-ivory">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5 pt-14">

          {/* HEADER */}
          <Text className="text-taupe text-xs tracking-[4px]">AI POWERED</Text>
          <Text className="text-espresso text-5xl font-extrabold leading-tight mt-2">Outfit{"\n"}Maker</Text>
          <Text className="text-mocha mt-3 text-sm">
            Describe your occasion. We’ll style you.
          </Text>

          {/* INPUT */}
          <View className="flex-row items-center bg-white border border-sand rounded-xl mt-6 px-3 py-1">
            <TextInput
              placeholder="Eg. Suggest an outfit for a date"
              placeholderTextColor="#a89880"
              value={query}
              onChangeText={setQuery}
              className="flex-1 text-espresso"
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={loading}
            className="bg-espresso rounded-xl py-4 mt-3 items-center"
          >
            {loading ? (
              <ActivityIndicator color="#faf7f2" />
            ) : (
              <Text className="text-ivory font-bold tracking-[2px]">
                GENERATE
              </Text>
            )}
          </TouchableOpacity>

          {/* ERROR */}
          {error && (
            <Text className="text-red-400 mt-4 text-center">
              {error}
            </Text>
          )}

          {/* RESULT */}
          {outfit && <OutfitResultCard outfit={outfit} onReset={reset} />}

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}