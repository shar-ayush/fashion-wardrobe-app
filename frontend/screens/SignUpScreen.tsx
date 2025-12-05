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
    const {register} = useAuthStore();

    const handleSignup = async () => {
        if(!email || !password || !username ||  !gender){
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
    <SafeAreaView className='flex-1 bg-white'>
                <KeyboardAvoidingView 
                    
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    className="flex-1"
                >
                    <ScrollView 
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
                        keyboardShouldPersistTaps="handled" // Ensures button taps register while keyboard is open
                        className="p-4"
                    >
                        <Text className='text-2xl font-bold text-center mb-6'>SignUp</Text>
                        
                        <TextInput
                            className='border border-gray-300 p-3 mb-4 rounded-lg'
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            className='border border-gray-300 p-3 mb-4 rounded-lg'
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            
                        />
    
                        <TextInput
                            className='border border-gray-300 p-3 mb-4 rounded-lg'
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            secureTextEntry
                        />

                        <TextInput
                            className='border border-gray-300 p-3 mb-4 rounded-lg'
                            value={gender}
                            onChangeText={setGender}
                            placeholder="Gender"
                            
                        />
                        <TextInput
                            className='border border-gray-300 p-3 mb-4 rounded-lg'
                            value={profileImage}
                            onChangeText={setProfileImage}
                            placeholder="Set Image URL (optional)"
                            
                        />
    
                        <TouchableOpacity onPress={handleSignup} className='bg-blue-500 p-3 rounded-lg mb-4'>
                            <Text className='text-white text-center text-lg'>Sign Up</Text>
                        </TouchableOpacity>
    
                        <TouchableOpacity 
                        //@ts-ignore
                        onPress={() => navigation.goBack()}>
                            <Text className='text-blue-500 text-center text-lg'>
                                    Already have an account? Sign In
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
  )
}

export default SignUpScreen

const styles = StyleSheet.create({})