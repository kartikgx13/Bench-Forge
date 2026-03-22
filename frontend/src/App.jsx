import { useEffect, useState } from "react"
import { healthCheck } from "./api/backend"
import ModelManager from "./components/ModelManager"
import PromptUpload from "./components/PromptUpload"
import BenchmarkRunner from "./components/BenchmarkRunner"
import InstalledModelsSelector from "./components/InstalledModelsSelector"
import OtherModels from "./components/OtherModels"
import { Toaster } from "react-hot-toast"
import SinglePromptTester from "./components/SinglePromptTester"

function App() {

  const [status, setStatus] = useState(null)
  const [selectedModels, setSelectedModels] = useState([])
  const [modelRefresh, setModelRefresh] = useState(0)

  const refreshModels = () => {
  setModelRefresh(prev => prev + 1)
}

  useEffect(() => {
    healthCheck()
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ backend: "offline" }))
  }, [])

  return (
<div className="min-h-screen bg-gray-950 text-gray-100">

  <div className="max-w-6xl mx-auto p-8">

    <h1 className="text-4xl font-bold mb-8 text-white">
      Bench Forge
    </h1>
<ModelManager refreshTrigger={modelRefresh} />

<OtherModels refreshModels={refreshModels} />
<div className="my-8 border-t border-gray-700"></div>

<SinglePromptTester refreshTrigger={modelRefresh} />

<div className="flex items-center my-12">
  <div className="flex-grow border-t border-gray-700"></div>

<span className="mx-6 text-3xl font-extrabold text-purple-400 tracking-widest">
  OR
</span>

  <div className="flex-grow border-t border-gray-700"></div>
</div>

<div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-8">

  <h2 className="text-2xl font-bold text-gray-200 mb-8">
    🧪 Benchmark Runner (Test Multiple Prompts)
  </h2>

  <PromptUpload />
  <div className="border-t border-gray-800 my-8"></div>

  <InstalledModelsSelector
  selectedModels={selectedModels}
  setSelectedModels={setSelectedModels}
  refreshTrigger={modelRefresh}
/>
  <div className="border-t border-gray-800 my-8"></div>

  <BenchmarkRunner selectedModels={selectedModels} />

</div>

<Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: "#1f2937",
        color: "#fff",
      },
    }}
  />
  </div>

</div>
  )
}

export default App