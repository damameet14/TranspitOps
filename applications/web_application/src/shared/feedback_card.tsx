interface FeedbackCardProps {
  message: string;
  tone?: 'error' | 'success' | 'warning' | 'info';
  onDismiss?: () => void;
}

export default function FeedbackCard({ message, tone = 'error', onDismiss }: FeedbackCardProps) {
  if (!message) return null;
  return (
    <div className={`feedback-card feedback-card-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <div><strong>{tone === 'error' ? 'Action not completed' : 'Update'}</strong><p>{message}</p></div>
      {onDismiss && <button type="button" className="feedback-card-dismiss" onClick={onDismiss} aria-label="Dismiss message">×</button>}
    </div>
  );
}
