import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default withMermaid(
  defineConfig({
    title: 'Documentation',
    description: 'VitePress Documentation Template with Mermaid Support',
    
    vite: {
      resolve: {
        alias: [
          {
            find: /^dayjs\/(.*)$/,
            replacement: path.resolve(__dirname, '../../node_modules/dayjs/$1')
          }
        ]
      },
      optimizeDeps: {
        include: [
          'cytoscape', 
          'cytoscape-cose-bilkent', 
          '@braintree/sanitize-url',
          'dayjs',
          'dayjs/plugin/isoWeek',
          'dayjs/plugin/advancedFormat',
          'dayjs/plugin/customParseFormat',
          'dayjs/plugin/weekOfYear'
        ]
      },
      build: {
        rollupOptions: {
          external: []
        }
      }
    },
    
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Guide', link: '/guide/' },
        { text: 'Examples', link: '/examples/' }
      ],

      sidebar: {
        '/': [
          {
            text: 'Getting Started',
            items: [
              { text: 'Overview', link: '/' },
              { text: 'Installation', link: '/installation' }
            ]
          }
        ],
        '/guide/': [
          {
            text: 'Guide',
            items: [
              { text: 'Overview', link: '/guide/' },
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'Markdown', link: '/guide/markdown' }
            ]
          }
        ],
        '/examples/': [
          {
            text: 'Examples',
            items: [
              { text: 'Overview', link: '/examples/' },
              { text: 'Mermaid', link: '/examples/mermaid' },
              { text: 'Advanced', link: '/examples/advanced' }
            ]
          }
        ]
      }
    }
  })
)
