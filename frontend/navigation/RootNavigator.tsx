import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator';
import AddOutfitScreen from '../screens/AddOutfitScreen';
import DesignRoomScreen from '../screens/DesignRoomScreen';
import NewOutfitScreen from '../screens/NewOutfitScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import useAuthStore from '../store/authStore';
import AiAssistantScreen from '../screens/AiAssistantScreen';
import AiOutfitMakerScreen from '../screens/AiOutfitMakerScreen';
import UploadOutfitScreen from '../screens/UploadOutfitScreen';
import AITryOnScreen from '../screens/AITryOnScreen';

const RootNavigator = () => {
  const Stack = createNativeStackNavigator();
  const {isAuthenticated, initializeAuth} = useAuthStore(); 

  useEffect(() => {
    initializeAuth();
  },[initializeAuth]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="AddOutfit" component={AddOutfitScreen} />
          <Stack.Screen name="DesignRoom" component={DesignRoomScreen} />
          <Stack.Screen name="NewOutfit" component={NewOutfitScreen} />
          <Stack.Screen name="AIChat" component={AiAssistantScreen} />
          <Stack.Screen name="AIOutfit" component={AiOutfitMakerScreen} />
          <Stack.Screen name="UploadOutfit" component={UploadOutfitScreen} />
          <Stack.Screen name="AITryOn" component={AITryOnScreen} />
          
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}

    </Stack.Navigator>
  )
}

export default RootNavigator

const styles = StyleSheet.create({})