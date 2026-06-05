import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Home,
  Lock,
  RotateCw,
} from "lucide-react";
import { FC, FormEvent, useMemo, useState } from "react";

const HOME_URL = "https://example.com";

type BrowserPaneProps = {
  fixedTitle?: string;
  fixedUrl?: string;
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return HOME_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

const BrowserPane: FC<BrowserPaneProps> = ({ fixedTitle, fixedUrl }) => {
  const homeUrl = fixedUrl ?? HOME_URL;
  const isFixedWebApp = Boolean(fixedUrl);
  const [history, setHistory] = useState([homeUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [address, setAddress] = useState(homeUrl);
  const [frameRevision, setFrameRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentUrl = history[historyIndex];
  const hostname = useMemo(() => {
    try {
      return new URL(currentUrl).hostname;
    } catch {
      return currentUrl;
    }
  }, [currentUrl]);

  function navigate(nextValue: string) {
    if (isFixedWebApp) {
      return;
    }

    const nextUrl = normalizeUrl(nextValue);

    setHistory((current) => [...current.slice(0, historyIndex + 1), nextUrl]);
    setHistoryIndex((current) => current + 1);
    setAddress(nextUrl);
    setIsLoading(true);
  }

  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(address);
  }

  function goBack() {
    if (isFixedWebApp) {
      return;
    }

    setHistoryIndex((current) => {
      const nextIndex = Math.max(0, current - 1);
      setAddress(history[nextIndex]);
      setIsLoading(true);
      return nextIndex;
    });
  }

  function goForward() {
    if (isFixedWebApp) {
      return;
    }

    setHistoryIndex((current) => {
      const nextIndex = Math.min(history.length - 1, current + 1);
      setAddress(history[nextIndex]);
      setIsLoading(true);
      return nextIndex;
    });
  }

  function reload() {
    setFrameRevision((current) => current + 1);
    setIsLoading(true);
  }

  function goHome() {
    if (isFixedWebApp) {
      setHistory([homeUrl]);
      setHistoryIndex(0);
      setAddress(homeUrl);
      setFrameRevision((current) => current + 1);
      setIsLoading(true);
      return;
    }

    navigate(HOME_URL);
  }

  function openExternal() {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className={`browser-pane ${isFixedWebApp ? "browser-pane--fixed" : ""}`}>
      <div className="browser-pane__toolbar">
        {!isFixedWebApp && (
          <>
            <button
              aria-label="Back"
              title="Back"
              onClick={goBack}
              disabled={historyIndex === 0}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              aria-label="Forward"
              title="Forward"
              onClick={goForward}
              disabled={historyIndex === history.length - 1}
            >
              <ArrowRight size={17} />
            </button>
          </>
        )}
        <button aria-label="Reload" title="Reload" onClick={reload}>
          <RotateCw size={16} />
        </button>
        <button aria-label="Home" title="Home" onClick={goHome}>
          <Home size={16} />
        </button>
        <form className="browser-pane__address" onSubmit={submitAddress}>
          <Lock size={14} aria-hidden="true" />
          {isFixedWebApp ? (
            <span>{fixedTitle ? `${fixedTitle} - ${currentUrl}` : currentUrl}</span>
          ) : (
            <input
              aria-label="URL"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              spellCheck={false}
            />
          )}
        </form>
        {!isFixedWebApp && (
          <button
            aria-label="Open externally"
            title="Open externally"
            onClick={openExternal}
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>
      <div className="browser-pane__viewport">
        <iframe
          key={`${currentUrl}-${frameRevision}`}
          title={hostname}
          src={currentUrl}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <div className="browser-pane__loading" aria-live="polite">
            Loading {hostname}
          </div>
        )}
      </div>
      <div className="browser-pane__status">
        <span>{hostname}</span>
        {!isFixedWebApp && (
          <span>Some sites block embedded display; use external open when needed.</span>
        )}
      </div>
    </section>
  );
};

BrowserPane.displayName = "BrowserPane";

export default BrowserPane;
