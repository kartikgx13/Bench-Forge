import { useRef, useState } from "react"
import { uploadPrompts } from "../api/backend"
import { Upload } from "lucide-react"

function PromptUpload({ onUploadSuccess }) {

  const fileInputRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [fileName, setFileName] = useState("")

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {

    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)
    setMessage("")

    try {

      const res = await uploadPrompts(file)

      setMessage(`Uploaded ${res.data.num_prompts} prompts`)

      // ✅ notify parent (IMPORTANT for step flow)
      if (onUploadSuccess) {
        onUploadSuccess()
      }

    } catch {
      setMessage("Upload failed.")
    }

    setUploading(false)
  }

  return (

    <div className="mb-10">

      {/* ✅ Step Label */}
      <h3 className="text-lg font-semibold text-gray-300 mb-2">
        Step 1 • Upload Prompts
      </h3>

      <div className="flex items-center gap-4">

        <button
          onClick={handleClick}
          disabled={uploading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 text-sm font-medium rounded-lg disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* ✅ File name */}
        {fileName && (
          <span className="text-gray-400 text-sm">
            {fileName}
          </span>
        )}

        {/* ✅ Success indicator */}
        {message && !uploading && (
          <span className="text-green-400 text-sm">
            ✓ {message}
          </span>
        )}

      </div>

      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

    </div>
  )
}

export default PromptUpload