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
    title: "AI Virtual Try On",
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
  {
    title: "AI Outfit Maker",
    image:
      "https://i.pinimg.com/736x/50/83/0e/50830e372ee844c1f429b8ef89e26fd1.jpg",
    screen: "OutfitMaker",
  },

];


const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [savedOutfits, setSavedOutfits] = useState<Record<string, any>>({});
  const [userId, setUserId] = useState("");


  const generateDates = () => {
    const today = moment();
    const dates = [];
    for (let i = -2; i <= 4; i++) { // Show 2 days back, 4 days forward
      const dateObj = today.clone().add(i, 'days');
      dates.push({
        label: dateObj.format('ddd, Do MMM'),
        dayName: dateObj.format('dddd'),
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

    // Match against new Cloth schema category values
    const top = items.find((i: any) => ["top", "outerwear"].includes(i.type));
    const bottom = items.find((i: any) => i.type === "bottom");
    const shoes = items.find((i: any) => i.type === "footwear");

    // If no specific types found, fall back to first two items
    const displayTop = top || items[0];
    const displayBottom = bottom || (items.length > 1 ? items[1] : null);

    return { top: displayTop, bottom: displayBottom, shoes };
  };

  const todayLabel = moment().format('ddd, Do MMM');
  const todaysItems = savedOutfits[todayLabel];
  const todaysPreview = todaysItems ? getOutfitPreview(todaysItems) : null;

  return (
    <SafeAreaView className='flex-1 bg-ivory'>
      <ScrollView className='flex-1 bg-ivory'>

        {/* HEADER */}
        <View className='flex-row items-center justify-between px-4 pt-2 mb-2 mt-1'>
          <Text className='text-3xl font-bold text-espresso'>
            Welcome to Outfit AI
          </Text>
        </View>

        {/* TODAY'S PICK */}
        <View className="px-4 mt-2">
          <View className="bg-cream border border-sand rounded-2xl p-4 flex-row justify-between items-center">
            {/* LEFT CONTENT */}
            <View className="flex-1 pr-3">
              <Text className="text-taupe text-xs tracking-[3px] mb-1">TODAY'S PICK</Text>
              <Text className="text-espresso text-xl font-semibold">{todaysPreview ? "Your Outfit" : "No Outfit"}</Text>
              <Text className="text-mocha text-sm mt-1">
                {todaysItems ? `${todaysItems.length} items matched` : "Plan your outfit"}
              </Text>
            </View>

            {/* RIGHT PREVIEW STACK */}
            <View className="items-center justify-center">
              {todaysPreview ? (
                <>
                  {todaysPreview.top && (
                    <Image
                      source={{ uri: todaysPreview.top.image }}
                      className="w-20 h-20 mb-[-10px] z-20"
                      resizeMode="contain"
                    />
                  )}

                  {todaysPreview.bottom && (
                    <Image
                      source={{ uri: todaysPreview.bottom.image }}
                      className="w-20 h-20 mb-[-10px] z-10"
                      resizeMode="contain"
                    />
                  )}

                  {todaysPreview.shoes && (
                    <Image
                      source={{ uri: todaysPreview.shoes.image }}
                      className="w-16 h-16"
                      resizeMode="contain"
                    />
                  )}
                </>
              ) : (
                <View className="w-16 h-16 bg-sand rounded-xl items-center justify-center">
                  <Ionicons name="shirt-outline" size={20} color="#a89880" />
                </View>
              )}

            </View>

          </View>
        </View>

        {/* WEEK TITLE */}
        <View className='flex-row items-center justify-between mt-6 px-4'>
          <Text className='text-lg font-semibold text-espresso' style={{ flex: 1, flexWrap: 'wrap' }}>
            Your week
          </Text>
          <Text className='text-mocha' style={{ marginLeft: 8 }}>
            Planner
          </Text>
        </View>

        {/* WEEKLY PLANNER */}
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
                  className={`h-44 w-28 rounded-2xl items-center justify-center overflow-hidden border ${day.isToday
                    ? 'border-espresso bg-cream'
                    : 'border-sand bg-white'
                    }`}
                >
                  {!preview ? (
                    <View className='w-full h-full flex items-center justify-center bg-cream'>
                      <View className='bg-white p-2 rounded-full border border-sand'>
                        <Ionicons name="add" size={24} color="#a89880" />
                      </View>
                    </View>
                  ) : (
                    <View className='w-full h-full items-center justify-center py-2'>
                      {preview.top && (
                        <Image
                          source={{ uri: preview.top.image }}
                          className='w-20 h-20 mb-[-10px] z-10'
                          resizeMode='contain'
                        />
                      )}
                      {preview.bottom && (
                        <Image
                          source={{ uri: preview.bottom.image }}
                          className='w-20 h-20'
                          resizeMode='contain'
                        />
                      )}
                      {!preview.bottom && !preview.top && (
                        <Text className="text-xs text-taupe">
                          Items saved
                        </Text>
                      )}
                    </View>
                  )}
                </Pressable>

                {/* DATE */}
                <View className='flex-row justify-center items-center mt-2'>
                  <Text className={`text-[12px] ${day.isToday ? 'text-espresso' : 'text-mocha'
                    }`}>
                    {day.label.split(',')[0]}
                  </Text>
                  <Text className='text-[12px] text-taupe'>
                    {day.label.split(',')[1]}
                  </Text>
                </View>
              </View>
            )
          })}
        </ScrollView>



        {/* FEATURES GRID */}
        <View className='flex-row flex-wrap justify-between px-4 mt-6'>
          {features.map((feature, idx) => (
            <Pressable
              onPress={() => navigation.navigate(feature.screen)}
              key={feature.title || idx}
              className='w-[48%] h-36 mb-4 rounded-2xl border border-sand bg-cream overflow-hidden'
            >
              <View className='p-3'>
                <Text className='font-bold text-[16px] text-espresso'>
                  {feature.title}
                </Text>

                <Text className='text-xs text-mocha mt-1'>
                  {idx === 0
                    ? "Ask the fashion assistant"
                    : idx === 1
                      ? "Try any outfit virtually"
                      : idx === 2
                        ? "Add items to your closet"
                        : "Ask AI to design an outfit for you"
                  }
                </Text>
              </View>

              <Image
                style={{ transform: [{ rotate: '12deg' }], opacity: 0.9 }}
                className="w-20 h-20 absolute bottom-[-3] right-[-1] rounded-lg"
                source={{ uri: feature.image }}
              />
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})