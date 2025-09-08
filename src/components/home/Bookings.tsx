import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { fetchUserTickets } from '../../service/requests/bus';
import { tabs } from '../../utils/dummyData';
import BookItem from './BookItem';
import Search from './Search';

const Bookings = () => {
    const [selectedTab, setSelectedTab] = useState("All");
    const [refreshing, setRefreshing] = useState(false);

    const { data: tickets, isLoading, isError, refetch, error } = useQuery({
        queryKey: ['userTickets'],
        queryFn: fetchUserTickets,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: true
    })

    useFocusEffect(useCallback(() => {
        refetch()
    }, [refetch]))

    const onRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    const filteredBookings = selectedTab === "All" ? tickets : tickets.filter((ticket: any) => ticket.status === selectedTab)

    if (isLoading) {
        return (
            <View className='flex- items-center justify-center bg-white'>
                <ActivityIndicator size="large" color="teal" />
                <Text className='text-gray-500 mt-2'>Fetching bookings...</Text>
            </View>
        )
    }

    // if (isError) {
    //     return (
    //         <View className='items-center justify-center bg-white'>
    //             <Text className='text-red-500'>Failed to fetch bookings. {error.message} </Text>
    //             <TouchableOpacity onPress={() => refetch()} className='mt-4 py-2 px-3 bg-blue-500 rounded'>
    //                 <Text className='text-white font-semibold'>Retry</Text>
    //             </TouchableOpacity>
    //         </View>
    //     )
    // }

    return (
        <View className='flex-1 p-2 bg-white'>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredBookings}
                keyExtractor={item => item._id}
                nestedScrollEnabled
                ListHeaderComponent={
                    <>
                        <Search />
                        <Text className='text-2xl font-bold my-4'>
                            Past Bookings
                        </Text>

                        <View className='flex-row mb-4'>
                            {tabs?.map((tab) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedTab(tab)}
                                    key={tab}
                                    className={`px-4 py-2 rounded-lg mx-1 ${selectedTab === tab ? 'bg-red-500' : 'bg-gray-300'}`}>
                                    <Text className={`text-sm font-bold ${selectedTab == tab ? 'text-white' : 'text-black'}`}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View className='items-center mt-6'>
                        <Text className='text-gray-500'>No bookings found.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => <BookItem item={item} />}
            />
        </View>
    )
}

export default Bookings