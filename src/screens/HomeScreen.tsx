import React from 'react';
import { Text, View } from 'react-native';
import { UserCircleIcon } from "react-native-heroicons/solid";
import { SafeAreaView } from 'react-native-safe-area-context';
import Bookings from '../components/home/Bookings';
import { logout } from '../service/requests/auth';
const HomeScreen = () => {
  return (
    <View className='flex-1 bg-white'>
      <SafeAreaView />
      <View className='flex-row justify-between items-center px-4 py-2'>
        <Text className='font-okra font-semibold text-3xl'>
          Bus Tickets
        </Text>

        <UserCircleIcon color="red" size={38} onPress={logout} />
      </View>

      <Bookings />
    </View>
  )
}

export default HomeScreen