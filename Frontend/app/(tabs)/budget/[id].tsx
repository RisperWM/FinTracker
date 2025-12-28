import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import React from 'react'
import BudgetItemList from '@/src/components/BudgetItemList'
import { useLocalSearchParams } from 'expo-router'

const BudgetItem = () => {
  const {id} = useLocalSearchParams<{id: string}>();

  if (!id) return null;
  return (
    <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <BudgetItemList budgetId={id}/>
          </View>
      </SafeAreaView>
  )
}

export default BudgetItem

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4fafb",
  },
  container: {
    flex: 1,
    padding: 10,
  },
})