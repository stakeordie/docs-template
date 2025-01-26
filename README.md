# VitePress Documentation Template

A clean, modern documentation template using VitePress with built-in Mermaid support and automatic route validation.

## Features

- 📊 **Mermaid Diagrams**: Create beautiful diagrams directly in your markdown
- ✅ **Route Validation**: Automatic testing of navigation links
- 🔍 **Type Safety**: Full TypeScript support
- 🚀 **Modern Stack**: Uses pnpm, Vite, and VitePress
- 📱 **Responsive**: Mobile-friendly documentation
- 🎨 **Clean Design**: Modern, minimal theme

## Quick Start

1. Clone this repository:
   ```bash
   git clone [your-repo-url]
   cd vitepress-docs-template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm docs:dev
   ```

4. Build for production:
   ```bash
   pnpm docs:build
   ```

## Project Structure

```
.
├── docs/
│   ├── .vitepress/
│   │   └── config.ts      # VitePress configuration
│   ├── guide/
│   │   └── index.md      # Guide documentation
│   ├── examples/
│   │   └── index.md      # Examples documentation
│   └── index.md          # Home page
├── tests/
│   └── route-validation.test.ts  # Navigation testing
├── package.json
└── tsconfig.json
```

## Configuration

The template is configured in `docs/.vitepress/config.ts`. Key features include:

- Mermaid diagram support
- Navigation structure
- Sidebar configuration
- TypeScript configuration

## Testing

Run the test suite to validate all documentation routes:

```bash
pnpm test
```

This will ensure all navigation links point to existing files.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
