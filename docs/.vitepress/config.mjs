import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "SASTOJ",
  description: "Microservice Online Judge",
  head: [
    ['link', { rel: 'icon', href: '/image/favicons.svg' }]
  ],
  themeConfig: {
    i18nRouting: true,

    langMenuLabel: "Languages",

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NJUPT-SAST/sastoj-docs' }
    ],

    lastUpdated: true,

    search: {
      provider: 'local'
    }
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '用户指南', link: '/user-guide/api-examples' },
          { text: '开发指南', link: '/dev-guide/markdown-examples' },
        ],
        sidebar: {
          '/user-guide/': {
            text: '用户指南',
            items: [
              {
                text: 'API 示例',
                link: '/user-guide/api-examples'
              },
            ]
          },
          '/dev-guide/': {
            text: '开发指南',
            items: [
              {
                text: 'Markdown 示例',
                link: '/dev-guide/markdown-examples'
              },
            ]
          }
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'User Guide', link: '/user-guide/api-examples' },
          { text: 'Dev Guide', link: '/dev-guide/markdown-examples' },
        ],
      }
    }
  },
})
