import { useRoute } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchBuses } from '../service/requests/bus'
import { goBack, navigate } from '../utils/NavigationUtils'

const BusListScreen = () => {
    const route = useRoute()
    const params = route?.params as any
    const { from, to, date } = params?.item || {}

    const { data: buses, isLoading, error } = useQuery({
        queryKey: ['buses', from, to, date],
        queryFn: () => fetchBuses(from, to, date),
        enabled: !!from && !!to && !!date
    })

    const renderItem = ({ item }: { item: any }) => {
       return <TouchableOpacity
            className='bg-white mb-4 p-4 rounded-lg  shadow-lg border-b border-b-slate-200'
            onPress={() => navigate('SeatSelectionScreen', { busId: item?.busId })}
        >
            <Image 
                source={require('../assets/images/sidebus.png')}
                className='h-6 w-8'
            />
            <Text className='text-lg font-bold text-gray-900'>{item.company}</Text>
            <Text className='text-sm text-gray-500'>{item.busType}</Text>
            
            <View className='flex-row justify-between mt-2'>
                <Text className='text-lg font-semibold text-gray-700'>
                    {new Date(item.departureTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}{' '}
                    -
                    {new Date(item.arrivalTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                </Text>

                <Text className='text-sm text-gray-500'>{item.duration}</Text>

            </View>

            <View className='flex-row justify-between mt-2 items-center'>
                <Text className='text-md text-green-600 font-bold'>₹{ item.price}</Text>
                <Text className='text-xs text-gray-400 line-through'>₹{item.originalPrice}</Text>
                <Text>
                    {item?.seats?.flat().filter((seat:any) => !seat.booked).length} Seats
                </Text>
            </View>
        </TouchableOpacity>
    }
    return (
        <View className='flex-1 bg-white'>
            <SafeAreaView />
            <View className='bg-white p-4 flex-row items-center border-b-[1px] border-teal-800'>
                <TouchableOpacity onPress={goBack}>
                    <ArrowLeftIcon size={24} color={"#000"} />
                </TouchableOpacity>
                <View className='ml-4'>
                    <Text className='text-lg font-bold'>
                        {from} → {to}
                    </Text>
                    <Text className='text-sm text-gray-500'>{date?.toDateString()}</Text>
                </View>
            </View>

            {isLoading && (
                <View className='flex-1 justify-center items-center'>
                    <ActivityIndicator size="large" color="teal" />
                    <Text>Loading buses...</Text>
                </View>
            )}

            {error && (
                <View className='flex-1 justify-center items-center'>
                    <Text className='text-red-500 font-bold'>Failed to load buses.</Text>
                </View>
            )}

            {!error && !isLoading && buses?.length === 0 && (
                <View className='flex-1 justify-center items-center'>
                    <Text className='text-gray-500 font-bold'>No buses available.</Text>
                </View>
            )}

            <FlatList
                data={buses}
                keyExtractor={item => item.busId}
                renderItem={renderItem}
                contentContainerStyle={{padding: 16}}
            />
        </View>
    )
}

export default BusListScreen