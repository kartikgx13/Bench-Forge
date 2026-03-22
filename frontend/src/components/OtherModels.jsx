import { useState } from "react"
import { Plus, Search } from "lucide-react"
import toast from "react-hot-toast"

function OtherModels({ refreshModels }) {

  const [inputModel, setInputModel] = useState("")
  const [activeDownload, setActiveDownload] = useState(null)

  const formatGB = (bytes) => {
    return (bytes / (1024 ** 3)).toFixed(2)
  }

  const addModel = async () => {

    const model = inputModel.trim()
    if (!model) return

    setInputModel("")

    // ✅ show "starting" state (no fake progress)
    setActiveDownload({
      name: model,
      progress: 0,
      status: "starting"
    })

    startDownload(model)
  }

  const startDownload = (model) => {

    const source = new EventSource(
      `http://127.0.0.1:8000/models/download-stream?model=${model}`
    )

    source.onmessage = (event) => {

      const data = JSON.parse(event.data)

      // ❌ invalid model
      if (data.error) {
        toast.error(`Model "${model}" does not exist`)
        source.close()
        setActiveDownload(null)
        return
      }

      // ✅ progress updates
      if (data.completed && data.total) {

        const percent = Math.floor(
          (data.completed / data.total) * 100
        )

        setActiveDownload({
          name: model,
          progress: percent,
          completed: formatGB(data.completed),
          total: formatGB(data.total)
        })
      }

      // ✅ success
      if (data.status === "success") {
        source.close()

        toast.success(`Model ${model} downloaded successfully`)

        setActiveDownload(null)
        refreshModels()
      }
    }
  }

  return (

    <div className="mt-10">

      <h2 className="text-2xl font-semibold mb-6 text-gray-200">
        Search Models
      </h2>

      {/* Fixed width container */}
      <div className="w-[420px]">

        {/* Input section */}
        <div className="flex gap-3 mb-4">

    <input
      type="text"
      placeholder="Enter Ollama model name (ex: qwen2.5)"
      value={inputModel}
      onChange={(e) => setInputModel(e.target.value)}
      className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 flex-1 min-w-0"
    />

    <button
      onClick={addModel}
      disabled={activeDownload !== null}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg disabled:opacity-50 whitespace-nowrap"
    >
      <Plus size={16}/>
      Add Model
    </button>

  </div>

        {/* Active Download UI */}
        {activeDownload && (

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 w-full">

            <div className="flex justify-between text-sm mb-2 text-gray-200">
              <span>{activeDownload.name}</span>

              <span>
                {activeDownload.status === "starting"
                  ? "Checking Model..."
                  : `${activeDownload.progress}%`}
              </span>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-3">

              <div
                className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width:
                    activeDownload.status === "starting"
                      ? "5%"
                      : `${activeDownload.progress}%`
                }}
              />

            </div>

            {activeDownload.completed && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                {activeDownload.completed}GB / {activeDownload.total}GB
              </p>
            )}

          </div>

        )}

      </div>

    </div>

  )
}

export default OtherModels