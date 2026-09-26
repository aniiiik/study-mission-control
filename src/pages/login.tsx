import { signInWithGoogle } from '../lib/auth'

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google login failed:', error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Study Mission Control
        </h1>

        <p className="mt-2 text-gray-400">
          Your personal study command center
        </p>

        <button
          onClick={handleGoogleLogin}
          className="mt-8 w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-200"
        >
          Continue with Google
        </button>
      </div>
    </main>
  )
}