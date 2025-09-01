import type { CollectionEntry } from 'astro:content'

export type PostKey = 'blog'

export type CollectionPosts = CollectionEntry<PostKey>

export type Pages = 'pages'

export type CollectionPages = CollectionEntry<Pages>

export type ProjectData = Array<{
  title: string
  projects: Array<{
    text: string
    description?: string
    icon?: string
    href: string
  }>
}>

export interface HomePageData {
  project: Array<{
    title: string
    description: string
    techstack: Array<string>
    url: string
  }>
  work: Array<{
    title: string
    position: string
    duration: {
      start: Date
      end: Date | 'Present'
    }
    description: string
  }>
}
