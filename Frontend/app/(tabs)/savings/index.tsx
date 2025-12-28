import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BudgetList from '@/src/components/BudgetList'


const index = () => {
  return (
    <SafeAreaView>
      <View>
        <BudgetList/>
      </View>
    </SafeAreaView>
  )
}

export default index

const styles = StyleSheet.create({})