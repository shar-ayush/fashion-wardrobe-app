import { Dimensions, StyleSheet, Text, Image, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface ClothingItem {
    id: string;
    image: string;
    x: number;
    y: number;
    type?: "top" | "bottom" | "footwear" | "outerwear" | "accessory";
    gender?: "male" | "female" | "unisex";
}

const DraggableClothingItem = ({ item }: { item: ClothingItem }) => {
    const translateX = useSharedValue(item?.x)
    const translateY = useSharedValue(item?.y)

    const panGesture = Gesture.Pan().onUpdate((e) => {
        translateX.value = item.x + e.translationX;
        translateY.value = item.y + e.translationY;
    }).onEnd(() => {
        item.x = translateX.value;
        item.y = translateY.value;
    });
    const isTop = ["top", "outerwear"].includes(item.type || "");
    const isBottom = ["bottom"].includes(item.type || "");

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
        position: 'absolute',
        zIndex: isTop ? 20 : isBottom ? 10 : 5
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
                <Image
                    style={{ width: 240, height: item?.type === 'footwear' ? 180 : 240 }}
                    source={{ uri: item?.image }}
                    resizeMode='contain'
                />
            </Animated.View>
        </GestureDetector>
    )
}

const DesignRoomScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedItems, date, savedOutfits } = route.params as {
        selectedItems: ClothingItem[],
        date: string,
        savedOutfits: { [key: string]: any },
    }

    const [clothes, setClothes] = useState<ClothingItem[]>([]);

    useEffect(() => {
        const initialClothes = selectedItems.map((item) => {
            const xPosition = width / 2 - 120; // Center Horizontally
            let yPosition;

            const isTop = ["top", "outerwear"].includes(item.type || "");
            const isBottom = item.type === "bottom";
            const isShoe = item.type === "footwear";

            // Check if user selected other categories to adjust layout dynamically
            const hasTops = selectedItems.some(it => ["top", "outerwear"].includes(it.type || ""));
            const hasBottoms = selectedItems.some(it => it.type === "bottom");

            // Dynamic Positioning Calculation
            if (isTop) {
                // Upper body area
                yPosition = height / 2 - 240 - 50;
            } else if (isBottom) {
                // If there is a top, place below it. If no top, place in middle.
                yPosition = hasTops ? height / 2 - 80 : height / 2 - 150;
            } else if (isShoe) {
                // If clothes exist, place at bottom. Else middle.
                yPosition = (hasTops || hasBottoms) ? height / 2 + 120 : height / 2;
            } else {
                yPosition = height / 2; // Default center
            }

            return { ...item, x: xPosition, y: yPosition }
        })
        setClothes(initialClothes);
    }, [selectedItems])

    return (
        <SafeAreaView className='flex-1 bg-black'>
            <View className='flex-row justify-between items-center p-4'>
                <Text className='text-white text-lg'>{date}</Text>
                <TouchableOpacity
                    // @ts-ignore
                    onPress={() => navigation.navigate("NewOutfit", {
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