import React, { useState } from 'react';
import { View, TextInput, Button, Text,StyleSheet } from 'react-native';

const Login= ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Perform login logic here
    console.log('Logging in...');
  };

  const handleSignup = () => {
    // Navigate to the signup page
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Text>Login Page</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={text => setPassword(text)}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text>Don't have an account?</Text>
      <Button title="Signup" onPress={handleSignup} />
    </View>
  );
};

export default Login;
const styles=StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c5f0ed',
        alignItems: 'center',
        justifyContent: 'center',
      }
});