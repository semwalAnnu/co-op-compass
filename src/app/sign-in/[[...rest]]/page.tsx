import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <SignIn
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
        path="/sign-in"
        afterSignInUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}