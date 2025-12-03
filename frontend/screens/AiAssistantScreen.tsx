import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AiAssistantScreen = () => {
    const navigation = useNavigation();
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([
        {
            id: '1',
            text:"Hello! How can I assist you with your outfit today?",
            sender: 'ai'
        }
    ])
  return (
    <SafeAreaView className='flex-1 bg-gray-100'>
      <View className='flex-row items-center justify-between p-4 bg-white border border-gray-200'>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name='chevron-back' size={24} color="#333" />
        </TouchableOpacity>
        <Text className='text-xl font-bold text=gray-800'>AI Fashion Assistant</Text>
      </View>
    </SafeAreaView>
  )
}

export default AiAssistantScreen

const styles = StyleSheet.create({})