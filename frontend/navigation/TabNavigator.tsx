import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        // ICON COLORS
        tabBarActiveTintColor: '#3d2f20',   // espresso
        tabBarInactiveTintColor: '#a89880', // taupe

        // TAB BAR STYLE
        tabBarStyle: {
          backgroundColor: '#faf7f2', // ivory
          height: 70,
          borderTopWidth: 1,
          borderTopColor: '#e8ddd0', // sand
          elevation: 0,
        }
      }}
    >

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Add"
        component={View}
        options={{
          tabBarIcon: () => (
            <View className='h-12 w-12 rounded-full bg-espresso items-center justify-center'>
              <Text className='text-ivory text-[28px] leading-[28px]'>+</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props as any} className='items-center justify-center' />
          )
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />

    </Tab.Navigator>
  )
}

export default TabNavigator

const styles = StyleSheet.create({})