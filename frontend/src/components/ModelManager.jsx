import { useEffect, useState } from "react"
import { getModels, deleteModel } from "../api/backend"
import { Download, Trash } from "lucide-react"

function ModelManager({ refreshTrigger }) {

  const [models, setModels] = useState([])
  const [downloadProgress, setDownloadProgress] = useState({})
  const [downloadStats, setDownloadStats] = useState({})
  const [sources, setSources] = useState({})

  const fetchModels = async () => {
    const res = await getModels()
    setModels(res.data)
  }

  useEffect(() => {
    fetchModels()
  }, [refreshTrigger])

  const formatGB = (bytes) => {
    return (bytes / (1024 ** 3)).toFixed(2)
  }

  const handleDownload = (model) => {

    const source = new EventSource(
      `http://127.0.0.1:8000/models/download-stream?model=${model}`
    )

    setSources(prev => ({
      ...prev,
      [model]: source
    }))

    source.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.completed && data.total) {
        const percent = Math.floor(
          (data.completed / data.total) * 100
        )

        setDownloadProgress(prev => ({
          ...prev,
          [model]: percent
        }))

        setDownloadStats(prev => ({
          ...prev,
          [model]: {
            completed: formatGB(data.completed),
            total: formatGB(data.total)
          }
        }))
      }

      if (data.status === "success") {
        source.close()

        setSources(prev => {
          const updated = { ...prev }
          delete updated[model]
          return updated
        })

        fetchModels()
      }
    }
  }

  const handleCancel = async (model) => {

    if (sources[model]) {
      sources[model].close()
    }

    await fetch(`http://127.0.0.1:8000/models/cancel?model=${model}`, {
      method: "POST"
    })

    setDownloadProgress(prev => {
      const updated = { ...prev }
      delete updated[model]
      return updated
    })
  }

  const handleDelete = async (model) => {

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${model}?`
    )

    if (!confirmDelete) return

    try {
      await deleteModel(model)
      fetchModels()
    } catch {
      alert("Failed to delete model")
    }
  }

  // 🔥 Split models
  const installedModels = models.filter(m => m.installed)
  const availableModels = models.filter(m => !m.installed)

  return (

    <div className="mt-10">

      <h2 className="text-2xl font-semibold mb-6 text-gray-200">
        Models
      </h2>

      {/* ✅ Installed Models */}
      {installedModels.length > 0 && (
        <>
          <h3 className="text-lg text-gray-300 mb-3">Installed</h3>

          <div className="grid grid-cols-3 gap-4">

            {installedModels.map((model) => (

              <div
                key={model.name}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/10 transition"
              >

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{model.name}</h3>

                  <span className="flex items-center gap-2 text-sm text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Ready
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Installed locally
                </p>

                <button
                  onClick={() => handleDelete(model.full_name)}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition"
                >
                  <Trash size={16} />
                  Remove
                </button>

              </div>

            ))}

          </div>
        </>
      )}

      {/* ✅ Available Models */}
      <h3 className="text-lg text-gray-300 mt-8 mb-3">Explore Models</h3>

      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-2 no-scrollbar">

        {availableModels.map((model) => (

          <div
            key={model.name}
            className="snap-start min-w-[300px] bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/10 transition"
          >

            <div className="flex justify-between items-center">

              <h3 className="text-lg font-semibold">
                {model.name}
              </h3>

              <span className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Available
              </span>

            </div>
            {downloadProgress[model.name] !== undefined ? (

              <div>

                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${downloadProgress[model.name]}%`
                    }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-1 text-center">
                  {downloadProgress[model.name]}%
                  {downloadStats[model.name] && (
                    <> • {downloadStats[model.name].completed}GB / {downloadStats[model.name].total}GB</>
                  )}
                </p>

                <button
                  onClick={() => handleCancel(model.name)}
                  className="mt-2 w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>

              </div>

            ) : (

              <button
                onClick={() => handleDownload(model.name)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition"
              >
                <Download size={16} />
                Download
              </button>

            )}

          </div>

        ))}

      </div>

    </div>

  )
}

export default ModelManager