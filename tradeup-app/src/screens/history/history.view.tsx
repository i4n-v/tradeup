import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PT_BR } from '@/i18n/pt-BR';
import type {
  TransactionFailureReason,
  TransactionStatus,
} from '@/resources/services/trade/dtos/trade.domain.dto';
import type { ITransactionDomainDTO } from '@/resources/services/trade/dtos/trade.domain.dto';

import type { IHistoryViewProps } from './history.model';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_STYLES: Record<TransactionStatus, { container: string; text: string; label: string }> = {
  PENDING: {
    container: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: PT_BR.history.status.pending,
  },
  COMPLETED: {
    container: 'bg-green-100',
    text: 'text-green-700',
    label: PT_BR.history.status.completed,
  },
  FAILED: {
    container: 'bg-red-100',
    text: 'text-red-600',
    label: PT_BR.history.status.failed,
  },
};

function resolveFailureMessage(reason: TransactionFailureReason | null | undefined): string {
  if (!reason || !(reason in PT_BR.history.failureReason)) {
    return PT_BR.history.failureReason.UNKNOWN;
  }

  return PT_BR.history.failureReason[reason];
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <View className={`rounded-full px-2 py-0.5 ${style.container}`}>
      <Text className={`font-secondary-medium text-xs ${style.text}`}>{style.label}</Text>
    </View>
  );
}

function TransactionRow({ item }: { item: ITransactionDomainDTO }) {
  const isBuy = item.type === 'BUY';
  const isFailed = item.status === 'FAILED';

  function handlePress() {
    Alert.alert(
      PT_BR.history.failureDetails,
      resolveFailureMessage(item.failureReason),
    );
  }

  return (
    <Pressable
      onPress={isFailed ? handlePress : undefined}
      accessibilityRole={isFailed ? 'button' : undefined}
      accessibilityLabel={isFailed ? PT_BR.history.failureDetails : undefined}
    >
      <View className={`flex-row items-center bg-white rounded-2xl p-4 gap-3 shadow-sm ${isFailed ? 'opacity-80' : ''}`}>
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${isBuy ? 'bg-blue-100' : 'bg-orange-100'}`}
        >
          <Text
            className={`font-primary-semibold text-xs ${isBuy ? 'text-blue-600' : 'text-orange-600'}`}
          >
            {isBuy ? 'C' : 'V'}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className="font-primary-medium text-gray-900 text-sm">
              {isBuy ? PT_BR.history.buy : PT_BR.history.sell}
            </Text>
            <StatusBadge status={item.status} />
          </View>
          <Text className="font-secondary text-gray-400 text-xs">{formatDate(item.createdAt)}</Text>
        </View>
        <View className="items-end gap-0.5">
          <Text className={`font-secondary-semibold text-sm ${isBuy ? 'text-green-600' : 'text-red-500'}`}>
            {isBuy ? '+' : '-'}₿ {item.btcAmount}
          </Text>
          <Text className="font-secondary text-gray-400 text-xs">R$ {item.brlAmount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function HistoryView({
  transactions,
  isLoading,
  isError,
  hasMore,
  onLoadMore,
  onRefresh,
  isRefreshing,
}: IHistoryViewProps) {
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-4 pt-6">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#eab308" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-4 pt-6">
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="font-secondary text-base-500">{PT_BR.common.error}</Text>
            <Text
              onPress={onRefresh}
              className="font-primary-semibold text-primary-500"
              accessibilityRole="button"
            >
              {PT_BR.common.retry}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow item={item} />}
        contentContainerClassName="flex-grow p-4 gap-2"
        ListHeaderComponent={
          <Text className="font-primary-semibold text-xl text-gray-900 mb-2">{PT_BR.history.title}</Text>
        }
        ListEmptyComponent={
          <Text className="font-secondary text-center text-gray-400 py-10">{PT_BR.history.empty}</Text>
        }
        ListFooterComponent={
          hasMore ? (
            <Text
              onPress={onLoadMore}
              className="font-primary-medium text-center text-yellow-600 py-4"
            >
              {PT_BR.history.loadMore}
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#eab308" />
        }
      />
    </SafeAreaView>
  );
}

export { HistoryView };
