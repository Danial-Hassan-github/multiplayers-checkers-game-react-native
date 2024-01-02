import React, { useState } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';

const Overlay = ({check}) => {
  return (
    <View >

      <Modal
        visible={check}
        transparent
        animationType="fade"
      >
        <View style={styles.overlayContainer}>
          <View style={styles.overlayContent}>
            <Text>Waiting for player to join...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
});

export default Overlay;
