import { View, Text } from 'react-native'
import React, { FC } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import SplashScreen from '../screens/SplashScreen'
import LoginScreen from '../screens/LoginScreen'
import { navigationRef } from '../utils/NavigationUtils'
import HomeScreen from '../screens/HomeScreen'

const Stack = createNativeStackNavigator()

const Navigation:FC  = () => {
  return (
      <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
              initialRouteName='SplashScreen'
              screenOptions={{
                  headerShown: false
              }}
          >
              <Stack.Screen name="SplashScreen" component={SplashScreen}/>
              <Stack.Screen name="LoginScreen" component={LoginScreen}/>
              <Stack.Screen name="HomeScreen" component={HomeScreen}/>
          </Stack.Navigator>
   </NavigationContainer>
  )
}

export default Navigation