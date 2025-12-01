import { 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    KeyboardAvoidingView, 
    ScrollView, // Import ScrollView
    Platform, // Import Platform
    Alert
} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../store/authStore';

const SignInScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const {login} = useAuthStore();

    const handleSignin = async () => {
        if(!email || !password){
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            Alert.alert('Error', message || 'Something went wrong during signin');
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
                    <Text className='text-2xl font-bold text-center mb-6'>SignIn</Text>
                    
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
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        secureTextEntry
                    />

                    <TouchableOpacity onPress={handleSignin} className='bg-blue-500 p-3 rounded-lg mb-4'>
                        <Text className='text-white text-center text-lg'>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                    //@ts-ignore
                    onPress={() => navigation.navigate('SignUp')}>
                        <Text className='text-blue-500 text-center text-lg'>
                            Don't have an account? Sign Up
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default SignInScreen

const styles = StyleSheet.create({})