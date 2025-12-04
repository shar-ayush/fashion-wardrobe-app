import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


const AiAssistantScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hello! How can I assist you with your outfit today?",
            sender: 'ai'
        }
    ])

    const suggestions = [
        "Suggest a casual outfit for a coffee date☕",
        "Recommend a formal look for an interview👔",
        "Best party outfit for a night out🎉",
        "Summer dress ideas for a beach vacation🏖️",
    ]

    const OPENROUTER_API_KEY = `${process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY}`;
    const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    const handleSend = async () => {
        if (!query && !query.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: query,
            sender: 'user'
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setQuery("");
        setIsLoading(true);

        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3.3-70b-instruct:free",
                    messages: [
                        {
                            role: "system",
                            content: "You are a fashion assistant. Provide outfit suggestions with emojis and include links to relevant products or places where applicable."
                        },
                        {
                            role: "user",
                            content: userMessage.text
                        },
                    ],
                    // OpenRouter doesn't strictly enforce max_tokens, but good to have
                    // max_tokens: 150,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if valid response exists
            if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error("Invalid response from OpenRouter API");
            }

            const aiResponse = data.choices[0].message.content;

            // Text enhancement logic
            const enhancedResponse = aiResponse
                .replace(/dress/gi, "dress 👗")
                .replace(/suit/gi, "suit 🤵🏻")
                .replace(/casual/gi, "casual 😎")
                .replace(/party/gi, "party 👯")
                .replace(/(https?:\/\/[^\s]+)/g, "[Link]($1)");


            setMessages((prevMessages) => [...prevMessages,
            {
                id: (Date.now() + 1).toString(),
                text: enhancedResponse,
                sender: 'ai'
            }
            ]);

        } catch (error: any) {
            console.log("Error fetching AI response:", error);
            setMessages((prevMessages) => [...prevMessages, {
                id: (Date.now() + 1).toString(),
                text: `Sorry, I couldn't get suggestions. Try again! (Error: ${error.message})`,
                sender: 'ai'
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSuggestion = (suggestion: string) => {
        setQuery(suggestion);
        handleSend();
    }
    return (
        <SafeAreaView className='flex-1 bg-gray-100'>
            <View className='flex-row items-center justify-between p-4 bg-white border border-gray-200'>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name='chevron-back' size={24} color="#333" />
                </TouchableOpacity>
                <Text className='text-xl font-bold text=gray-800'>AI Fashion Assistant</Text>
                <View className='w-6' />
            </View>

            <ScrollView className='flex-1 p-4' contentContainerStyle={{ paddingBottom: 20 }}>
                {messages.map((message) => (
                    <View key={message.id} className={`mb-3 p-3 rounded-lg max-w-[80%] ${message.sender === 'user' ? "bg-cyan-200 self-end" : "bg-cyan-100 self-start"}`}>
                        <Text className='text-base text-gray-800'>{message.text}</Text>
                        {message.sender === 'ai' &&
                            message.text.includes("[Link](") &&
                            message.text.split("[Link](").slice(1).map((part, index) => {
                                const [url, rest] = part.split(") ");
                                if (url) {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => Linking.openURL(url)}
                                            className='mt-2'
                                        >
                                            <Text className='text-blue-600 text-sm'>🌐Visit {url}</Text>
                                        </TouchableOpacity>
                                    )
                                }
                            })}
                    </View>
                ))}

                {isLoading && (
                    <View className='flex items-center mt-4'>
                        <ActivityIndicator size={"large"} color="#1e90ff" />
                        <Text className='text-gray-600 mt-2'>Fetching suggestions </Text>
                    </View>
                )}
            </ScrollView>

            <View className='p-4 bg-white border-t border-gray-200'>
                <Text className='text-lg font-bold text-gray-800 mb-2'>Quick Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {suggestions?.map((suggestion, index) => (
                        <TouchableOpacity
                            key={index}
                            className='bg-gray-200 px-4 py-2 rounded-full mr-2'
                            onPress={() => handleSuggestion(suggestion)}
                        >
                            <Text>{suggestion}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View className='flex-row items-center p-4 bg-white border-t  border-gray-200'>
                <TextInput
                    className='flex-1 h-10 bg-gray-100 rounded-full px-4 text-base text-gray-800'
                    value={query}
                    onChangeText={setQuery}
                    placeholder='Ask me anything about Fashion..'
                    placeholderTextColor={"#999"}
                />

                <TouchableOpacity
                    onPress={handleSend}
                    disabled={isLoading}
                    className={`ml-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center`}
                >
                    <Ionicons name='send' size={20} color={isLoading ? "#ccc" : "#fff"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default AiAssistantScreen

const styles = StyleSheet.create({})