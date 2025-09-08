import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon, StarIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentButton from '../components/ui/PaymentButton';
import Seat from '../components/ui/Seat';
import TicketModal from '../components/ui/TicketModal';
import { bookTicket, fetchBusDetails } from '../service/requests/bus';
import { goBack, resetAndNavigate } from '../utils/NavigationUtils';

const SeatSelectionScreen = () => {
    const [ticketVisible, setTicketVisible] = useState(false)
    const [selectedSeats, setSelectedSeats] = useState<number[]>([])

    const route = useRoute();
    const { busId } = route.params as { busId: string }

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['busDetails', busId],
        queryFn: () => fetchBusDetails(busId)
    })

    const busInfo = data;

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [busId])
    )

    const bookTicketMutation = useMutation({
        mutationFn: (ticketData: {
            busId: string;
            date: string;
            seatNumbers: number[];
        }) => bookTicket(ticketData),
        onSuccess: data => {
            console.log("Ticket booked successfully: ", data)
            setTicketVisible(true)
        },
        onError: error => {
            console.error("Error booking ticket: ", error);
            Alert.alert("Failed to book ticket. Please try again")
        }
    })

    const handleSeatSelection = (seat_id: number) => {
        setSelectedSeats(prev => prev.includes(seat_id)
            ? prev.filter(id => id !== seat_id)
            : [...prev, seat_id]
        )
    }

    const handleOnPay = () => {
        if (selectedSeats.length === 0) {
            Alert.alert("Please select at least one seat.")
            return;
        }
        bookTicketMutation.mutate({
            busId,
            date: new Date(busInfo.departureTime).toISOString(),
            seatNumbers: selectedSeats
        })
    }

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size="large" color="teal" />
                <Text className='text-gray-500 mt-2'>Loading bus details...</Text>
            </View>
        )
    }

    if (isError) {
        return (
            <View className='flex-1 items-center justify-center'>
                <Text className='text-red-500'>Failed to load bus details.</Text>
                <TouchableOpacity onPress={() => goBack()}>
                    <Text className='text-blue-500'>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }



    return (
        <View className='bg-white flex-1'>
            <SafeAreaView />
            <View className='bg-white p-4 flex-row items-center border-b border-teal-400'>
                <TouchableOpacity onPress={() => goBack()}>
                    <ArrowLeftIcon size={24} color="#000" />
                </TouchableOpacity>

                <View>
                    <Text className='text-lg font-bold'>Seat Selection</Text>
                    <Text className='text-sm text-gray-500'>
                        {busInfo?.from} → {busInfo?.to}
                    </Text>
                    <Text className='text-sm text-gray-500'>
                        {new Date(busInfo.departureTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })}{' '}
                        {new Date(busInfo.departureTime).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 200 }}
                className='pb-20 bg-teal-100 p-4'
            >
                <Seat
                    selectedSeats={selectedSeats}
                    seats={busInfo?.seats}
                    onSeatSelect={handleSeatSelection}
                />

                <View className='bg-white rounded-lg p-4 drop-shadow-sm'>
                    <View className='flex-row justify-between items-center mb-2'>
                        <Text className='text-lg font-semibold'>{busInfo.company}</Text>
                        <View className='flex-row items-center'>
                            <StarIcon size={18} color="gold" />
                            <Text className='ml-1 text-gray-600 text-sm'>
                                {busInfo?.rating} ({busInfo?.totalReviews})
                            </Text>
                        </View>
                    </View>

                    <Text className='text-sm text-gray-600 mb-1'>{busInfo?.busType}</Text>

                    <View className='flex-row justify-between mt-2'>
                        <View className='items-center'>
                            <Text className='text-lg font-bold'>
                                {new Date(busInfo?.departureTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </Text>
                            <Text className='text-sm text-gray-500'>Arrival</Text>
                        </View>
                    </View>

                    <Text className='mt-3 text-green-600 text-sm'>
                        <Text className='mt-3 text-green-600 text-sm'>
                            {
                                busInfo?.seats?.flat().filter((seat: any) => !seat.booked).length
                            }
                            Seats Available
                        </Text>
                        Seats Available
                    </Text>

                    <View>
                        <Text className='text-gray-400 line-through text-lg'>
                            ₹{busInfo?.originalPrice}
                        </Text>
                        <Text className='text-xl font-bold text-black ml-2'>
                            ₹{busInfo?.price} (1/p)
                        </Text>
                    </View>

                    <View className='flex-row gap-x-2 mt-1'>
                        {busInfo?.badges?.map((badge: string, index: number) => (
                            <View
                                key={index}
                                className='bg-yellow-200 px-2 py-1 rounded-full'
                            >
                                <Text className='text-xs text-yellow-800 font-semibold'>
                                    {badge}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <PaymentButton
                seat={selectedSeats.length}
                price={busInfo.price}
                onPay={handleOnPay}
            />

            {ticketVisible &&
                <TicketModal
                    bookingInfo={{
                        from: busInfo.from,
                        to: busInfo.to,
                        departureTime: new Date(busInfo.departureTime).toLocaleTimeString(
                            [],
                            {
                                hour: '2-digit',
                                minute: '2-digit'
                            }
                        ),
                        arrivalTime: new Date(busInfo.arrivalTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        date: new Date(busInfo.departureTime).toDateString(),
                        company: busInfo.company,
                        busType: busInfo.busType,
                        seats: bookTicketMutation.data?.seatNumbers,
                        ticketNumber: bookTicketMutation.data?._id || "xxxxxxxxx",
                        pnr: bookTicketMutation.data?.pnr || "xxxxxxxxx",
                        fare: bookTicketMutation.data?.total_fare
                    }}
                    onClose={() => {
                        console.log("clicked")
                        resetAndNavigate("HomeScreen")
                        setTicketVisible(false)
                    }}
                    visible={ticketVisible}
                />
            }
        </View>
    )
}

export default SeatSelectionScreen