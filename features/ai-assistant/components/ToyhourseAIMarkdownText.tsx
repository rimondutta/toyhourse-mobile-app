import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ToyhourseAIMarkdownTextProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Parses markdown inline formatted text (bold, code, links)
 */
function renderInlineContent(rawText: string, keyPrefix: string) {
  const boldParts = rawText.split(/(\*\*[^*]+\*\*)/g);

  return boldParts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <Text key={`${keyPrefix}-bold-${index}`} style={styles.boldText}>
          {boldText}
        </Text>
      );
    }
    const cleanPart = part.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return (
      <Text key={`${keyPrefix}-text-${index}`} style={styles.bodyText}>
        {cleanPart}
      </Text>
    );
  });
}

export default function ToyhourseAIMarkdownText({ content, isStreaming }: ToyhourseAIMarkdownTextProps) {
  if (!content) {
    if (isStreaming) {
      return (
        <View style={styles.thinkingContainer}>
          <Text style={styles.thinkingText}>Thinking...</Text>
        </View>
      );
    }
    return null;
  }

  const lines = content.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <View key={`empty-${lineIndex}`} style={styles.paragraphSpacing} />;
        }

        // Header ###, ##, #
        if (trimmed.startsWith('#')) {
          const headerLevel = trimmed.match(/^#+/)?.[0].length || 1;
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <Text
              key={`header-${lineIndex}`}
              style={[
                styles.headerText,
                headerLevel === 1 && styles.h1,
                headerLevel === 2 && styles.h2,
                headerLevel >= 3 && styles.h3,
              ]}
            >
              {headerText}
            </Text>
          );
        }

        // Bullet list item (*, -, •)
        if (/^[-*•]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <View key={`bullet-${lineIndex}`} style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletContent}>
                {renderInlineContent(bulletText, `bullet-${lineIndex}`)}
              </Text>
            </View>
          );
        }

        // Numbered list item (e.g. 1. 2.)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          const number = numberedMatch[1];
          const itemText = numberedMatch[2];
          return (
            <View key={`num-${lineIndex}`} style={styles.bulletRow}>
              <Text style={styles.numberIndex}>{number}.</Text>
              <Text style={styles.bulletContent}>
                {renderInlineContent(itemText, `num-${lineIndex}`)}
              </Text>
            </View>
          );
        }

        // Standard paragraph line
        return (
          <Text key={`line-${lineIndex}`} style={styles.lineText}>
            {renderInlineContent(line, `line-${lineIndex}`)}
            {isStreaming && lineIndex === lines.length - 1 && (
              <Text style={styles.cursor}> ⬤</Text>
            )}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraphSpacing: {
    height: 8,
  },
  headerText: {
    color: '#000000',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  h1: {
    fontSize: 18,
    lineHeight: 24,
  },
  h2: {
    fontSize: 16,
    lineHeight: 22,
  },
  h3: {
    fontSize: 15,
    lineHeight: 20,
  },
  lineText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#000000',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#000000',
  },
  boldText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    color: '#000000',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 23,
    color: '#000000',
    marginRight: 8,
    fontWeight: 'bold',
  },
  numberIndex: {
    fontSize: 14,
    lineHeight: 23,
    color: '#000000',
    marginRight: 6,
    fontWeight: '600',
  },
  bulletContent: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    color: '#000000',
  },
  cursor: {
    color: '#000000',
    fontSize: 11,
  },
  thinkingContainer: {
    paddingVertical: 4,
  },
  thinkingText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
