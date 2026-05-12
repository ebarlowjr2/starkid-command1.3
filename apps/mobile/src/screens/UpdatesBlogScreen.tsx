import React, { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { getAllPosts, getAllTags, getPostBySlug, ROUTE_MANIFEST } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

export default function UpdatesBlogScreen({ navigation, route }: any) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const slug = route?.params?.slug as string | undefined
  const allPosts = useMemo(() => getAllPosts(), [])
  const allTags = useMemo(() => getAllTags(), [])
  const post = slug ? getPostBySlug(slug) : null

  const filteredPosts = selectedTag
    ? allPosts.filter((p: any) => p.tags?.includes(selectedTag))
    : allPosts

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack()
    } else {
      navigation?.setParams?.({ slug: undefined })
    }
  }

  if (post) {
    const sections = post.content.split('\n\n').filter(Boolean)
    return (
      <SpaceBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <CustomText variant="sectionLabel" style={styles.backText}>← BACK TO BLOG</CustomText>
            </Pressable>
            <CustomText variant="hero" style={styles.title}>{post.title}</CustomText>
            <CustomText variant="bodySmall" style={styles.subtitle}>
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </CustomText>
            <View style={styles.tagRow}>
              {post.tags?.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <CustomText variant="sectionLabel" style={styles.tagText}>{tag.toUpperCase()}</CustomText>
                </View>
              ))}
            </View>

            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              {sections.map((section: string, idx: number) => {
                const trimmed = section.trim()
                if (trimmed.startsWith('## ')) {
                  return (
                    <CustomText key={`h2-${idx}`} variant="cardTitle" style={styles.sectionHeading}>
                      {trimmed.replace('## ', '')}
                    </CustomText>
                  )
                }
                if (trimmed.startsWith('# ')) {
                  return (
                    <CustomText key={`h1-${idx}`} variant="title" style={styles.sectionHeading}>
                      {trimmed.replace('# ', '')}
                    </CustomText>
                  )
                }
                return (
                  <CustomText key={`p-${idx}`} variant="body" style={styles.body}>
                    {trimmed}
                  </CustomText>
                )
              })}
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>UPDATES</CustomText>
          <CustomText variant="hero" style={styles.title}>Blog</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Mission logs • educational articles • updates.</CustomText>

          <View style={styles.chipRow}>
            <Pressable
              style={[styles.chip, selectedTag === null && styles.chipActive]}
              onPress={() => setSelectedTag(null)}
            >
              <CustomText variant="sectionLabel" style={[styles.chipText, selectedTag === null && styles.chipTextActive]}>
                ALL
              </CustomText>
            </Pressable>
            {allTags.map((tag: string) => (
              <Pressable
                key={tag}
                style={[styles.chip, selectedTag === tag && styles.chipActive]}
                onPress={() => setSelectedTag(tag)}
              >
                <CustomText variant="sectionLabel" style={[styles.chipText, selectedTag === tag && styles.chipTextActive]}>
                  {tag.toUpperCase()}
                </CustomText>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {filteredPosts.map((item: any) => (
              <Pressable
                key={item.slug}
                onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.UPDATES_BLOG, { slug: item.slug })}
              >
                <GlassCard variant="secondary">
                  <CustomText variant="cardTitle" style={styles.cardTitle}>{item.title}</CustomText>
                  <CustomText variant="bodySmall" style={styles.meta}>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </CustomText>
                  <CustomText variant="body" style={styles.body} numberOfLines={2}>{item.summary}</CustomText>
                  <View style={styles.tagRow}>
                    {item.tags?.map((tag: string) => (
                      <View key={tag} style={styles.tag}>
                        <CustomText variant="sectionLabel" style={styles.tagText}>{tag.toUpperCase()}</CustomText>
                      </View>
                    ))}
                    <CustomText variant="sectionLabel" style={styles.read}>READ →</CustomText>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
            {filteredPosts.length === 0 ? (
              <GlassCard variant="secondary">
                <CustomText variant="body" style={styles.body}>No posts found.</CustomText>
              </GlassCard>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  body: { color: colors.muted },
  chipRow: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    backgroundColor: 'rgba(6, 10, 22, 0.45)',
  },
  chipActive: {
    borderColor: 'rgba(61,235,255,0.9)',
    backgroundColor: 'rgba(61,235,255,0.18)',
  },
  chipText: { color: colors.dim },
  chipTextActive: { color: colors.text },
  cardTitle: { color: colors.text },
  meta: { color: colors.dim, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: spacing.sm },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(61,235,255,0.15)',
  },
  tagText: { color: colors.accent },
  read: { color: colors.dim, marginLeft: 'auto' },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    alignSelf: 'flex-start',
  },
  backText: { color: colors.accent },
  sectionHeading: { color: colors.text, marginTop: spacing.sm },
})
