import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BudgetList from '@/src/components/BudgetList'

const index = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BudgetList/>
      </View>
    </SafeAreaView>
  )
}

export default index

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4fafb",
  },
  container: {
    flex: 1,
  },
})