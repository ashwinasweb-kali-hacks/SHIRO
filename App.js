import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { AuthProvider } from './Context/AuthContext';
import ChatScreen from './Frontend/Screens/ChatScreen';
import ImageStudioScreen from './Frontend/Screens/ImageStudioScreen';
import VideoStudioScreen from './Frontend/Screens/VideoStudioScreen';
import QRStudioScreen from './Frontend/Screens/QRStudioScreen';
import HomeScreen from './Frontend/Screens/Home';
import ProfileScreen from './Frontend/Screens/Profile';
import SettingsScreen from './Frontend/Screens/Settings';
import ConnectionSettings from './Frontend/Screens/ConnectionSettings';
import ModelManagementScreen from './Frontend/Screens/ModelManagementScreen';

const App = () => {
  const [currentTab, setCurrentTab] = useState('home');

  const renderScreen = () => {
    switch (currentTab) {
      case 'home': return <HomeScreen />;
      case 'chat': return <ChatScreen />;
      case 'image': return <ImageStudioScreen />;
      case 'video': return <VideoStudioScreen />;
      case 'qr': return <QRStudioScreen />;
      case 'profile': return <ProfileScreen />;
      case 'settings': return <SettingsScreen />;
      case 'connection': return <ConnectionSettings />;
      case 'models': return <ModelManagementScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderScreen()}
        </View>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => setCurrentTab('home')} style={[styles.navItem, currentTab === 'home' && styles.activeNav]}>
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('chat')} style={[styles.navItem, currentTab === 'chat' && styles.activeNav]}>
            <Text style={styles.navText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('image')} style={[styles.navItem, currentTab === 'image' && styles.activeNav]}>
            <Text style={styles.navText}>Image</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('video')} style={[styles.navItem, currentTab === 'video' && styles.activeNav]}>
            <Text style={styles.navText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('qr')} style={[styles.navItem, currentTab === 'qr' && styles.activeNav]}>
            <Text style={styles.navText}>QR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('profile')} style={[styles.navItem, currentTab === 'profile' && styles.activeNav]}>
            <Text style={styles.navText}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('connection')} style={[styles.navItem, currentTab === 'connection' && styles.activeNav]}>
            <Text style={styles.navText}>Link</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentTab('models')} style={[styles.navItem, currentTab === 'models' && styles.activeNav]}>
            <Text style={styles.navText}>Models</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { flex: 1 },
  navbar: { flexDirection: 'row', backgroundColor: '#12121a', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  navItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeNav: { borderTopWidth: 2, borderTopColor: '#7c6aff' },
  navText: { color: '#e8e8f0', fontSize: 12 },
});

export default App;
