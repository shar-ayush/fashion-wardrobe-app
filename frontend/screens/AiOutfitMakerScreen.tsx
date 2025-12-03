import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AiOutfitMakerScreen = () => {
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const [extraPrompt, setExtraPrompt] = useState('');
    const [occasion, setOccasion] = useState('None');
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const Occassions = [
        { label: "Select Occasion", value: "None" },
        { label: "Date", value: "date" },
        { label: "Coffee", value: "Coffee" },
        { label: "Interview", value: "interview" },
        { label: "Party", value: "party" },
    ]
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-row items-center px-4 py-2 '>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name='chevron-back' size={24} color={"black"}/>
        </TouchableOpacity>
        <Text className='text-lg font-semibold flex-1 text-center mr-6'>Outfit Suggestions</Text>
      </View>

      <ScrollView>
        <View className='items-center mt-4'>
            <View className='relative'>
                <Image 
                source={{uri:"https://i.pinimg.com/736x/ae/06/df/ae06dfe8081b9938ff12dbafff7d2939.jpg"}}
                className='w-24 h-24 rounded-full'
                />
                <View className='absolute -top-5 left-16 bg-white border border-gray-200 rounded-lg px-2 py-1'>
                    <Text className='text-xs'>I am your personal AI stylist</Text>
                </View>
            </View>
            <Text className='text-lg font-semibold mt-3'>Eli</Text>
            <Text className='text-gray-500 mt-1'>Minimal - Timeless</Text>
            <TouchableOpacity className='mt-2 bg-gray-200 px-4 py-2 rounded-full'>
                <Text className='text-gray-700 text-sm font-medium'>Change Stylist</Text>
            </TouchableOpacity>
        </View>

        <View>
            <Text>Outfit Request</Text>

            <TouchableOpacity>
                <Ionicons name="briefcase-outline" size={24} color="black" />
                
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AiOutfitMakerScreen

const styles = StyleSheet.create({})