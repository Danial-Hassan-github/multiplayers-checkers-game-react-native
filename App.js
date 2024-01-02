import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native'
import CheckerBoard from './Checker';
import React, { useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import Overlay from './OverlayComponent';
import Login from './LoginComponent';
import Signup from './SignupComponent';

export default function App() {
  return (
    //<Overlay/>
    <CheckerBoard/>
    //<Login/>
    //<Signup/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5f0ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blue: {
    backgroundColor: '#f7f6f5',
    display:'flex',
    flexDirection:'row',
    flexWrap:'wrap',
    borderTopColor: "#8a430c",
    borderBottomColor: "#d98341",
    borderLeftColor: "#d98341",
    borderRightColor: "#8a430c",
    borderWidth: 5,
    width: 410,
    height: 407,
  },
});