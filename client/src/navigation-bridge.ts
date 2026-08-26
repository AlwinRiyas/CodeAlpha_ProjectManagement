const clickButtonByText = (buttons: NodeListOf<HTMLButtonElement>, text: string) => {
  const button = Array.from(buttons).find((item) => item.textContent?.trim().toLowerCase().includes(text.toLowerCase()));
  button?.click();
};

const afterProjectOpens = (tab: string) => {
  window.setTimeout(() => {
    const tabs = document.querySelectorAll<HTMLButtonElement>('.workspace-tabs button');
    clickButtonByText(tabs, tab);
  }, 100);
};

export function installProjectFlowNavigation() {
  const root = document.getElementById('root');
  if (!root) return;

  const bind = () => {
    const navButtons = document.querySelectorAll<HTMLButtonElement>('.primary-nav button');
    if (navButtons.length < 4) return;

    const [home, myWork, calendar, inbox] = Array.from(navButtons);
    if (myWork.dataset.navigationBound === 'true') return;

    home.dataset.navigationBound = 'true';
    myWork.dataset.navigationBound = 'true';
    calendar.dataset.navigationBound = 'true';
    inbox.dataset.navigationBound = 'true';

    myWork.addEventListener('click', () => {
      const projects = document.querySelectorAll<HTMLButtonElement>('.side-project');
      if (!projects.length) return;
      projects[0].click();
      afterProjectOpens('List');
    });

    calendar.addEventListener('click', () => {
      const projects = document.querySelectorAll<HTMLButtonElement>('.side-project');
      if (!projects.length) return;
      projects[0].click();
      afterProjectOpens('Calendar');
    });

    inbox.addEventListener('click', () => {
      const notification = document.querySelector<HTMLButtonElement>('.top-icon');
      notification?.click();
      window.setTimeout(() => {
        const existing = document.querySelector('.projectflow-inbox-note');
        if (existing) return;
        const note = document.createElement('div');
        note.className = 'projectflow-inbox-note';
        note.textContent = 'Inbox is connected to your real-time notifications. Check the notification control in the top bar for unread activity.';
        Object.assign(note.style, {
          position: 'fixed',
          right: '28px',
          top: '82px',
          zIndex: '100',
          maxWidth: '360px',
          padding: '14px 16px',
          border: '1px solid #dedfd9',
          borderRadius: '12px',
          background: '#fff',
          color: '#171816',
          boxShadow: '0 16px 40px rgba(30,31,27,.14)',
          font: '500 12px Inter, system-ui, sans-serif',
          lineHeight: '1.5'
        });
        note.addEventListener('click', () => note.remove());
        document.body.appendChild(note);
        window.setTimeout(() => note.remove(), 4000);
      }, 50);
    });
  };

  bind();
  const observer = new MutationObserver(bind);
  observer.observe(root, { childList: true, subtree: true });
}
