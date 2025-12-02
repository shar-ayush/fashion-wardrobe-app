import { ActivityIndicator, Alert, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
const API_BASE_URL = "http://10.0.2.2:3000";

interface ClothingItem {
  id: number;
  image: string;
  x: number;
  y: number;
  type?: "pants" | "shoes" | "shirt" | "skirts" | "tops" | "mshirts";
  gender?: "m" | "f" | "unisex";
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

  const convertToBase64 = async (image:string) => {
    return image; // use URL directly
  }

  const handleSave = async() => {
    if(!userId) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    setLoading(true);
    try {
      const validateItems = await Promise.all(selectedItems.map(async (item) => {
        const base64Image = await convertToBase64(item.image);
        return {
          id: item.id,
          type: item.type || "Unknown",
          image: base64Image,
          x: item.x || 0,
          y: item.y || 0,
        }
      }))

      const validItems = validateItems.filter((item) => item !== null);
      if(validItems.length === 0) {
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

      const updatedOutfits = {...savedOutfits, [date]: response.data.outfit.items };
      navigation.reset({
        index: 0,
        //@ts-ignore
        routes: [{ name: 'Tabs', params: { screen: "Home", params: { savedOutfits: updatedOutfits } } }],
      })

    } catch (error) {
      console.log("Error saving outfit:", error);
      Alert.alert("Error", "Failed to save outfit.");
    } finally{
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-row justify-between items-center'>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className='text-black'>Back</Text>
        </TouchableOpacity>
        <Text className='text-lg font-semibold'>New Outfit</Text>
      </View>

      <View className='flex-1 items-center justify-center'>
        {selectedItems?.sort((a, b) => {
          const order = { "shirt": 1, "tops": 1, "mshirts": 1, "pants": 2, "skirts": 2, "shoes": 3 };
          return (order[a.type || "shirt"] || 0) - (order[b.type || "shirt"] || 0);
        })
          .map((item, index) => (
            <Image
              resizeMode='contain'
              key={index}
              source={{ uri: item?.image }}
              style={{
                width: 240,
                height: item?.type === 'shoes' ? 180 : 240,
                marginBottom: index - (selectedItems.length - 1) ? -60 : 0
              }}
            />
          )
          )}
      </View>

      <View className='p-4'>
        <TextInput
          className='border-b border-gray-300 pb-2 text-gray-500'
          placeholder='Add a Caption...'
          value={caption}
          onChangeText={setCaption}
        />

        <View className='mt-4'>
          <View className='flex-row items-center justify-between'>
            <Text className='text-gray-500'>Date</Text>
            <Text className='text-black'>{date || "Today"}</Text>
          </View>

          <View className='flex-row items-center justify-between mt-2'>
            <Text className='text-gray-500'>Add to OOTD Story</Text>
            <Switch value={isOotd} onValueChange={setIsOotd} />
          </View>

          <View className='flex-row items-center justify-between mt-2'>
            <Text className='text-gray-500'>Occasion</Text>
            <Text className='text-black'>{occasion}</Text>
          </View>

          <View className='flex-row items-center justify-between mt-2'>
            <Text className='text-gray-500'>Visibility</Text>
            <Text className='text-black'>{visibility}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
      className='bg-black py-3 mx-4 mb-4 rounded' onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className='text-white text-center font-semibold'>Save Outfit</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default NewOutfitScreen

const styles = StyleSheet.create({})