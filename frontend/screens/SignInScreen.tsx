import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
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
    const { login } = useAuthStore();

    const handleSignin = async () => {
        if (!email || !password) {
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
                        WELCOME TO
                    </Text>
                    <Text className='text-4xl font-extrabold text-center text-espresso mb-8'>
                        Outfit AI
                    </Text>

                    {/* TITLE */}
                    <Text className='text-xl font-semibold text-espresso text-center mb-6'>
                        Sign In
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

                    {/* PASSWORD */}
                    <TextInput
                        className='bg-white border border-sand p-4 mb-6 rounded-xl text-espresso'
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#a89880"
                        secureTextEntry
                    />

                    {/* BUTTON */}
                    <TouchableOpacity
                        onPress={handleSignin}
                        className='bg-espresso py-4 rounded-xl mb-4 items-center'
                    >
                        <Text className='text-ivory text-lg font-bold tracking-[2px]'>
                            SIGN IN
                        </Text>
                    </TouchableOpacity>

                    {/* SIGNUP */}
                    <TouchableOpacity
                        //@ts-ignore
                        onPress={() => navigation.navigate('SignUp')}
                    >
                        <Text className='text-center text-mocha'>
                            Don't have an account?{" "}
                            <Text className='text-terracotta font-semibold'>
                                Sign Up
                            </Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default SignInScreen

const styles = StyleSheet.create({})