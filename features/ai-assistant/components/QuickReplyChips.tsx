import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import LiquidGlassSurface from './LiquidGlassSurface';

const CHIPS = [
  "Gifts for a 5 year old",
  "Under ৳1500",
  "Educational toys",
  "Best sellers",
  "New arrivals"
];

interface QuickReplyChipsProps {
  onSelect: (text: string) => void;
}

export default function QuickReplyChips({ onSelect }: QuickReplyChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CHIPS.map((chip, idx) => (
          <TouchableOpacity 
            key={idx} 
            activeOpacity={0.7} 
            onPress={() => onSelect(chip)}
          >
            <LiquidGlassSurface intensity={40} tint="light" borderRadius={20} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </LiquidGlassSurface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
});
