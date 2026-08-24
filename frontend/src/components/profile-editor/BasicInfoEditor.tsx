import type { FC } from "react"
import Input from "../ui/input"
import ValidationTooltip from "../ui/ValidationTooltip"

interface BasicInfoEditorProps {
  username: string
  setUsername: (val: string) => void
  isUsernameTaken: boolean
  isCheckingUsername: boolean
  originalUsername: string
  profileName: string
  setProfileName: (val: string) => void
  designation: string
  setDesignation: (val: string) => void
}

const BasicInfoEditor: FC<BasicInfoEditorProps> = ({
  username,
  setUsername,
  isUsernameTaken,
  isCheckingUsername,
  originalUsername,
  profileName,
  setProfileName,
  designation,
  setDesignation,
}) => {
  return (
    <div className="space-y-5 flex-1">
      <h3 className="text-sm text-text mb-4">"Yourself?"</h3>

      {/* Username */}
      <div>
        <label className="text-[11px] text-muted tracking-wider mb-2 block">
          Username
        </label>
        <div className="relative">
          <ValidationTooltip
            message="This username is already taken."
            visible={isUsernameTaken && !isCheckingUsername}
          />
          <Input
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, ""),
              )
            }
            placeholder="e.g. dwaragesh"
            className={`w-full ${isUsernameTaken ? "border-red-500 focus:ring-red-500" : ""}`}
          />
        </div>
        {isCheckingUsername ? (
          <p className="text-[10px] text-muted mt-1">
            Checking availability...
          </p>
        ) : username && username !== originalUsername && !isUsernameTaken ? (
          <p className="text-[10px] text-green-500 mt-1">
            Username is good to proceed!
          </p>
        ) : (
          <p className="text-[10px] text-muted mt-1">
            Rules: alphanumeric and no symbols or spaces.
          </p>
        )}
      </div>

      <div>
        <label className="text-[11px] text-muted tracking-wider mb-2 block">
          Display Name
        </label>
        <Input
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="e.g. Dwaragesh C"
          className="w-full"
        />
        <p className="text-[10px] text-muted mt-1">
          This is the name displayed on your profile.
        </p>
      </div>

      {/* Designation */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-muted">
          Designation
        </label>
        <Input
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="e.g. Software Engineer"
          className="bg-surface border-border"
        />
      </div>
    </div>
  )
}

export default BasicInfoEditor
