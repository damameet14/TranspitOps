interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({ title, message, confirmLabel, isProcessing = false, onConfirm, onCancel }: ConfirmationDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container confirmation-card" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><h3 id="confirmation-title" className="modal-title">{title}</h3><button type="button" className="modal-close-button" onClick={onCancel}>×</button></div>
        <div className="modal-body"><p className="text-secondary">{message}</p></div>
        <div className="modal-footer"><button type="button" className="button button-secondary" onClick={onCancel}>Keep record</button><button type="button" className="button button-danger" disabled={isProcessing} onClick={onConfirm}>{isProcessing ? 'Working...' : confirmLabel}</button></div>
      </div>
    </div>
  );
}
