import { ActivityIndicator, Alert, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

interface ClothingItem {
  id: string;
  image: string;
  x: number;
  y: number;
  type?: "top" | "bottom" | "footwear" | "outerwear" | "accessory";
  gender?: "male" | "female" | "unisex";
}


const NewOutfitScreen = () => {
  const route = useRoute();
  const { selectedItems, date, savedOutfits } = route.params as {
    selectedItems: ClothingItem[],
    date: string,
    savedOutfits: { [key: string]: any },
  };

  const navigation = useNavigation();
  const [caption, setCaption] = useState<string>("");
  const [isOotd, setIsOotd] = useState<boolean>(false);
  const [occasion, setOccasion] = useState<string>("Work");
  const [loading, setLoading] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<string>("Everyone");
  // const [weather, setWeather] = useState<string>("Sunny");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token) as { id: string };
          // @ts-ignore
          setUserId(decoded.id);
        } else {
          Alert.alert("Error", "User token not found.");
        }

      } catch (error) {
        console.log("Failed to fetch token:", error);
        Alert.alert("Error", "Failed to fetch user token.");
      }
    }
    fetchToken();
  }, []);

  const convertToBase64 = async (image: string) => {
    return image; // use URL directly
  }

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    setLoading(true);
    try {
      const validItems = selectedItems.map((item) => ({
        id: item.id,
        type: item.type || "Unknown",
        image: item.image, // Cloudinary URL
        x: item.x || 0,
        y: item.y || 0,
      }));

      if (validItems.length === 0) {
        throw new Error("No valid clothing items to save.");
      }

      const outfitData = {
        userId,
        items: validItems,
        date,
        caption,
        occasion,
        isOotd,
        visibility,
      };

      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(`${API_BASE_URL}/api/save-outfit`, outfitData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      const updatedOutfits = { ...savedOutfits, [date]: response.data.outfit.items };

      // Reset navigation stack to Home
      navigation.reset({
        index: 0,
        //@ts-ignore
        routes: [{ name: 'Tabs', params: { screen: "Home", params: { savedOutfits: updatedOutfits } } }],
      })

    } catch (error) {
      console.log("Error saving outfit:", error);
      Alert.alert("Error", "Failed to save outfit.");
    } finally {
      setLoading(false);
    }
  }

  // Updated Sorting Logic for Visual Stack
  // 1. Tops (Top)
  // 2. Bottoms (Middle)
  // 3. Shoes (Bottom)
  const getSortOrder = (type: string = "") => {
    if (["top", "outerwear"].includes(type)) return 1;
    if (type === "bottom") return 2;
    if (type === "footwear") return 3;
    if (type === "accessory") return 4;
    return 5;
  };

  return (
    <SafeAreaView className='flex-1 bg-ivory'>

      {/* Header */}
      <View className='flex-row justify-between items-center px-4 py-2'>
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="#3d2f20" />
          <Text className='text-espresso text-lg ml-1'>Back</Text>
        </TouchableOpacity>

        <Text className='text-lg font-bold text-espresso'>
          New Outfit
        </Text>

        <View style={{ width: 50 }} />
      </View>

      {/* Visual Preview Stack */}
      <View className='flex-1 items-center justify-center bg-cream m-4 rounded-xl border border-sand'>
        {selectedItems && [...selectedItems]
          .sort((a, b) => getSortOrder(a.type) - getSortOrder(b.type))
          .map((item, index) => (
            <Image
              resizeMode='contain'
              key={index}
              source={{ uri: item?.image }}
              style={{
                width: 220,
                height: item?.type === 'footwear' ? 160 : 220,
                marginTop: index === 0 ? 0 : -60,
                zIndex: selectedItems.length - index
              }}
            />
          ))
        }
      </View>

      {/* Input Form */}
      <View className='px-6'>
        <TextInput
          className='border-b border-sand pb-3 text-base text-espresso mb-6'
          placeholder='Write a caption...'
          placeholderTextColor="#a89880"
          value={caption}
          onChangeText={setCaption}
        />

        <View className='space-y-4'>

          <View className='flex-row items-center justify-between py-2 border-b border-sand'>
            <Text className='text-taupe text-base'>Date</Text>
            <Text className='text-espresso font-medium'>
              {date || "Today"}
            </Text>
          </View>

          <View className='flex-row items-center justify-between py-2 border-b border-sand'>
            <Text className='text-taupe text-base'>Add to OOTD Story</Text>
            <Switch
              value={isOotd}
              onValueChange={setIsOotd}
              trackColor={{ false: "#e8ddd0", true: "#3d2f20" }}
            />
          </View>

          <View className='flex-row items-center justify-between py-2 border-b border-sand'>
            <Text className='text-taupe text-base'>Occasion</Text>
            <Text className='text-espresso font-medium'>{occasion}</Text>
          </View>

          <View className='flex-row items-center justify-between py-2'>
            <Text className='text-taupe text-base'>Visibility</Text>
            <Text className='text-espresso font-medium'>{visibility}</Text>
          </View>

        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        className='bg-espresso py-4 mx-6 mb-2 rounded-xl mt-4'
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#faf7f2" />
        ) : (
          <Text className='text-ivory text-center font-bold text-lg'>
            Save Outfit
          </Text>
        )}
      </TouchableOpacity>

    </SafeAreaView>
  )
}

export default NewOutfitScreen

const styles = StyleSheet.create({})