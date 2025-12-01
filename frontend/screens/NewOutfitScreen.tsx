import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';


interface ClothingItem{
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
    savedOutfits: {[key: string]: any},
  };

  const navigation = useNavigation();
  const [caption, setCaption] = useState<string>("");
  const [isOotd, setIsOotd] = useState<boolean>(false);
  const [occasion, setOccasion] = useState<string>("Work");
  const [loading, setLoading] = useState<boolean>(false);
  // const [weather, setWeather] = useState<string>("Sunny");

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-row justify-between items-center'>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className='text-black'>Back</Text>
        </TouchableOpacity>
        <Text className='text-lg font-semibold'>New Outfit</Text>
      </View>

      <View className='flex-1 items-center justify-center'>
        {selectedItems?.sort((a,b) => {
          const order = {"shirt": 1, "tops": 1, "mshirts": 1, "pants": 2, "skirts": 2, "shoes": 3};
          return (order[a.type || "shirt"] || 0) - (order[b.type || "shirt"] || 0);
        })
        .map((item,index) => (
          <Image 
          resizeMode='contain'
          key={index}
          source={{uri:item?.image}}
          style={{
            width:240, 
            height: item?.type === 'shoes' ? 180 : 240,
            marginBottom: index - (selectedItems.length -1) ? -60 : 0
          }}
          />
        )
      )}
      </View>
    </SafeAreaView>
  )
}

export default NewOutfitScreen

const styles = StyleSheet.create({})