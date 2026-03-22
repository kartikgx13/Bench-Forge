import { useEffect, useState } from "react"
import { getModels } from "../api/backend"
import { RotateCcw } from "lucide-react"

function InstalledModelsSelector({ selectedModels, setSelectedModels,refreshTrigger }) {

  const [installedModels, setInstalledModels] = useState([])

  const resetSelection = () => {
    setSelectedModels([])
  }

  const fetchInstalledModels = async () => {
    const res = await getModels()
    const installed = res.data.filter(m => m.installed)
    setInstalledModels(installed)
  }

  useEffect(() => {
    fetchInstalledModels()
  }, [refreshTrigger])

  const toggleModel = (modelName) => {

    if (selectedModels.includes(modelName)) {
      setSelectedModels(selectedModels.filter(m => m !== modelName))
    } else {
      setSelectedModels([...selectedModels, modelName])
    }

  }

  return (

    <div className="mb-10">

      {/* ✅ Step label */}
      <div className="flex justify-between items-center mb-3">

        <h3 className="text-lg font-semibold text-gray-300">
          Step 2 • Select Models
          <span className="ml-2 text-purple-400">
            ({selectedModels.length})
          </span>
        </h3>

        <button
          onClick={resetSelection}
          disabled={selectedModels.length === 0}
          className="flex items-center gap-2 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Reset
        </button>

      </div>

      {/* ✅ Model chips */}
      <div className="flex flex-wrap gap-3">

        {installedModels.map(model => {

          const isSelected = selectedModels.includes(model.name)

          return (
            <button
              key={model.name}
              onClick={() => toggleModel(model.name)}
              className={`
                px-6 py-3 text-sm font-medium rounded-lg text-sm transition
                ${isSelected
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"}
              `}
            >
              {model.name}
            </button>
          )
        })}

      </div>

    </div>
  )
}

export default InstalledModelsSelector