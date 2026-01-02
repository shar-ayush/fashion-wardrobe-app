import React, { useState } from 'react';
import { View, Text, Button, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function UploadOutfitScreen() {
  const { user } = useAuthStore();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Selection States
  const [gender, setGender] = useState('female');
  const [category, setCategory] = useState(null);

  const categories = {
    female: ['tops', 'skirts', 'pants'],
    male: ['mshirts', 'mpants'],
    unisex: ['shoes']
  };

  // 1. Pick Image
  const pickImage = async (useCamera = false) => {
    let result;
    if (useCamera) {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
    } else {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true });
    }

    if (!result.canceled) {
      //@ts-ignore
      setImage(result.assets[0].uri);
    }
  };

  // 2. Upload to Backend
  const handleUpload = async () => {
    if (!image || !category) {
      Alert.alert("Missing Info", "Please select an image and a category.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Append Image
    //@ts-ignore
    const filename = image.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    //@ts-ignore
    formData.append('image', { uri: image, name: filename, type });
    formData.append('category', category);
    formData.append('gender', gender);
    formData.append('userId', user._id);

    try {
      // ✅ UPDATE: Point to your backend route
      const response = await fetch('http://10.12.71.97:3000/api/upload-to-closet', {
        method: 'POST',
        body: formData,
        // Let fetch handle the Content-Type boundary for FormData
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server Error: ${text}`);
      }
      
      if (response.ok && data.success) {
        Alert.alert("Success", "Outfit added to your closet!", [
          { text: "OK", onPress: () => handleReset() } // Reset form on OK
        ]);
      } else {
        Alert.alert("Error", data.error || "Upload failed.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setImage(null);
    setCategory(null);
  };

  return (
    <ScrollView 
      className="flex-1 bg-white "
      contentContainerClassName="p-5 items-center mt-8 pb-10" 
    >
      <Text className="text-2xl font-bold mt-5 mb-5 text-black">
        Add New Outfit
      </Text>

      {/* Image Preview Area */}
      <View className="w-[250px] h-[250px] bg-gray-100 justify-center items-center mb-5 rounded-xl overflow-hidden border border-gray-200">
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full rounded-xl" resizeMode="cover" />
        ) : (
          <Text className="text-gray-400 font-medium">No image selected</Text>
        )}
      </View>

      {/* Inputs - Camera/Gallery Buttons */}
      <View className="flex-row mb-5 items-center justify-around space-x-4">
        <TouchableOpacity 
          onPress={() => pickImage(true)}
          className="bg-gray-100 px-6 py-3 rounded-lg flex-row items-center"
        >
          <Ionicons name="camera" size={20} color="black" className="mr-2" />
          <Text className="text-black font-semibold">Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => pickImage(false)}
          className="bg-gray-100 px-6 py-3 rounded-lg flex-row items-center ml-3"
        >
            <Ionicons name="image" size={20} color="black" className="mr-2" />
          <Text className="text-black font-semibold">Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Gender Selection */}
      <Text className="self-start text-base font-semibold mb-3 text-black">
        Who is this for?
      </Text>
      <View className="flex-row mb-5">
        {['female', 'male'].map((g) => (
          <TouchableOpacity 
            key={g} 
            className={`px-4 py-3 border rounded-full mr-3 mb-2 ${
              gender === g 
                ? 'bg-black border-black' 
                : 'bg-transparent border-gray-300'
            }`}
            onPress={() => { setGender(g); setCategory(null); }}
          >
            <Text className={`font-medium ${
              gender === g ? 'text-white' : 'text-gray-800'
            }`}>
              {g.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Selection */}
      <Text className="self-start text-base font-semibold mb-3 text-black">
        Category
      </Text>
      <View className="flex-row mb-8 w-full">
        {/* @ts-ignore */}
        {[...categories[gender], ...categories.unisex].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            className={`px-4 py-3 border rounded-full mr-3 mb-3 ${
              category === cat 
                ? 'bg-black border-black' 
                : 'bg-transparent border-gray-300'
            }`}
            onPress={() => setCategory(cat)}
          >
            <Text className={`font-medium ${
              category === cat ? 'text-white' : 'text-gray-800'
            }`}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upload Button */}
      <View className="w-full mt-2">
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity
            onPress={handleUpload}
            disabled={!image}
            className={`w-full h-15 py-4 rounded-xl items-center justify-center ${
              !image ? "bg-gray-300" : "bg-black"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              Upload to Closet
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}