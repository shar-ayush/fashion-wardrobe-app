import { Image, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const features = [
  {
    title: "AI Suggestions",
    image:
      "https://i.pinimg.com/736x/2e/3d/d1/2e3dd14ac81b207ee6d86bc99ef576eb.jpg",
    screen: "AIChat",
  },
  {
    title: "AI Outfit Maker",
    image:
      "https://i.pinimg.com/736x/50/83/0e/50830e372ee844c1f429b8ef89e26fd1.jpg",
    screen: "AIOutfit",
  },
  {
    title: "AI Try On",
    image:
      "https://i.pinimg.com/736x/c2/78/95/c2789530a2dc8c9dbfd4aa5e2e70d608.jpg",
    screen: "AITryOn",
  },
  {
    title: "Upload Outfits",
    image:
      "https://i.pinimg.com/736x/84/bf/ce/84bfce1e46977d50631c4ef2f72f83b1.jpg",
    screen: "UploadOutfit",
  },
];

const initialStories = [
  {
    username: "Your OOTD",
    avatar: "https://picsum.photos/100/100?random=8",
    isOwn: true,
    viewed: false,
  },
  {
    username: "_trishwushres",
    avatar: "https://picsum.photos/100/100?random=10",
    isOwn: false,
    viewed: false,
  },
  {
    username: "myglam",
    avatar: "https://picsum.photos/100/100?random=11",
    isOwn: false,
    viewed: false,
  },
  {
    username: "stylist",
    avatar: "https://picsum.photos/100/100?random=12",
    isOwn: false,
    viewed: false,
  },
];



const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [savedOutfits, setSavedOutfits] = useState<Record<string, any>>({});
  const [stories, setStories] = useState(initialStories);
  const [showStory, setShowStory] = useState(false);
  const [userId, setUserId] = useState("");
  const [currentStory, setCurrentStory] = useState<{
    username: string;
    avatar: string;
    duration: number;
  } | null>(null);

  const generateDates = () => {
    const today = moment();
    const dates = [];
    for (let i = -2; i <= 4; i++) { // Show 2 days back, 4 days forward
      const dateObj = today.clone().add(i, 'days');
      dates.push({
        label: dateObj.format('ddd, Do MMM'), // Matches 'Mon, 1st Jan' format used in DB
        dayName: dateObj.format('dddd'),      // 'Monday'
        isToday: i === 0
      })
    }
    return dates;
  }
  const dates = generateDates();

  // 2. Fetch User & Outfits
  useFocusEffect(
    useCallback(() => {
        const init = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode(token) as { id: string };
                    setUserId(decoded.id);
                    await fetchSavedOutfits(decoded.id, token);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };
        init();
    }, [])
  );
  const fetchSavedOutfits = async (uid: string, token: string) => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/save-outfit/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform array to Object { "Mon, 1st Jan": [items...] }
      const outfitsMap = response.data.reduce((acc: { [key: string]: any[] }, outfit: any) => {
        // Only take the items array from the outfit object
        acc[outfit.date] = outfit.items; 
        return acc;
      }, {});
      
      setSavedOutfits(outfitsMap);
    } catch (error) {
      console.error("Error fetching saved outfits:", error);
    }
  }

  // 3. Helper to find relevant items in an outfit
  const getOutfitPreview = (items: any[]) => {
    if (!items || items.length === 0) return null;

    // Check against ALL possible types for Tops and Bottoms
    const top = items.find((i: any) => ["shirt", "tops", "mshirts"].includes(i.type));
    const bottom = items.find((i: any) => ["pants", "mpants", "skirt", "skirts"].includes(i.type));
    const shoes = items.find((i: any) => i.type === "shoes");

    // Fallback: If no specific types found, just take the first item
    const displayTop = top || items[0];
    const displayBottom = bottom || (items.length > 1 ? items[1] : null);

    return { top: displayTop, bottom: displayBottom };
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView className='flex-1 bg-white'>
        <View className='flex-row items-center justify-between px-4 pt-2'>
          <Text className='text-2xl font-bold'>Outfit Wardrobe</Text>
          <View className='flex-row items-center gap-3'>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <Ionicons name="search-outline" size={24} color="black" />
          </View>
        </View>

        <View className='flex-row items-center justify-between mt-6 px-4'>
          <Text className='text-lg font-semibold' style={{ flex: 1, flexWrap: 'wrap' }}>Your week</Text>
          <Text className='text-gray-500' style={{ marginLeft: 8 }}>Planner</Text>
        </View>

        {/* Weekly Planner ScrollView */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-4 pl-4 pb-4'>
          {dates?.map((day, idx) => {
            const outfitItems = savedOutfits[day.label];
            const preview = outfitItems ? getOutfitPreview(outfitItems) : null;

            return (
              <View key={day.label} className='mr-3'>
                <Pressable
                  onPress={() => {
                    navigation.navigate("AddOutfit", {
                      date: day.label, 
                      savedOutfits,
                    })
                  }}
                  className={`h-44 w-28 rounded-2xl items-center justify-center overflow-hidden border ${
                    day.isToday ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'
                  } shadow-sm`}
                  style={{ elevation: 2 }}
                >
                  {!preview ? (
                    // Empty State
                    <View className='w-full h-full flex items-center justify-center bg-gray-50'>
                      <View className='bg-white p-2 rounded-full shadow-sm'>
                         <Ionicons name="add" size={24} color="#9CA3AF" />
                      </View>
                    </View>
                  ) : (
                    // Filled State
                    <View className='w-full h-full items-center justify-center py-2'>
                        {/* Render Top */}
                        {preview.top && (
                            <Image 
                                source={{ uri: preview.top.image }} 
                                className='w-20 h-20 mb-[-10px] z-10' 
                                resizeMode='contain' 
                            />
                        )}
                        {/* Render Bottom */}
                        {preview.bottom && (
                            <Image 
                                source={{ uri: preview.bottom.image }} 
                                className='w-20 h-20' 
                                resizeMode='contain' 
                            />
                        )}
                        {/* If only one item, center it better */}
                        {!preview.bottom && !preview.top && (
                             <Text className="text-xs text-gray-400">Items saved</Text>
                        )}
                    </View>
                  )}
                </Pressable>

                {/* Date Label */}
                <View className='flex-row justify-center items-center mt-2'>
                    <Text className={`text-[12px] ${day.isToday ? 'text-black' : 'text-gray-800'}`}>
                        {day.label.split(',')[0]} {/* Mon */}
                    </Text>
                    <Text className='text-[12px] text-gray-500'>
                        {day.label.split(',')[1]} {/* 1st Jan */}
                    </Text>
                </View>
              </View>
            )
          })}
        </ScrollView>

        <View className='flex-row flex-wrap justify-between px-4 mt-6'>
          {features.map((feature, idx) => (
            <Pressable
              onPress={() => navigation.navigate(feature.screen)}
              style={{
                backgroundColor: ["#FFF1F2", "#EFF6FF", "#F0FFF4", "#FFFBEB"][
                  idx % 4
                ],
                elevation: 3,
              }}
              key={feature.title || idx}
              className='w-[48%] h-36 mb-4 rounded-2xl shadow-md overflow-hidden'>
              <View className='p-3'>
                <Text className='font-bold text-[16px] text-gray-800'>{feature.title}</Text>
                <Text className='text-xs text-gray-500 mt-1'>
                  {idx === 0
                    ? "Try Outfits Virtually"
                    : idx === 1
                      ? "AI Created New Looks"
                      : idx === 2
                        ? "Instant Try On"
                        : "Add Outfits to Your Closet"
                  }
                </Text>

              </View>
              <Image
                style={{ transform: [{ rotate: '12deg' }], opacity: 0.9 }}
                className="w-20 h-20 absolute bottom-[-3] right-[-1] rounded-lg"
                source={{ uri: feature.image }} />
            </Pressable>
          ))}
        </View>
{/* 
        <View className='flex-row justify-between items-center mt-6 px-4'>
          <Text className='text-lg font-semibold'>Popular this week</Text>
          <Text className='text-gray-500'>More</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-4 pl-4'>
          {popularItems?.map((item, idx) => (
            <View key={item.username + item.itemName || idx} className='w-36 mr-4'>
              <Image className='w-36 h-44 rounded-lg' source={{ uri: item?.image }} />
              <View className='flex-row items-center mt-2'>
                <Image className='w-6 h-6 rounded-full mr-2' source={{ uri: item?.profile }} />
                <Text className='text-xs font-medium'>{item.username}</Text>
              </View>
              <Text className='text-xs text-gray-500 mt-1'>{item.itemName}</Text>
            </View>
          ))}
        </ScrollView> */}
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})