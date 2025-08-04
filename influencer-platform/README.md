# Influencer Platform Bulgaria 🚀

The #1 influencer marketing platform in Bulgaria, connecting brands with top creators. Built with a modern tech stack and Apple-inspired design principles.

## 🎯 Features

### For Brands
- **AI-Powered Matching**: Find perfect creators using intelligent algorithms
- **Verified Creators**: Work with authenticated influencers with real engagement
- **Real-time Analytics**: Track campaign performance with detailed insights
- **Secure Payments**: Streamlined payment process with Stripe Connect

### For Creators
- **Global Brand Access**: Connect with Bulgarian and international brands
- **Fair Compensation**: Transparent pricing and quick payouts
- **Portfolio Building**: Showcase your best work professionally
- **Easy Campaign Management**: Simple tools for deliverables and communication

### Platform Features
- 🌐 Bilingual support (Bulgarian & English)
- 🌙 Dark mode support
- 📱 Mobile-first responsive design
- 🔒 Secure authentication with Supabase
- 💳 Stripe Connect integration
- 📊 Analytics dashboard
- 💬 Real-time messaging
- 🤖 AI-powered features

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Connect
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary
- **Monorepo**: Turborepo
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

## 📦 Project Structure

```
influencer-platform/
├── apps/
│   ├── web/          # Main Next.js application
│   └── admin/        # Admin dashboard (planned)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── database/     # Database schemas and types
│   ├── tsconfig/     # Shared TypeScript configs
│   └── eslint-config/ # Shared ESLint configs
└── turbo.json        # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account
- Cloudinary account (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/influencer-platform.git
cd influencer-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - Add your Supabase credentials
   - Add your Stripe keys
   - Configure other services as needed

5. Set up the database:
```bash
# Run the migration in your Supabase project
# Copy the content from packages/database/migrations/001_initial_schema.sql
# and execute it in the Supabase SQL editor
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📝 Development

### Running the project

```bash
# Development mode
npm run dev

# Build all apps
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Project Commands

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

## 🏗 Architecture

### Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: Core user accounts
- **influencer_profiles**: Detailed influencer information
- **brand_profiles**: Brand company information
- **campaigns**: Marketing campaigns
- **campaign_applications**: Influencer applications to campaigns
- **messages**: Direct messaging between users
- **transactions**: Payment records
- **reviews**: Post-campaign reviews

### Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Secure API routes with proper authorization
- Input validation with Zod schemas
- HTTPS enforced in production

## 🎨 Design System

The platform features an Apple-inspired design with:

- Premium glassmorphism effects
- Smooth animations with Framer Motion
- Custom gradient system
- Responsive typography scale
- Dark mode support
- Accessibility-first approach

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

## 📊 Monitoring

- **Analytics**: Plausible Analytics integration
- **Error Tracking**: Sentry for error monitoring
- **Performance**: Vercel Analytics (optional)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- Design inspired by Apple's design principles
- Built with modern open-source technologies
- Special thanks to the Bulgarian creator community

---

Built with ❤️ for the Bulgarian creator economy