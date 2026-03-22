import { useState } from "react"
import { streamBenchmark } from "../api/backend"
import BenchmarkCharts from "./BenchmarkCharts"
import { exportJSON, exportCSV } from "../utils/exportResults"
import { Play, RotateCcw, FileDown } from "lucide-react"

function BenchmarkRunner({ selectedModels }) {

  const [running, setRunning] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(0)
  const [currentModel, setCurrentModel] = useState("")

  const resetResults = () => {
    setResults([])
    setProgress(0)
    setCurrentModel("")
    setRunning(false)
  }

  const startBenchmark = () => {

    if (selectedModels.length === 0) {
      alert("Please select at least one model")
      return
    }

    setRunning(true)
    setResults([])
    setProgress(0)
    setCurrentModel("")

    const source = streamBenchmark(selectedModels)

    source.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (data.done) {
        source.close()
        setRunning(false)
        return
      }

      if (data.model) {
        setCurrentModel(data.model)
      }

      if (data.progress !== undefined) {
        setProgress(data.progress)
      }

      if (data.avg_latency !== undefined) {
        setResults(prev => [
          ...prev,
          {
            model: data.model,
            avg_latency: data.avg_latency,
            avg_ttft: data.avg_ttft,
            tokens_per_sec: data.tokens_per_sec
          }
        ])
      }
    }

    source.onerror = () => {
      source.close()
      setRunning(false)
      alert("Benchmark stream error")
    }
  }

  return (

    <div className="mb-10">

      {/* ✅ Step label */}
      <div className="flex justify-between items-center mb-3">

        <h3 className="text-lg font-semibold text-gray-300">
          Step 3 • Run Benchmark
        </h3>

        <button
          onClick={resetResults}
          disabled={running}
          className="flex items-center gap-2 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Reset
        </button>

      </div>

      {/* ✅ Run Button */}
      <button
        onClick={startBenchmark}
        disabled={running || selectedModels.length === 0}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg disabled:opacity-50"
      >
        <Play size={16} />
        {running ? "Running..." : "Run Benchmark"}
      </button>

      {/* ✅ Status */}
      {running && currentModel && (
        <p className="text-sm text-purple-400 mt-3">
          Running: {currentModel}
        </p>
      )}

      {/* ✅ Progress */}
      {running && (
        <div className="mt-3">

          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {Math.round(progress)}%
          </p>

        </div>
      )}

      {/* 🔥 Results Section (kept as card for emphasis) */}
      {results.length > 0 && (

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">

          <h3 className="text-md mb-3 text-gray-200">
            Results
          </h3>

          <table className="w-full text-left">

            <thead className="text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-2">Model</th>
                <th>TTFT</th>
                <th>Latency</th>
                <th>Tokens/sec</th>
              </tr>
            </thead>

            <tbody>
              {results.map((r) => (
                <tr key={r.model} className="border-b border-gray-800">
                  <td className="py-2">{r.model}</td>
                  <td>{r.avg_ttft.toFixed(2)}</td>
                  <td>{r.avg_latency.toFixed(2)}</td>
                  <td>{r.tokens_per_sec.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>

          </table>

          <BenchmarkCharts results={results} />

          {/* Export buttons */}
          <div className="flex gap-4 mt-4">

            <button
              onClick={() => exportCSV(results)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-medium rounded-lg"
            >
              <FileDown size={16} />
              CSV
            </button>

            <button
              onClick={() => exportJSON(results)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 text-sm font-medium rounded-lg"
            >
              <FileDown size={16} />
              JSON
            </button>

          </div>

        </div>

      )}

    </div>

  )
}

export default BenchmarkRunner