import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import useAuthStore from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("Clothes");
  const [activeCategory, setActiveCategory] = useState("All");
  const { logout, token, user } = useAuthStore();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const username = user?.username;
  const email = user?.email;
  const followerCount = user?.followerCount || 0;
  const followingCount = user?.followingCount || 0;
  const profileImage = user?.profileImage || "https://picsum.photos/100/100";


  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <ScrollView>
        <View className='flex-row justify-between items-center px-4 pt-2'>
          <Text className='text-2xl font-bold'>{username}</Text>
          <View className='flex-row gap-3'>
            <Ionicons name='calendar-outline' color="black" size={24} />
            <Ionicons name='pie-chart-outline' color="black" size={24} />
            <Ionicons name='menu-outline' color="black" size={24} />
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
              {activeTab === tab && <View className='h-0.5 bg-black mt-2'/>}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-3 pl-4'>
          {["All", "Tops", "Bottoms", "Shoes", "Outwear"].map((category) => (
            <TouchableOpacity key={category} onPress={() => setActiveCategory(category)} className={`px-3 mr-4 rounded-full ${activeCategory === category ? "text-black" : "text-gray-500"}`}>
              <Text className={`text-base font-medium ${activeCategory === category ? "text-black" : "text-gray-500"}`}>{category}</Text>
              {activeCategory === category && <View className='h-0.5 bg-black mt-2'/>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})
