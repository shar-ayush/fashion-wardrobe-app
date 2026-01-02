import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';
import axios from 'axios';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


const AddOutfitScreen = () => {
    const route  = useRoute();
    const {date, savedOutfits} = route?.params as {date: string, savedOutfits: Record<string, any>};
    const navigation = useNavigation();
    // Auth & State
    const { user } = useAuthStore();
    const [clothes, setClothes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Changed to string[] because MongoDB IDs are strings
    const [selected, setSelected] = useState<string[]>([]);

    // ✅ Fetch Clothes from Backend
    useEffect(() => {
        const fetchClothes = async () => {
            if (!user?._id) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/api/upload-to-closet`, {
                    params: { userId: user._id }
                });

                if (response.data.success) {
                    // Map backend data to match your UI needs
                    const mappedClothes = response.data.data.map((item: any) => ({
                        id: item._id,        // Map _id to id
                        image: item.imageUrl, // Map imageUrl to image
                        type: item.type,
                        gender: item.gender   // 'male' | 'female' | 'unisex'
                    }));
                    setClothes(mappedClothes);
                }
            } catch (error) {
                console.log("Error fetching clothes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClothes();
    }, [user?._id]);

    const toggleSelect = (id: string) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    }

    const handleNext = () => {
        // Filter from the fetched 'clothes' state instead of 'popularClothes'
        const selectedItems = clothes.filter((item) => selected.includes(item?.id));
        // @ts-ignore
        navigation.navigate("DesignRoom",{
            selectedItems,
            date, 
            savedOutfits
        })
    }
  return (
    <SafeAreaView className='flex-1 bg-white'>
      {/* Header */}
      <View className='flex-row items-center justify-between px-4'>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name='chevron-back' size={28} color="black" />
        </TouchableOpacity>
        <Text className='text-lg font-semibold'>Add Outfit</Text>
        <Text className='text-gray-500'>{date}</Text>
      </View>

      {/* Action Buttons */}
      <View className='flex-row justify-around mt-4 px-4'>
        <TouchableOpacity className='bg-gray-100 w-[30%] py-3 rounded-lg items-center'>
            <Ionicons name='camera-outline' size={22} color="black" />
            <Text className='font-md mt-1'>Selfie</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-gray-100 w-[30%] py-3 rounded-lg items-center'>
            <Ionicons name='sparkles-outline' size={22} color="black" />
            <Text className='font-md mt-1'>Suggestions</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-gray-100 w-[30%] py-3 rounded-lg items-center'>
            <Ionicons name='shirt-outline' size={22} color="black" />
            <Text className='font-md mt-1'>Saved Outfits</Text>
        </TouchableOpacity>
      </View>

      {/* Clothes Grid */}
      <ScrollView className='flex-1 mt-4'>
        <Text className='text-lg font-semibold px-4 mt-4'>Your Clothes</Text>
        
        {loading ? (
             <ActivityIndicator size="large" color="#000" className="mt-10" />
        ) : clothes.length === 0 ? (
            <Text className="text-gray-500 text-center mt-10">No clothes found. Upload some first!</Text>
        ) : (
            <View className='flex-row flex-wrap px-4 mt-2 mb-20'>
                {clothes.map((item) => (
                    <TouchableOpacity 
                    key={item.id}
                    className='w-1/3 p-1 relative '
                    onPress={() => toggleSelect(item?.id)}
                    >
                        <Image 
                        className="w-full h-32 rounded-md" 
                        source={{uri: item?.image}}
                        resizeMode='contain'
                        />
                        
                        {/* Gender Icon Badge */}
                        <View className='absolute top-2 right-2 w-6 h-6 rounded-full border-2 items-center justify-center bg-white/80 border-gray-200'>
                            <Text className='font-lg font-bold'>
                                {/* Backend sends 'male'/'female', mock sent 'm'/'f' - logic updated */}
                                {item?.gender === "male" ? "♂" : item?.gender === "female" ? "♀" : "⚪"}
                            </Text>
                        </View>

                        {/* Selection Checkmark */}
                        <View className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 ${selected.includes(item.id) ? 'bg-black border-black' : 'border-gray-400'} items-center justify-center`} >
                            {selected.includes(item.id) && (
                                <Ionicons name="checkmark" size={16} color='white'/>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )}
      </ScrollView>

      {/* Bottom Selection Bar */}
      {selected.length > 0 && (
        <View className='absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200'>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className=''>
                {selected?.map((id) => {
                    const item = clothes.find((cloth) => cloth.id === id);
                    return(
                        <Image 
                        key={id}
                        source={{uri:item?.image}}
                        className='w-16 h-16 mr-3 rounded-md border border-gray-100'
                        resizeMode='contain'
                        />
                    )
                })}
            </ScrollView>
            <TouchableOpacity 
            className='bg-black py-3 rounded-lg mt-3 mb-3 items-center self-end w-24'
            onPress={handleNext}
            >
                <Text className='text-white font-semibold'>Next</Text>
            </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

export default AddOutfitScreen

const styles = StyleSheet.create({})