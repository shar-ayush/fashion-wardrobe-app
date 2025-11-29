import { Dimensions, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const {width, height} =  Dimensions.get('window');

interface ClothingItem{
    id: number;
    image: string;
    x: number;
    y: number;
    type?: "pants" | "shoes" | "shirt" | "skirts" | "tops" | "mshirts";
    gender?: "m" | "f" | "unisex";
}
const DesignRoomScreen = () => {
    const route = useRoute();
    const {selectedItems, date, savedOutfits} = route.params as {
        selectedItems: ClothingItem[],
        date: string,
        savedOutfits: {[key: string]: any},
    }

    const [clothes, setClothes] = useState<ClothingItem[]>([]);

    useEffect(() => {
        const initialClothes = selectedItems.map((item) => {
            const xPosition = width / 2 - 120;
            let yPosition;
            const shirtItems = selectedItems.filter((it) => it.type === "shirt" || it.type === "tops" || it.type === "mshirts");
            const pantsItems = selectedItems.filter((it) => it.type === "pants" || it.type === "skirts");
            const shoesItems = selectedItems.filter((it) => it.type === "shoes");

            if(item?.type === "shirt" || item.type === "tops" || item.type === "mshirts"){
                yPosition = height / 2 - 240 - 100;
            }else if(item?.type === "pants" || item.type === "skirts"){
                yPosition = shirtItems ? height / 2 - 100 : height / 2;
            }else if(item?.type === "shoes"){
                yPosition = (shirtItems || pantsItems) ? height / 2 + 100 : height / 2 + 60;
            } else{
                yPosition = height / 2; // default position
            }

            return {...item, x: xPosition, y: yPosition}
        })
        setClothes(initialClothes);
    },[selectedItems])

  return (
    <SafeAreaView className='flex-1 bg-black'>
      <View className='flex-row justify-between items-center p-4'>
        <Text className='text-white text-lg'>{date}</Text>
        <TouchableOpacity className='bg-gray-700 p-2 rounded'>
            <Text className='text-white'>Next</Text>
        </TouchableOpacity>
      </View>

      <View>
        {clothes.map((item) => (
            <DraggableClothingItem/>
        ))}
      </View>
    </SafeAreaView>
  )
}

export default DesignRoomScreen

const styles = StyleSheet.create({})