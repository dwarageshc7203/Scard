import type { FC } from "react"
import { Trash2 } from "lucide-react"
import Button from "../ui/button"

export interface DangerZoneEditorProps {
  setShowDeleteConfirm: (val: boolean) => void
}

export const DangerZoneEditor: FC<DangerZoneEditorProps> = ({
  setShowDeleteConfirm,
}) => {
  return (
    <div className="space-y-6 flex-1">
      {/* Danger Zone / Delete Account */}
      <div className="space-y-3">
        <div className="text-xs text-red-500">Danger Zone</div>
        <p className="text-[11px] text-muted leading-relaxed">
          Permanently delete your Scard account and all related
          developer profiles, badge data, and contribution
          consolidations.
        </p>
        <Button
          onClick={() => setShowDeleteConfirm(true)}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 text-xs flex items-center gap-1.5 h-9 px-4"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </Button>
      </div>
    </div>
  )
}
