import { Dimensions, StyleSheet, Text, Image, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const {width, height} =  Dimensions.get('window');

interface ClothingItem{
    id: number;
    image: string;
    x: number;
    y: number;
    type?: "pants" | "shoes" | "shirt" | "skirt" | "tops" | "mshirts";
    gender?: "m" | "f" | "unisex";
}

const DraggableClothingItem = ({item}: {item: ClothingItem}) => {
    const translateX = useSharedValue(item?.x)
    const translateY = useSharedValue(item?.y)

    const panGesture = Gesture.Pan().onUpdate((e) => {
        translateX.value = item.x + e.translationX;
        translateY.value = item.y + e.translationY;
    }).onEnd(() => {
        item.x = translateX.value;
        item.y = translateY.value;
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: translateX.value},
            {translateY: translateY.value},
        ],
        position: 'absolute',
        zIndex: item.type === "shirt" || item.type === "skirt" ? 20 : 10,
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
                <Image 
                style={{width:240, height: item?.type === 'shoes' ? 180 : 240}} 
                source={{uri:item?.image}} 
                resizeMode='contain'
                />
            </Animated.View>
        </GestureDetector>
    )
}

const DesignRoomScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
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
            const pantsItems = selectedItems.filter((it) => it.type === "pants" || it.type === "skirt");
            const shoesItems = selectedItems.filter((it) => it.type === "shoes");

            if(item?.type === "shirt" || item.type === "tops" || item.type === "mshirts"){
                yPosition = height / 2 - 240 - 100;
            }else if(item?.type === "pants" || item.type === "skirt"){
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
        <TouchableOpacity 
        // @ts-ignore
        onPress={() => navigation.navigate("NewOutfit",{
            selectedItems,
            date,
            savedOutfits
        })}
        className='bg-gray-700 p-2 rounded'>
            <Text className='text-white'>Next</Text>
        </TouchableOpacity>
      </View>

      <View className='flex-1'>
        {clothes.map((item) => (
            <DraggableClothingItem key={item.id} item={item} />
        ))}
      </View>

      <View className='flex-row justify-between p-4'>
        <TouchableOpacity className='bg-gray-700 p-2 rounded'>
            <Text className='text-white'>Add Clothes</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-gray-700 p-2 rounded'>
            <Text className='text-white'>Stickers</Text>
        </TouchableOpacity>
        <TouchableOpacity className='bg-gray-700 p-2 rounded'>
            <Text className='text-white'>Background</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default DesignRoomScreen

const styles = StyleSheet.create({})