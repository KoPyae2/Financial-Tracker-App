import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { themes, ThemeType } from '@/types/theme';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabHeader = ({ title, theme, showBalance, balance, formatAmount }: {
    title: string;
    theme: ThemeType;
    showBalance?: boolean;
    balance?: number;
    formatAmount?: (amount: number) => string;
}) => {
    const insets = useSafeAreaInsets();
    const themeColors = themes[theme];

    return (
        <View
            style={{
                backgroundColor: themeColors.card,
                paddingTop: insets.top+14,
            }}
            className="px-4 pb-4 border-b"
        >
            <View className="flex-row justify-between items-center">
                <Text
                    style={{ color: themeColors.text.primary }}
                    className="text-2xl font-bold"
                >
                    {title}
                </Text>
                {balance !== undefined && formatAmount && (
                    <View
                        style={{ backgroundColor: themeColors.cardAlt }}
                        className="px-4 py-2 rounded-xl"
                    >
                        <Text
                            style={{ color: themeColors.text.primary }}
                            className="text-base font-semibold"
                        >
                            {showBalance ? formatAmount(balance) : '****'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default function TabLayout() {
    const { theme, showBalance, balance, formatAmount } = useStore();
    const themeColors = themes[theme];

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: themeColors.text.accent,
                tabBarInactiveTintColor: themeColors.text.secondary,
                tabBarStyle: {
                    backgroundColor: themeColors.card,
                    borderTopColor: themeColors.border,
                },
                header: ({ route }) => {
                    const title = (() => {
                        switch (route.name) {
                            case 'index':
                                return 'Dashboard';
                            case 'transactions':
                                return 'Transactions';
                            case 'analytics':
                                return 'Analytics';
                            case 'settings':
                                return 'Settings';
                            default:
                                return '';
                        }
                    })();

                    // Only show balance in Dashboard and Transactions tabs
                    const showBalanceInHeader = ['index', 'transactions'].includes(route.name);

                    return (
                        <TabHeader
                            title={title}
                            theme={theme}
                            showBalance={showBalanceInHeader ? showBalance : undefined}
                            balance={showBalanceInHeader ? balance.total : undefined}
                            formatAmount={showBalanceInHeader ? formatAmount : undefined}
                        />
                    );
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color }) => <FontAwesome name="exchange" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color }) => <FontAwesome name="bar-chart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
} 