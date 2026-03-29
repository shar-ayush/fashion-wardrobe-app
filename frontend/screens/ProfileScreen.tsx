import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import useAuthStore from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("Clothes");
  const [activeCategory, setActiveCategory] = useState("All");
  const { logout, token, user } = useAuthStore();
  type ClothItem = {
    _id?: string;
    image: string;
    category?: string;
    subCategory?: string;
    gender?: string;
  };

  type Outfit = {
    _id?: string;
    items: ClothItem[];
    caption?: string;
    occassion?: string;
    visibility?: string;
    isOotd?: boolean;
    date?: string;
  };

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [clothes, setClothes] = useState<ClothItem[]>([]);
  const [loadingOutfits, setLoadingOutfits] = useState(false);
  const [loadingClothes, setLoadingClothes] = useState(false);

  const username = user?.username;
  const email = user?.email;
  const followerCount = user?.followerCount || 0;
  const followingCount = user?.followingCount || 0;
  const profileImage = user?.profileImage || "https://picsum.photos/100/100";

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() }
    ])
  }

  useFocusEffect(
    useCallback(() => {
      const fetchOutfits = async () => {
        if (!user?._id || !token) return;
        if (outfits.length === 0) setLoadingOutfits(true);

        try {
          const response = await axios.get(`${API_BASE_URL}/api/save-outfit/user/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOutfits(response.data);
        } catch (error) {
          console.log("Error fetching outfits:", error);
        } finally {
          setLoadingOutfits(false);
        }
      };

      fetchOutfits();
    }, [user?._id, token])
  );


  useFocusEffect(
    useCallback(() => {
      const fetchClothes = async () => {
        if (!user?._id) return;
        if (clothes.length === 0) setLoadingClothes(true);

        try {
          const response = await axios.get(`${API_BASE_URL}/api/upload-to-closet`, {
            params: { userId: user._id }
          });

          if (response.data.success) {
            const mappedClothes = response.data.data.map((item: any) => ({
              _id: item._id,
              image: item.imageUrl,
              category: item.category,
              subCategory: item.subCategory,
              gender: item.gender
            }));
            setClothes(mappedClothes);
          }
        } catch (error) {
          console.log("Error fetching clothes:", error);
        } finally {
          setLoadingClothes(false);
        }
      };

      fetchClothes();
    }, [user?._id])
  );

  const filteredClothes = activeCategory === "All" ? clothes : clothes.filter((item) => {
    switch (activeCategory) {
      case "Tops":
        return item.category === "top"
      case "Bottoms":
        return item.category === "bottom"
      case "Footwear":
        return item.category === "footwear"
      case "Outerwear":
        return item.category === "outerwear"
      case "Accessories":
        return item.category === "accessory"
      default:
        return true;
    }
  });
  const sortItems = (items: ClothItem[]) => {
    const order = ["top", "bottom", "outerwear", "footwear", "accessory"];
    return [...items].sort(
      (a, b) => order.indexOf(a.category || "") - order.indexOf(b.category || ""),
    );
  }

  const confirmDelete = (id?: string) => {
    if (!id) return;
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCloth(id) },
    ]);
  };

  const deleteCloth = async (id: string) => {
    if (!user?._id) return;
    try {
      const resp = await axios.delete(`${API_BASE_URL}/api/upload-to-closet/${id}`, {
        data: { userId: user._id },
      });
      if (resp.data && resp.data.success) {
        setClothes((prev) => prev.filter((c) => c._id !== id));
      } else {
        Alert.alert("Error", resp.data?.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Delete failed", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  // console.log("Outfits:", outfits);

  return (
    <SafeAreaView className='flex-1 bg-ivory'>
      <ScrollView>
        {/* HEADER SECTION */}
        <View className='flex-row justify-between items-center px-4 pt-2'>
          <Text className='text-2xl font-bold text-espresso'>{username}</Text>
          <View className='flex-row gap-3'>
            <TouchableOpacity className='flex-row gap-3 items-center justify-center'>
              <Text>Logout</Text>
              <Ionicons name='log-out-outline' color="#3d2f20" size={24} onPress={confirmLogout} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PROFILE INFO */}
        <View className='flex-row items-center px-4 mt-4'>
          <TouchableOpacity className='relative'>
            <Image className='h-20 w-20 rounded-full' source={{ uri: profileImage }} />
            <View className='bg-espresso absolute bottom-0 right-0 rounded-full justify-center items-center w-6 h-6'>
              <Text className='text-ivory text-lg text-center'>+</Text>
            </View>
          </TouchableOpacity>

          <View className='ml-4'>
            <Text className='text-xl font-semibold text-espresso'>{username}</Text>
            <Text className='text-sm text-mocha'>{email}</Text>
          </View>
        </View>

        {/* TABS */}
        <View className='flex-row justify-around border-b border-sand mt-5'>
          {["Clothes", "Outfits", "Collections"].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className='pb-2'>
              <Text className={`text-base font-medium ${activeTab === tab ? "text-espresso" : "text-taupe"}`}>
                {tab}
              </Text>
              {activeTab === tab && <View className='h-0.5 bg-terracotta mt-2' />}
            </TouchableOpacity>
          ))}
        </View>

        {/* CLOTHES FILTER CATEGORIES */}
        {activeTab === "Clothes" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-3 pl-4 mb-2'>
            {["All", "Tops", "Bottoms", "Footwear", "Outerwear", "Accessories"].map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                className={`px-3 mr-4 rounded-full`}
              >
                <Text className={`text-base font-medium ${activeCategory === category ? "text-espresso" : "text-taupe"}`}>
                  {category}
                </Text>
                {activeCategory === category && <View className='h-0.5 bg-terracotta mt-2' />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* TAB CONTENT: CLOTHES */}
        {activeTab === "Clothes" && (
          <View className='px-4 mt-2'>
            {loadingClothes ? (
              <ActivityIndicator size="large" color="#000" className="mt-10" />
            ) : filteredClothes.length === 0 ? (
              <View className="mt-10 items-center">
                <Text className="text-mocha text-base">No clothes found.</Text>
                <Text className="text-taupe text-sm mt-1">
                  Upload items to your closet to see them here.
                </Text>
              </View>
            ) : (
              <View className='flex-row flex-wrap'>
                {filteredClothes.map((item, index) => (
                  <View key={`cloth-${index}-${item._id}`} className='w-1/3 p-1.5'>
                    <View
                      className='bg-white rounded-lg border border-sand overflow-hidden'
                    >
                      <Image className='w-full h-32' source={{ uri: item?.image }} resizeMode='contain' />

                      <TouchableOpacity
                        onPress={() => confirmDelete(item._id)}
                        className='absolute top-1 right-1 bg-cream rounded-full p-1'
                      >
                        <Ionicons name='trash' color='#a89880' size={14} />
                      </TouchableOpacity>

                      <View className='p-2'>
                        <Text className='text-xs font-medium text-mocha capitalize'>
                          {item?.subCategory}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB CONTENT: OUTFITS */}
        {activeTab === "Outfits" && (
          <View className="px-2 mt-4">
            {loadingOutfits ? (
              <ActivityIndicator size={"large"} color="#3d2f20" />
            ) : outfits.length === 0 ? (
              <View className="items-center mt-10">
                <Text className="text-gray-500">No Outfits saved yet.</Text>
              </View>
            ) : (
              <View className='flex-row flex-wrap'>
                {outfits?.map((outfit) => (
                  <View key={outfit._id} className='w-1/2 p-1.5'>
                    <View
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      className='bg-white rounded-lg border border-sand p-2'
                    >
                      {/* Items  */}
                      <View className="flex-row flex-wrap justify-center h-40 overflow-hidden">
                        {sortItems(outfit.items).map((item, index) => (
                          <Image
                            key={`${outfit._id}-${item._id || index}`}
                            source={{ uri: item.image }}
                            className='w-24 h-24'
                            resizeMode='contain'
                            style={{ margin: -5 }}
                          />
                        ))}
                      </View>

                      <View className="mt-2 border-t border-sand pt-2">
                        <Text className='text-sm font-semibold text-espresso'>
                          {outfit?.date || "No Date"}
                        </Text>
                        <Text className='text-xs font-medium text-mocha'>
                          {outfit?.occassion || "Casual"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen

