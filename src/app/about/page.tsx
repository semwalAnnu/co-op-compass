import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">About Co-Op Compass</h1>
        <p className="text-xl text-gray-600 dark:text-black-300">
          Co-Op Compass is your personal co-op application navigator&mdash;designed for students by students. 
          Track every deadline, organize your tasks in a drag-and-drop Kanban board, and get real-time 
          updates on your application status&mdash;no more spreadsheets or sticky notes!
        </p>
      </section>

      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-4">Why We Built It</h2>
        <p className="text-black-600 dark:text-black-300">
          In today&apos;s competitive co-op market, staying organized can mean the difference between 
          securing that dream placement or missing out. We saw how manual tracking often leads to 
          missed deadlines and lost opportunities, so we built Co-Op Compass to simplify the entire 
          workflow&mdash;from research and application to offer acceptance.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="feature-grid">
          {[
            ['🔍', 'Dashboard Overview', 'See all your applications at a glance with status filters and progress indicators.'],
            ['🗂️', 'Kanban Workflow', 'Drag-and-drop your roles through "To Apply," "Applied," "Interview," and "Offer."'],
            ['🔔', 'Real-Time Alerts', 'Get instant notifications when deadlines approach or statuses change.'],
            ['🔒', 'Secure Auth', 'Sign in with GitHub OAuth and enjoy JWT-backed sessions for maximum security.'],
            ['☁️', 'Serverless Scale', 'Built on Cloudflare Workers + KV for lightning-fast performance at the edge.'],
            ['🚀', 'Zero-Downtime Deploys', 'Continuous delivery with Vercel & Playwright E2E tests ensures your app is always live.']
          ].map(([emoji, title, desc]) => (
            <div key={title} className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
              <div className="text-3xl mb-2">{emoji}</div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-8">
          {[
            ['Sign Up & Connect', 'Create an account via GitHub OAuth—no extra forms or passwords.'],
            ['Add Your Roles', 'Paste in job links or fill out company, role, and deadline fields.'],
            ['Track & Update', 'Move cards through your personalized Kanban. Receive automatic reminders before each deadline.']
          ].map(([title, desc], index) => (
            <div key={title} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-4">
                {index + 1}
              </div>
              <div>
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-gray-600 dark:text-black-300">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="tech-stack">
          <h2 className="text-2xl font-bold mb-4">Built With</h2>
          <ul className="space-y-2 text-gray-600 dark:text-black-300">
            <li>• Next.js 14 & React</li>
            <li>• Tailwind CSS</li>
            <li>• Cloudflare Workers + KV</li>
            <li>• Vercel & GitHub Actions</li>
            <li>• Playwright E2E Testing</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
        <p className="text-gray-600 dark:text-black-300 mb-6">
          We&apos;re always improving! If you have feedback or want to contribute, open an issue on our 
          GitHub or drop us a line at support@coopcompass.app.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-block px-8 py-3 bg-primary text-black rounded-lg shadow-md hover:bg-primary-light transition-all"
        >
          Try Co-Op Compass Now
        </Link>
      </section>
    </div>
  );
}