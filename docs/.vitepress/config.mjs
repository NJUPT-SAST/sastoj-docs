import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";
import markdownItTaskCheckbox from 'markdown-it-task-checkbox';

export default withMermaid({
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

    outline: {
      level: [2, 4],
    },

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
          { text: '用户指南', link: '/user-guide' },
          { text: '开发指南', link: '/dev-guide' },
        ],
        sidebar: {
          '/user-guide/': {
            text: '用户指南',
            base: '/user-guide',
            items: [
              {
                text: '简介',
                link: '/'
              },
            ]
          },
          '/dev-guide/': {
            text: '开发指南',
            base: '/dev-guide',
            items: [
              {
                text: '简介',
                link: '/'
              },
              {
                text: '后端',
                base: '/dev-guide/backend',
                items: [
                  {
                    text: '简介',
                    base: '/dev-guide/backend/intro',
                    items: [
                      {
                        text: '项目结构',
                        link: '/layout'
                      },
                      {
                        text: '快速开始',
                        link: '/quick-start'
                      },
                      {
                        text: '题目类型',
                        link: '/problem-types'
                      }
                    ]
                  },
                  {
                    text: '网络中间件',
                    base: '/dev-guide/backend/net-mid',
                    items: [
                      {
                        text: '认证',
                        link: '/auth'
                      },
                      {
                        text: 'API 限流器',
                        link: '/api-limiter'
                      }
                    ]
                  },
                  {
                    text: '评测中间件',
                    base: '/dev-guide/backend/judge-mid',
                    items: [
                      {
                        text: '概览',
                        link: '/'
                      },
                      {
                        text: '提交和自测',
                        link: '/submission-&-self-test'
                      },
                      {
                        text: 'Go-judge 中间件',
                        link: '/gojudge-mid'
                      }
                    ]
                  },
                  {
                    text: '网关',
                    base: '/dev-guide/backend/gateway',
                    items: [
                      {
                        text: '网关开发',
                        link: '/'
                      },
                      {
                        text: '同步缓存',
                        link: '/sync-cache'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        footer: {
          message: '基于 Apache-2.0 许可发布',
          copyright: '版权所有 © 2024 南京邮电大学大学生科学技术协会'
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
          { text: 'User Guide', link: '/user-guide' },
          { text: 'Dev Guide', link: '/dev-guide' },
        ],
        footer: {
          message: 'Released under Apache-2.0 License',
          copyright: 'Copyright © 2024 Nanjing University of Posts and Telecommunications Students\' Association for Science and Technology'
        }
      }
    }
  },
  markdown: {
    config: (md) => {
      md.use(markdownItTaskCheckbox, {
        disabled: true,
        divWrap: false,
        divClass: 'checkbox',
        idPrefix: 'cbx_',
        ulClass: 'task-list',
        liClass: 'task-list-item'
      });
    }
  },
})