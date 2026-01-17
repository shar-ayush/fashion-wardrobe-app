import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const AITryOnScreen = () => {
  const [personImage, setPersonImage] = useState(null);
  const [apparelImage, setApparelImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  //@ts-ignore
  const pickImage = async (setImageState) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your gallery to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [3, 4],     
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageState(result.assets[0].uri);
      setResultImage(null);
    }
  };

  const handleTryOn = async () => {
    if (!personImage || !apparelImage) {
      Alert.alert('Missing Images', 'Please upload both a user image and an outfit image.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      //@ts-ignore
      formData.append('personImage', {
        uri: personImage,
        name: 'person.jpg',
        type: 'image/jpeg',
      });

      //@ts-ignore
      formData.append('apparelImage', {
        uri: apparelImage,
        name: 'apparel.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(`${API_URL}/api/try-on`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 90000, 
      });

      if (response.data.success) {
        setResultImage(response.data.imageUrl);
      } else {
        Alert.alert('Error', 'Virtual try-on failed.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to the server or process image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need permission to save to your gallery.');
        return;
      }

      // 1. Define the file
      const targetFile = new File(Paths.cache, 'tryon_result.jpg');

      // 2. Fetch the image
      const response = await fetch(resultImage);
      const blob = await response.blob();

      // 3. CONVERT Blob -> Uint8Array (The fix)
      // We use the Response constructor hack to quickly get an ArrayBuffer from the Blob
      const buffer = await new Response(blob).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // 4. Write the raw bytes to the file
      await targetFile.write(bytes);

      // 5. Save to Gallery
      await MediaLibrary.createAssetAsync(targetFile.uri);
      
      Alert.alert('Success', 'Image saved to your gallery! 🎉');

      // Cleanup
      if (targetFile.exists) {
        targetFile.delete();
      }

    } catch (error) {
      console.error("Save error:", error);
      //@ts-ignore
      Alert.alert('Error', 'Could not save the image. ' + error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 py-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Virtual Fitting Room</Text>
        <View className="flex-row justify-between mb-8">
          {/* Person Image Upload */}
          <View className="w-[48%] items-center">
            <Text className="font-semibold text-gray-600 mb-2">You</Text>
            <TouchableOpacity 
              onPress={() => pickImage(setPersonImage)}
              className="w-full h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 justify-center items-center overflow-hidden"
            >
              {personImage ? (
                <Image source={{ uri: personImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-gray-400 text-center px-2">Tap to Upload Photo</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Apparel Image Upload */}
          <View className="w-[48%] items-center">
            <Text className="font-semibold text-gray-600 mb-2">Outfit</Text>
            <TouchableOpacity 
              onPress={() => pickImage(setApparelImage)}
              className="w-full h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 justify-center items-center overflow-hidden"
            >
              {apparelImage ? (
                <Image source={{ uri: apparelImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-gray-400 text-center px-2">Tap to Upload Outfit</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>

        <TouchableOpacity 
          onPress={handleTryOn}
          disabled={loading}
          className={`w-full py-4 rounded-xl mb-8 items-center ${loading ? 'bg-gray-800' : 'bg-black shadow-lg shadow-gray-200'}`}
        >
          {loading ? (
            <Text>Generating Image...</Text>
          ) : (
            <Text className="text-white font-bold text-lg">Try It On ✨</Text>
          )}
        </TouchableOpacity>

        {resultImage && (
          <View className="items-center mb-10">
            <View className="w-full h-[1px] bg-gray-200 mb-6" />
            <Text className="text-xl font-bold text-gray-800 mb-4">Your Look</Text>
            
            <View className="w-full h-80 rounded-2xl overflow-hidden shadow-sm bg-gray-50 mb-4">
              <Image 
                source={{ uri: resultImage }} 
                className="w-full h-full" 
                resizeMode="contain" 
              />
            </View>

            <TouchableOpacity 
              onPress={handleDownload}
              className="flex-row items-center bg-gray-900 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Save to Gallery ⬇</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default AITryOnScreen;