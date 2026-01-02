import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { mpants, mshirts, pants, shoes, skirt, tops } from '../images';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("Clothes");
  const [activeCategory, setActiveCategory] = useState("All");
  const { logout, token, user } = useAuthStore();
  type ClothItem = {
    id?: string;
    image: string;
    type: string;
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

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",[
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() }
      ])
  }

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const username = user?.username;
  const email = user?.email;
  const followerCount = user?.followerCount || 0;
  const followingCount = user?.followingCount || 0;
  const profileImage = user?.profileImage || "https://picsum.photos/100/100";

  const popularClothes = [
    ...pants,
    ...tops,
    ...skirt,
    ...mpants,
    ...mshirts,
    ...shoes
  ]



  useEffect(() => {
    const fetchOutfits = async () => {
      if (!user._id || !token) return;
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/save-outfit/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOutfits(response.data);

      } catch (error) {
        console.log("Error fetching outfits:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOutfits();
  }, [user._id, token]);

  const filteredClothes = activeCategory === "All" ? popularClothes : popularClothes.filter((item) => {
    switch (activeCategory) {
      case "Tops":
        return item.type === "shirt";
      case "Bottoms":
        return item.type === "pants" || item.type === "skirt";
      case "Shoes":
        return item.type === "shoes";
      default:
        return true;
    }
  })
  const sortItems = (items: ClothItem[]) => {
    const order = ["shirt", "pants", "skirt", "shoes"];
    return [...items].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  }

  // console.log("Outfits:", outfits);

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <ScrollView>
        <View className='flex-row justify-between items-center px-4 pt-2'>
          <Text className='text-2xl font-bold'>{username}</Text>
          <View className='flex-row gap-3'>
            <Ionicons name='calendar-outline' color="black" size={24} />
            <Ionicons name='pie-chart-outline' color="black" size={24} />
            <Ionicons name='menu-outline' color="black" size={24} />
            <TouchableOpacity className='items-center justify-center'>
              <Ionicons name='log-out-outline' color="black" size={24} onPress={confirmLogout} />
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className='flex-row items-center px-4 mt-4'>
          <TouchableOpacity className='relative'>
            <Image className='h-20 w-20 rounded-full' source={{ uri: profileImage }} />
            <View className='bg-black absolute bottom-0 right-0 rounded-full justify-center items-center w-6 h-6'>
              <Text className='text-white text-lg text-center'>+</Text>
            </View>
          </TouchableOpacity>

          <View className='ml-4'>
            <Text className='text-lg font-semibold'>{username}</Text>
            <Text className='text-sm text-gray-500'>{email}</Text>
            <View className='flex-row mt-1 gap-2'>
              <Text className='text-gray-600'>
                <Text className='font-bold'> {followerCount} </Text> Followers
              </Text>
              <Text className='text-gray-600'>
                <Text className='font-bold'> {followingCount} </Text> Following
              </Text>
            </View>
          </View>
        </View>

        <View className='flex-row px-4 gap-3 mt-4 '>
          <TouchableOpacity className='flex-1 bg-gray-200 rounded-lg py-2 items-center'>
            <Text className='font-medium'>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 bg-gray-200 rounded-lg py-2 items-center'>
            <Text className='font-medium'>Share Profile</Text>
          </TouchableOpacity>
        </View>

        <View className='flex-row justify-around border-b border-gray-300 mt-5'>
          {["Clothes", "Outfits", "Collections"].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className='pb-2'>
              <Text className={`text-base font-medium ${activeTab === tab ? "text-black" : "text-gray-500"}`}>{tab}</Text>
              {activeTab === tab && <View className='h-0.5 bg-black mt-2' />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-3 pl-4'>
          {["All", "Tops", "Bottoms", "Shoes", "Outwear"].map((category) => (
            <TouchableOpacity key={category} onPress={() => setActiveCategory(category)} className={`px-3 mr-4 rounded-full ${activeCategory === category ? "text-black" : "text-gray-500"}`}>
              <Text className={`text-base font-medium ${activeCategory === category ? "text-black" : "text-gray-500"}`}>{category}</Text>
              {activeCategory === category && <View className='h-0.5 bg-black mt-2' />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === "Clothes" && (
          <View className='px-4'>
            {filteredClothes.length == 0 ? (
              <Text>No clothes available in this category</Text>
            ) : (
              <View className='flex-row flex-wrap'>
                {filteredClothes.map((item, index) => (
                  <View key={`cloth-${index}-${item.type}-${item.gender}`} className='w-1/3 p-1.5'>
                    <View
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'
                    >
                      <Image className='w-full h-32' source={{ uri: item?.image }} resizeMode='contain' />
                      <View className='p-2'>
                        <Text className='text-xs font-medium text-gray-600 capitalize'>{item?.type} ({item?.gender})</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "Outfits" && (
          <View>
            {loading ? (
              <ActivityIndicator size={"large"} color="#000" />
            ) : outfits.length === 0 ? (
              <Text>No Outfits saved </Text>
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
                    className='bg-white rounded-lg shadow-sm border border-gray-100'
                    >
                      
                    {sortItems(outfit.items).map((item, index) => (
                      <Image 
                      key={`${outfit._id}-${item.id}-${index}`}
                      source={{ uri: item.image }}
                      className='w-full h-36'
                      resizeMode='contain'
                      style={{ marginVertical: -20 }}
                      />
                    ))}
                    
                    <View>
                      <Text className='text-sm font-semibold text-gray-800'>{outfit?.date}</Text>
                      <Text className='text-xs font-medium text-gray-600'>{outfit?.occassion}</Text>
                      <Text className='text-sm text-gray-500 mt-1'>
                        {outfit.items.map((item) => item.type).join(", ")}
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

const styles = StyleSheet.create({})
