import { useEffect, useState } from "react"
import { getModels, testPrompt } from "../api/backend"
import toast from "react-hot-toast"

function SinglePromptTester({ refreshTrigger }) {

  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const fetchModels = async () => {
    try {
      const res = await getModels()
      const installed = res.data.filter(m => m.installed)

      setModels(installed)
      setSelectedModel("") // no default selection
    } catch {
      toast.error("Failed to load models")
    }
  }

  useEffect(() => {
    fetchModels()
  }, [refreshTrigger]) // refresh when models change

  const handleRun = async () => {

    if (!selectedModel) {
      toast.error("Please select a model")
      return
    }

    if (!prompt.trim()) {
      toast.error("Enter a prompt")
      return
    }

    setLoading(true)
    setResult(null)

    try {

      const res = await testPrompt(selectedModel, prompt)

      setResult(res.data)

    } catch {

      toast.error("Failed to run prompt")

    }

    setLoading(false)
  }

  return (

    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-10">

      <h2 className="text-xl font-semibold mb-4">
        Test Single Prompt
      </h2>

<div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3">

<div className="relative w-40">

  <select
    value={selectedModel}
    onChange={(e) => setSelectedModel(e.target.value)}
    className="appearance-none w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 pr-8 text-gray-200"
  >
    <option value="">Select Model</option>

    {models.map(m => (
      <option key={m.name} value={m.name}>
        {m.name}
      </option>
    ))}

  </select>

  {/* Custom arrow */}
  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
    ▼
  </div>

</div>

  {/* Prompt Input */}
  <input
    type="text"
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
    placeholder="Type your prompt..."
    className="flex-1 bg-transparent outline-none text-gray-200 px-2"
  />

  {/* Run Button */}
  <button
  onClick={handleRun}
  disabled={loading}
  className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center"
>
  {loading ? (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  ) : (
    "Run ▶"
  )}
</button>

</div>
      {/* Result Section */}
      {result && (

        <div className="mt-6 bg-gray-800 p-4 rounded-lg">

          <h3 className="text-lg mb-2 text-gray-200">
            Response
          </h3>

          <p className="text-gray-300 whitespace-pre-wrap">
            {result.response}
          </p>

          {/* Metrics */}
          <div className="mt-4 border-t border-gray-700 pt-3 text-sm text-gray-400">

            <p>Latency: {result.metrics.latency.toFixed(2)}s</p>
            <p>TTFT: {result.metrics.ttft.toFixed(2)}s</p>
            <p>Tokens/sec: {result.metrics.tokens_per_sec.toFixed(2)}</p>
            <p>Total tokens: {result.metrics.tokens}</p>

          </div>

        </div>

      )}

    </div>

  )
}

export default SinglePromptTester