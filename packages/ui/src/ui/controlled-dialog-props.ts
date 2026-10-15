/**
 * Base props for a controlled dialog/modal: the parent owns the open state and
 * receives change events. Feature dialogs extend this with their own payload
 * (e.g. `onComplete`, an entity being edited) instead of re-declaring the
 * open/onOpenChange pair.
 */
export interface ControlledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
