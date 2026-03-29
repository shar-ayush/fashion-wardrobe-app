import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../store/authStore';

const SignUpScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [gender, setGender] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [profileImage, setProfileImage] = React.useState('');
    const { register } = useAuthStore();

    const handleSignup = async () => {
        if (!email || !password || !username || !gender) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        try {
            await register(email, password, username, gender, profileImage);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            Alert.alert('Error', message || 'Something went wrong during signup');
        }
    }

    return (
        <SafeAreaView className='flex-1 bg-ivory'>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    className="px-6"
                >

                    {/* APP NAME */}
                    <Text className='text-center text-taupe tracking-[4px] text-xs mb-2'>
                        CREATE ACCOUNT
                    </Text>

                    <Text className='text-4xl font-extrabold text-center text-espresso mb-8'>
                        Outfit AI
                    </Text>

                    {/* TITLE */}
                    <Text className='text-xl font-semibold text-espresso text-center mb-6'>
                        Sign Up
                    </Text>

                    {/* EMAIL */}
                    <TextInput
                        className='bg-white border border-sand p-4 mb-4 rounded-xl text-espresso'
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="#a89880"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    {/* USERNAME */}
                    <TextInput
                        className='bg-white border border-sand p-4 mb-4 rounded-xl text-espresso'
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Username"
                        placeholderTextColor="#a89880"
                    />

                    {/* PASSWORD */}
                    <TextInput
                        className='bg-white border border-sand p-4 mb-4 rounded-xl text-espresso'
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#a89880"
                        secureTextEntry
                    />

                    {/* GENDER */}
                    <TextInput
                        className='bg-white border border-sand p-4 mb-4 rounded-xl text-espresso'
                        value={gender}
                        onChangeText={setGender}
                        placeholder="Gender"
                        placeholderTextColor="#a89880"
                    />

                    {/* PROFILE IMAGE */}
                    <TextInput
                        className='bg-white border border-sand p-4 mb-6 rounded-xl text-espresso'
                        value={profileImage}
                        onChangeText={setProfileImage}
                        placeholder="Set Image URL (optional)"
                        placeholderTextColor="#a89880"
                    />

                    {/* BUTTON */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        className='bg-espresso py-4 rounded-xl mb-4 items-center'
                    >
                        <Text className='text-ivory text-lg font-bold tracking-[2px]'>
                            SIGN UP
                        </Text>
                    </TouchableOpacity>

                    {/* SIGN IN */}
                    <TouchableOpacity
                        //@ts-ignore
                        onPress={() => navigation.goBack()}
                    >
                        <Text className='text-center text-mocha'>
                            Already have an account?{" "}
                            <Text className='text-terracotta font-semibold'>
                                Sign In
                            </Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default SignUpScreen

const styles = StyleSheet.create({})