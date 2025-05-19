// filepath: /Users/annusemwal/GitHub/Projects/co-op-compass/src/app/sign-up/[[...rest]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80">
      <SignUp
        appearance={{
          elements: {
            card: "bg-gray-800 border border-gray-700",
            headerTitle: "text-gray-100",
            headerSubtitle: "text-gray-300",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            formFieldInput: "bg-gray-700 text-gray-100 border-gray-600",
            formFieldLabel: "text-gray-300",
            footerActionLink: "text-blue-400 hover:text-blue-300"
          }
        }}
        routing="path"
        path="/sign-up"
        afterSignUpUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}