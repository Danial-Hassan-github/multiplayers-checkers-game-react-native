import React, { useState } from 'react';
import { View, TextInput, Button, Text,StyleSheet } from 'react-native';

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // Perform signup logic here
    console.log('Signing up...');
  };

  const handleLogin = () => {
    // Navigate to the login page
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text>Signup Page</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)}
      />
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
      <Button title="Signup" onPress={handleSignup} />
      <Text>Already have an account?</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default Signup;
const styles=StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c5f0ed',
        alignItems: 'center',
        justifyContent: 'center',
      }
});