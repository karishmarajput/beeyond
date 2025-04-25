export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 text-white">
      <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
        Quick Commerce
      </h1>
      <a
        href="/login"
        className="text-white underline text-xl font-semibold hover:text-blue-300 transition duration-300"
      >
        Login
      </a>
    </div>
  )
}
