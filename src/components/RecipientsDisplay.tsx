import { useEffect, useRef, useState } from 'react';
import RecipientsBadge from "./RecipientsBadge";
  
function RecipientTooltip({ recipients, visible }: { recipients: string[]; visible: boolean }){
    if (!visible) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: '8px',
          right: '8px',
          padding: '8px 16px',
          backgroundColor: '#666',
          color: '#f0f0f0',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        {recipients.join(', ')}
      </div>
    );
};

export default function RecipientsDisplay({recipients} :{recipients: String[]}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([]);
  const [showBadge, setShowBadge] = useState(false);
  const [trimmedCount, setTrimmedCount] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const calculateVisibleRecipients = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const testSpan = document.createElement('span');
    testSpan.style.visibility = 'hidden';
    testSpan.style.whiteSpace = 'nowrap';
    testSpan.style.position = 'absolute';
    testSpan.style.font = getComputedStyle(containerRef.current).font;
    document.body.appendChild(testSpan);

    let displayed: string[] = [];
    let trimmedRecipients = 0;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = i === 0 ? recipients[i] : `, ${recipients[i]}`;
      testSpan.textContent = (displayed.join(', ') + recipient).trim();
      const widthWithRecipient = testSpan.offsetWidth;

      if (widthWithRecipient <= containerWidth) {
        displayed.push(recipients[i] as string);
      } else {
        if (i === 0) {
          let truncated = recipients[i];
          for (let j = truncated.length; j >= 0; j--) {
            testSpan.textContent = truncated.slice(0, j) + '...';
            if (testSpan.offsetWidth <= containerWidth) {
              displayed = [truncated.slice(0, j) + '...'];
              break;
            }
          }
          trimmedRecipients = recipients.length - 1;
        } else {
          trimmedRecipients = recipients.length - i;
          if (displayed.length > 0) {
            testSpan.textContent = displayed.join(', ') + ', ...';
            if (testSpan.offsetWidth <= containerWidth) {
            } else {
              displayed.pop();
              trimmedRecipients++;
            }
          }
        }
        break;
      }
    }

    setVisibleRecipients(displayed);
    setTrimmedCount(trimmedRecipients);
    setShowBadge(trimmedRecipients > 0);
    document.body.removeChild(testSpan);
  };

  useEffect(() => {
    calculateVisibleRecipients();
  }, [recipients]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
      }}
    >
      <span>
        {visibleRecipients.join(', ')}
        {showBadge && ', ...'}
      </span>
      {showBadge && (
        <div
          style={{ marginLeft: '8px', cursor: 'pointer' }}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <RecipientsBadge numTruncated={trimmedCount} />
        </div>
      )}
      <RecipientTooltip recipients={recipients.map(String)} visible={tooltipVisible} />
    </div>
  );
};