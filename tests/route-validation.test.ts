import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../docs/.vitepress/config'
import type { DefaultTheme } from 'vitepress'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DOCS_DIR = path.join(__dirname, '../docs')

interface RouteCollection {
  topnav: string[];
  sidebar: string[];
}

interface LinkedFile {
  route: string;
  type: 'directory' | 'file';
  location: ('topnav' | 'sidebar')[];
  expectedPath: string;
  exists: boolean;
}

function getLinkedFiles(routes: RouteCollection): LinkedFile[] {
  const { topnav, sidebar } = routes
  const allRoutes = new Set([...topnav, ...sidebar])
  const files: LinkedFile[] = []

  allRoutes.forEach(route => {
    const locations: ('topnav' | 'sidebar')[] = []
    if (topnav.includes(route)) locations.push('topnav')
    if (sidebar.includes(route)) locations.push('sidebar')

    if (route === '/') {
      files.push({
        route,
        type: 'file',
        location: locations,
        expectedPath: path.join(DOCS_DIR, 'index.md'),
        exists: fs.existsSync(path.join(DOCS_DIR, 'index.md'))
      })
      return
    }

    const isDirectory = route.endsWith('/')
    const cleanRoute = isDirectory ? route.slice(0, -1) : route
    const expectedPath = path.join(
      DOCS_DIR, 
      isDirectory ? `${cleanRoute}/index.md` : `${cleanRoute}.md`
    )

    files.push({
      route,
      type: isDirectory ? 'directory' : 'file',
      location: locations,
      expectedPath,
      exists: fs.existsSync(expectedPath)
    })
  })

  return files.sort((a, b) => a.route.localeCompare(b.route))
}

function getAllMarkdownFiles(dir: string = DOCS_DIR): string[] {
  const files: string[] = []
  
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (item.endsWith('.md')) {
      // Convert absolute path to route format
      const relativePath = path.relative(DOCS_DIR, fullPath)
      const routePath = '/' + relativePath.replace(/\.md$/, '')
      // Convert /index to / for directories
      const finalPath = routePath.replace(/\/index$/, '/')
      files.push(finalPath)
    }
  }
  
  return files.sort()
}

function getAllConfiguredRoutes(): RouteCollection {
  const topnav: string[] = []
  const sidebar: string[] = []
  
  // Get routes from nav
  const themeConfig = config.themeConfig as DefaultTheme.Config
  themeConfig.nav?.forEach((item: DefaultTheme.NavItem) => {
    if ('link' in item && item.link) {
      topnav.push(item.link)
    }
  })
  
  // Get routes from sidebar
  if (themeConfig.sidebar) {
    Object.entries(themeConfig.sidebar).forEach(([base, section]) => {
      if (Array.isArray(section)) {
        section.forEach((group: DefaultTheme.SidebarItem) => {
          if ('items' in group && Array.isArray(group.items)) {
            group.items.forEach((item: DefaultTheme.SidebarItem) => {
              if ('link' in item && item.link) {
                sidebar.push(item.link)
              }
            })
          }
        })
      }
    })
  }
  
  return { topnav, sidebar }
}

describe('Documentation Route Validation', () => {
  const routes = getAllConfiguredRoutes()
  const { topnav, sidebar } = routes
  const allRoutes = [...topnav, ...sidebar]

  test('should show complete config', () => {
    expect(config).toBeDefined()
  })

  test('routes should be unique within their sections', () => {
    // Check topnav for duplicates
    const uniqueTopNav = new Set(topnav)
    if (uniqueTopNav.size !== topnav.length) {
      const duplicates = topnav.filter((route, index) => 
        topnav.indexOf(route) !== index
      )
      throw new Error(
        'Found duplicate routes in top navigation:\n' +
        duplicates.map(route => `  "${route}" appears multiple times in topnav`).join('\n')
      )
    }

    // Check sidebar for duplicates
    const uniqueSidebar = new Set(sidebar)
    if (uniqueSidebar.size !== sidebar.length) {
      const duplicates = sidebar.filter((route, index) => 
        sidebar.indexOf(route) !== index
      )
      throw new Error(
        'Found duplicate routes in sidebar:\n' +
        duplicates.map(route => `  "${route}" appears multiple times in sidebar`).join('\n')
      )
    }
  })

  test('all routes should start with /', () => {
    const invalidRoutes = allRoutes.filter(route => !route.startsWith('/'))
    
    if (invalidRoutes.length > 0) {
      throw new Error(
        'Found routes that don\'t start with /:\n' +
        invalidRoutes.map(route => `  "${route}"`).join('\n')
      )
    }
  })

  test('all nav items should point to directories with index.md', () => {
    const invalidDirs: Array<{route: string; reason: string}> = []
    
    topnav.forEach(route => {
      // Skip root path
      if (route === '/') return

      // Remove trailing slash
      const cleanRoute = route.slice(0, -1)
      
      // Convert route to filesystem path
      const dirPath = path.join(DOCS_DIR, cleanRoute)
      const indexPath = path.join(dirPath, 'index.md')
      
      // Check each condition separately for detailed error reporting
      if (!fs.existsSync(dirPath)) {
        invalidDirs.push({
          route,
          reason: `directory does not exist: ${dirPath}`
        })
      } else if (!fs.statSync(dirPath).isDirectory()) {
        invalidDirs.push({
          route,
          reason: `path exists but is not a directory: ${dirPath}`
        })
      } else if (!fs.existsSync(indexPath)) {
        invalidDirs.push({
          route,
          reason: `directory exists but missing index.md: ${indexPath}`
        })
      } else if (!fs.statSync(indexPath).isFile()) {
        invalidDirs.push({
          route,
          reason: `index.md path exists but is not a file: ${indexPath}`
        })
      }
    })

    if (invalidDirs.length > 0) {
      throw new Error(
        'Navigation structure validation failed:\n' +
        invalidDirs.map(({ route, reason }) => 
          `  ${route} -> ${reason}`
        ).join('\n')
      )
    }
  })

  test('all sidebar directory routes should have index.md', () => {
    const directoryRoutes = sidebar.filter(route => route.endsWith('/'))
    const invalidDirs: Array<{route: string; reason: string}> = []
    
    directoryRoutes.forEach(route => {
      // Skip root path
      if (route === '/') return

      // Remove trailing slash
      const cleanRoute = route.slice(0, -1)
      
      // Convert route to filesystem path
      const dirPath = path.join(DOCS_DIR, cleanRoute)
      const indexPath = path.join(dirPath, 'index.md')
      
      // Check each condition separately for detailed error reporting
      if (!fs.existsSync(dirPath)) {
        invalidDirs.push({
          route,
          reason: `directory does not exist: ${dirPath}`
        })
      } else if (!fs.statSync(dirPath).isDirectory()) {
        invalidDirs.push({
          route,
          reason: `path exists but is not a directory: ${dirPath}`
        })
      } else if (!fs.existsSync(indexPath)) {
        invalidDirs.push({
          route,
          reason: `directory exists but missing index.md: ${indexPath}`
        })
      } else if (!fs.statSync(indexPath).isFile()) {
        invalidDirs.push({
          route,
          reason: `index.md path exists but is not a file: ${indexPath}`
        })
      }
    })

    if (invalidDirs.length > 0) {
      throw new Error(
        'Sidebar directory structure validation failed:\n' +
        invalidDirs.map(({ route, reason }) => 
          `  ${route} -> ${reason}`
        ).join('\n')
      )
    }
  })

  test('all non-directory routes should have corresponding .md files', () => {
    // Combine both nav and sidebar non-directory routes
    const fileRoutes = [...topnav, ...sidebar].filter(route => !route.endsWith('/') && route !== '/')
    const invalidFiles: Array<{route: string; reason: string}> = []
    
    fileRoutes.forEach(route => {
      // Convert route to filesystem path
      const filePath = path.join(DOCS_DIR, `${route}.md`)
      const parentDir = path.dirname(filePath)
      
      // Check each condition separately for detailed error reporting
      if (!fs.existsSync(parentDir)) {
        invalidFiles.push({
          route,
          reason: `parent directory does not exist: ${parentDir}`
        })
      } else if (!fs.statSync(parentDir).isDirectory()) {
        invalidFiles.push({
          route,
          reason: `parent path exists but is not a directory: ${parentDir}`
        })
      } else if (!fs.existsSync(filePath)) {
        invalidFiles.push({
          route,
          reason: `markdown file does not exist: ${filePath}`
        })
      } else if (!fs.statSync(filePath).isFile()) {
        invalidFiles.push({
          route,
          reason: `path exists but is not a file: ${filePath}`
        })
      }
    })

    if (invalidFiles.length > 0) {
      throw new Error(
        'Non-directory route validation failed:\n' +
        invalidFiles.map(({ route, reason }) => {
          const locations = []
          if (topnav.includes(route)) locations.push('topnav')
          if (sidebar.includes(route)) locations.push('sidebar')
          return `  ${route} (in ${locations.join(', ')}) -> ${reason}`
        }).join('\n')
      )
    }
  })

  test('should list all linked files', () => {
    const linkedFiles = getLinkedFiles(routes)
    expect(linkedFiles).toBeDefined()
  })

  test('should compare linked files with actual files', () => {
    const linkedFiles = getLinkedFiles(routes)
    const actualFiles = getAllMarkdownFiles()
    
    // Convert linked files to route paths for comparison
    const linkedPaths = new Set(linkedFiles.map(f => f.route))
    const actualPaths = new Set(actualFiles)
    
    // Find files that exist but aren't linked
    const unlinkedFiles = actualFiles.filter(file => !linkedPaths.has(file))
    
    // Find routes that don't have corresponding files
    const missingFiles = linkedFiles
      .filter(f => !f.exists)
      .map(f => f.route)
    
    if (unlinkedFiles.length > 0 || missingFiles.length > 0) {
      const unlinkedDetails = unlinkedFiles.length > 0 
        ? '\nUnlinked files:\n' + unlinkedFiles.map(file => 
            `  - ${file} (${path.join(DOCS_DIR, file.replace(/\/$/, '/index.md').replace(/^\//, '')).replace(/^\//, '')})`
          ).join('\n')
        : '';

      const missingDetails = missingFiles.length > 0
        ? '\nMissing files:\n' + missingFiles.map(file => {
            const linkedFile = linkedFiles.find(f => f.route === file)!
            return `  - ${file} (should be at: ${linkedFile.expectedPath})`
          }).join('\n')
        : '';

      throw new Error(
        `Navigation structure mismatch:${unlinkedDetails}${missingDetails}\n\n` +
        `Summary:\n` +
        `- ${unlinkedFiles.length} files exist but are not linked in navigation\n` +
        `- ${missingFiles.length} navigation links don't have corresponding files`
      )
    }
  })
})
