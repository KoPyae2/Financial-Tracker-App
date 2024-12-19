import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, Animated } from "react-native";
import { useStore } from "@/store/useStore";
import { themes } from "@/types/theme";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DateRangePickerModal } from "@/components/DateRangePickerModal";
import { useRouter } from 'expo-router';
import ChartItem from "@/components/ChartItem";

type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';
type TimeRange = 'month' | 'year';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (range: { startDate: Date; endDate: Date }) => void;
    initialRange: { startDate: Date; endDate: Date };
}

// Update the EmptyState component to support dark mode
const EmptyState = ({ message, isChart = false }: { message: string, isChart: boolean }) => {
    const { theme } = useStore();
    const themeColors = themes[theme];

    return (
        <View className="flex-1 h-[300px] justify-center items-center py-8">
            {
                isChart && (
                    <View className="absolute top-0 left-4 w-full h-[86%] px-4">
                        {[0, 16.67, 33.33, 50, 66.67, 83.33, 100].map((tick) => (
                            <View
                                key={tick}
                                style={{
                                    borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    bottom: `${tick}%`
                                }}
                                className="absolute w-full border-b"
                            >
                                <Text
                                    style={{ color: themeColors.text.secondary }}
                                    className="left-0 -mt-2 text-[10px] font-medium"
                                >
                                    {Math.round(tick)}%
                                </Text>
                            </View>
                        ))}
                    </View>
                )
            }
            <FontAwesome
                name="bar-chart"
                size={40}
                color={theme === 'dark' ? '#475569' : '#CBD5E1'}
            />
            <Text style={{ color: themeColors.text.secondary }} className="mt-4 text-center">
                {message}
            </Text>
        </View>
    );
};

// Add type for summary data
type SummaryPeriod = 'day' | 'week' | 'month';

export default function Analytics() {
    const {
        transactions,
        categories,
        showBalance,
        formatAmount,
        theme
    } = useStore();

    const themeColors = themes[theme];
    const [selectedTab, setSelectedTab] = useState<'expenses' | 'income'>('expenses');
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
    });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const router = useRouter();
    const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
    const [barHeights] = useState(new Animated.Value(0));

    // Update the filteredData calculation
    const filteredData = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const isCorrectType = selectedTab === 'income' ?
                transaction.type === 'income' :
                transaction.type === 'expense';

            if (!isCorrectType) return false;

            switch (filterPeriod) {
                case 'today':
                    return transactionDate >= now;
                case 'week': {
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - 7);
                    return transactionDate >= weekStart;
                }
                case 'month': {
                    const monthStart = new Date(now);
                    monthStart.setMonth(now.getMonth() - 1);
                    return transactionDate >= monthStart;
                }
                case 'year': {
                    const yearStart = new Date(now);
                    yearStart.setFullYear(now.getFullYear() - 1);
                    return transactionDate >= yearStart;
                }
                case 'custom': {
                    const start = new Date(dateRange.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(dateRange.endDate);
                    end.setHours(23, 59, 59, 999);
                    return transactionDate >= start && transactionDate <= end;
                }
                default:
                    return true;
            }
        });
    }, [transactions, selectedTab, filterPeriod, dateRange]);

    // Update the chart data calculation
    const chartData = useMemo(() => {
        // Get total amount for the selected type (income or expense)
        const totalAmount = filteredData.reduce((sum, t) => sum + t.amount, 0);

        // First, create a map of all categories with 0 amounts
        const categoryAmounts = new Map(
            categories
                .filter(cat => selectedTab === 'income' ? cat.isIncome : !cat.isIncome)
                .map(cat => [cat.id, { amount: 0, count: 0, category: cat }])
        );

        // Then update amounts for categories that have transactions
        filteredData.forEach(transaction => {
            const categoryData = categoryAmounts.get(transaction.categoryId);
            if (categoryData) {
                categoryData.amount += transaction.amount;
                categoryData.count += 1;
            }
        });

        // Convert to array, filter out zero amounts, and calculate percentages
        return Array.from(categoryAmounts.values())
            .filter(({ amount }) => amount > 0) // Only include categories with transactions
            .map(({ amount, count, category }) => ({
                id: category.id,
                name: category.name,
                amount,
                count,
                percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
                color: category.color,
                icon: category.icon
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [filteredData, categories, selectedTab]);

    console.log(chartData);


    // Update summary amounts to show all-time totals
    const summaryData = useMemo(() => {
        const now = new Date();
        const today = now.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);

        return filteredData.reduce((acc, transaction) => {
            const transactionDate = new Date(transaction.date);

            if (transactionDate.getTime() >= today) {
                acc.day += transaction.amount;
            }
            if (transactionDate >= weekAgo) {
                acc.week += transaction.amount;
            }
            acc.month += transaction.amount; // This will now be total of all time

            return acc;
        }, { day: 0, week: 0, month: 0 });
    }, [filteredData]);

    // Update category totals to show all-time data
    const categoryData = useMemo(() => {
        const categoryTotals = new Map<string, {
            amount: number;
            category: typeof categories[0];
        }>();

        const totalAmount = filteredData.reduce((sum, t) => sum + t.amount, 0);

        filteredData.forEach(transaction => {
            const category = categories.find(c => c.id === transaction.categoryId);
            if (category) {
                const current = categoryTotals.get(category.id);
                if (current) {
                    current.amount += transaction.amount;
                } else {
                    categoryTotals.set(category.id, { amount: transaction.amount, category });
                }
            }
        });

        return Array.from(categoryTotals.values())
            .map(({ amount, category }) => ({
                name: category.name,
                amount,
                percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
                color: category.color + '20',
                icon: category.icon
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
    }, [filteredData, categories]);

    const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
        setDateRange(range);
        setFilterPeriod('custom');
        setDatePickerVisible(false);
        setShowFilterDropdown(false);
    };

    // Add check for empty data
    const hasData = chartData.length > 0;

    // Animate bars when data changes
    const animateBars = () => {
        Animated.spring(barHeights, {
            toValue: 1,
            useNativeDriver: false,
            tension: 40,
            friction: 8
        }).start();
    };

    // Reset and start animation when range changes
    const handleRangeChange = (range: TimeRange) => {
        barHeights.setValue(0);
        setSelectedRange(range);
        animateBars();
    };

    const stats = useMemo(() => {
        const now = new Date();
        const periods = selectedRange === 'month' ? 30 : 12;
        const periodData = new Array(periods).fill(0).map((_, index) => {
            const date = new Date();
            if (selectedRange === 'month') {
                date.setDate(now.getDate() - index);
            } else {
                date.setMonth(now.getMonth() - index);
            }
            return {
                date,
                income: 0,
                expenses: 0
            };
        }).reverse();

        transactions.forEach(transaction => {
            const txDate = new Date(transaction.date);
            const periodIndex = selectedRange === 'month'
                ? periods - 1 - Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24))
                : periods - 1 - (now.getMonth() - txDate.getMonth() + (now.getFullYear() - txDate.getFullYear()) * 12);

            if (periodIndex >= 0 && periodIndex < periods) {
                if (transaction.type === 'income') {
                    periodData[periodIndex].income += transaction.amount;
                } else {
                    periodData[periodIndex].expenses += transaction.amount;
                }
            }
        });

        return periodData;
    }, [transactions, selectedRange]);

    const maxAmount = Math.max(
        ...stats.map(data => Math.max(data.income, data.expenses))
    );

    // Start animation when component mounts
    useEffect(() => {
        animateBars();
    }, []);

    return (
        <ScrollView
            style={{ backgroundColor: themeColors.background }}
            className="flex-1"
            showsVerticalScrollIndicator={false}
        >
            {/* Header Tabs */}
            <View className="flex-row justify-between items-center p-4">
                <View style={{ backgroundColor: themeColors.cardAlt }} className="flex-row flex-1 p-1 rounded-full">
                    <TouchableOpacity
                        style={{ backgroundColor: selectedTab === 'expenses' ? themeColors.card : 'transparent' }}
                        className="flex-1 py-3 rounded-full"
                        onPress={() => setSelectedTab('expenses')}
                    >
                        <Text style={{ color: themeColors.text.primary }} className="font-semibold text-center">
                            Expenses
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ backgroundColor: selectedTab === 'income' ? themeColors.card : 'transparent' }}
                        className="flex-1 py-3 rounded-full"
                        onPress={() => setSelectedTab('income')}
                    >
                        <Text style={{ color: themeColors.text.primary }} className="font-semibold text-center">
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Dropdown Button */}
                <TouchableOpacity
                    style={{ backgroundColor: themeColors.cardAlt }}
                    className="flex-row items-center px-4 py-2 ml-4 rounded-full"
                    onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                    <Text style={{ color: themeColors.text.primary }} className="mr-2 font-semibold">
                        {filterPeriod === 'custom'
                            ? 'Custom Range'
                            : filterPeriod === 'today'
                                ? 'Today'
                                : filterPeriod === 'week'
                                    ? 'This Week'
                                    : filterPeriod === 'year'
                                        ? 'This Year'
                                        : 'This Month'}
                    </Text>
                    <FontAwesome
                        name={showFilterDropdown ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={themeColors.text.primary}
                    />
                </TouchableOpacity>

                {/* Filter Dropdown Menu */}
                {showFilterDropdown && (
                    <View
                        style={{ backgroundColor: themeColors.card }}
                        className="absolute right-0 top-12 z-50 w-48 rounded-lg shadow-lg"
                    >
                        {['Today', 'This Week', 'This Month', 'This Year', 'Custom Range'].map((option, index) => (
                            <TouchableOpacity
                                key={option}
                                style={{
                                    borderBottomWidth: index < 4 ? 1 : 0,
                                    borderBottomColor: themeColors.border
                                }}
                                className="p-4"
                                onPress={() => {
                                    if (option === 'Custom Range') {
                                        setDatePickerVisible(true);
                                    } else {
                                        setFilterPeriod(option.toLowerCase().replace('this ', '') as FilterPeriod);
                                    }
                                    setShowFilterDropdown(false);
                                }}
                            >
                                <Text style={{ color: themeColors.text.primary }}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Chart Section */}
            <View className="mt-2">
                {hasData ? (
                    <>
                        <View className="ml-4 h-6">
                            <Text
                                style={{ color: themeColors.text.secondary }}
                                className="text-xs font-medium"
                            >
                                100%
                            </Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                        >
                            <View className="h-[300px] flex-row relative" style={{ minWidth: '100%' }}>
                                <View className="absolute top-0 left-0 w-full h-[86%]">
                                    {[0, 16.67, 33.33, 50, 66.67, 83.33, 100].map((tick) => (
                                        <View
                                            key={tick}
                                            style={{
                                                borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                bottom: `${tick}%`
                                            }}
                                            className="absolute w-full border-b"
                                        >
                                            <Text
                                                style={{ color: themeColors.text.secondary }}
                                                className="left-0 -mt-2 text-[10px] font-medium"
                                            >
                                                {Math.round(tick)}%
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {chartData.map((item, index) => (
                                    <ChartItem
                                        key={item.id}
                                        item={item}
                                        themeColors={themeColors}
                                        chartData={chartData}
                                        theme={theme}
                                        index={index}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    </>
                ) : (
                    <EmptyState message={`No ${selectedTab} data for the selected period`} isChart={true} />
                )}
            </View>

            {/* Summary Cards */}
            <View className="flex-row justify-between px-4 mt-6">
                {['Day', 'Week', 'Month'].map((period) => (
                    <View
                        key={period}
                        style={{ backgroundColor: themeColors.cardAlt }}
                        className={`flex-1 p-4 rounded-2xl ${period === 'Day' ? 'mr-2' : period === 'Week' ? 'mx-2' : 'ml-2'
                            }`}
                    >
                        <Text
                            style={{ color: themeColors.text.secondary }}
                            className="text-xs font-medium"
                        >
                            {period}
                        </Text>
                        <Text
                            style={{ color: themeColors.text.primary }}
                            className="mt-1 text-lg font-bold"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {showBalance ? formatAmount(summaryData[period.toLowerCase() as SummaryPeriod]) : '****'}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Category List */}
            <View className="px-4 mt-6 mb-6">
                {hasData ? (
                    chartData.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => {
                                console.log('Navigating with params:', {
                                    categoryId: category.id,
                                    filterPeriod,
                                    startDate: filterPeriod === 'custom' ? dateRange.startDate.toISOString() : undefined,
                                    endDate: filterPeriod === 'custom' ? dateRange.endDate.toISOString() : undefined
                                });

                                router.push({
                                    pathname: "/category-transactions",
                                    params: {
                                        categoryId: category.id,
                                        filterPeriod,
                                        startDate: filterPeriod === 'custom' ? dateRange.startDate.toISOString() : undefined,
                                        endDate: filterPeriod === 'custom' ? dateRange.endDate.toISOString() : undefined
                                    }
                                });
                            }}
                            style={{
                                backgroundColor: theme === 'dark'
                                    ? `${category.color}15`
                                    : `${category.color}10`
                            }}
                            className="p-4 mb-4 w-full rounded-2xl"
                        >
                            <View className="flex-row items-center mb-3">
                                <View
                                    style={{
                                        backgroundColor: theme === 'dark'
                                            ? `${category.color}30`
                                            : `${category.color}20`
                                    }}
                                    className="justify-center items-center mr-3 w-10 h-10 rounded-full"
                                >
                                    <FontAwesome
                                        name={category.icon as any}
                                        size={20}
                                        color={category.color}
                                    />
                                </View>
                                <Text
                                    style={{ color: themeColors.text.primary }}
                                    className="text-lg font-semibold"
                                >
                                    {category.name}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-end">
                                <Text
                                    style={{ color: themeColors.text.secondary }}
                                    className="flex-shrink text-sm"
                                >
                                    {category.count} transaction{category.count !== 1 ? 's' : ''}
                                </Text>
                                <View className="flex-shrink-0 items-end ml-4">
                                    <Text
                                        style={{ color: themeColors.text.primary }}
                                        className="text-xl font-bold"
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {showBalance ? formatAmount(category.amount) : '****'}
                                    </Text>
                                    <Text
                                        style={{ color: themeColors.text.secondary }}
                                        className="mt-1 text-sm"
                                    >
                                        {category.percentage}%
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <EmptyState
                        message={`No ${selectedTab.toLowerCase()} transactions found for the selected period`}
                        isChart={false}
                    />
                )}
            </View>

            <DateRangePickerModal
                visible={datePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                onSave={handleDateRangeChange}
                initialRange={dateRange}
            />
        </ScrollView>
    );
}


