import React from "react";

interface AppIconProps {
  iconKey?: string | null;
  name: string;
  isSelected?: boolean;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  iconKey,
  name,
  isSelected = false,
  className = "w-7 h-7",
}) => {
  const normalizedKey = (iconKey || name).toLowerCase().replace(/[^a-z0-9]/g, "");

  // Base styling for the icon container
  const containerClasses = `${className} rounded-lg flex items-center justify-center shrink-0 transition-colors ${
    isSelected
      ? "bg-white/20 text-white"
      : "bg-brand-100 text-brand-700"
  }`;

  // SVG dimensions for inner icons
  const svgClass = "w-4 h-4";

  switch (normalizedKey) {
    case "chatgpt":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
            <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" />
            <path d="m9 9 6 6m0-6-6 6" />
          </svg>
        </div>
      );

    case "claude":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
            <circle cx="18" cy="18" r="2" />
            <circle cx="6" cy="18" r="1.5" />
          </svg>
        </div>
      );

    case "gemini":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" />
          </svg>
        </div>
      );

    case "manus":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18V6l8 8 8-8v12" />
          </svg>
        </div>
      );

    case "perplexity":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
          </svg>
        </div>
      );

    case "deepseek":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a9 9 0 0 0-9 9c0 3.5 2 6.5 5 8l1-3a5 5 0 1 1 6 0l1 3c3-1.5 5-4.5 5-8a9 9 0 0 0-9-9z" />
            <circle cx="9.5" cy="10" r="1.5" fill="currentColor" />
            <circle cx="14.5" cy="10" r="1.5" fill="currentColor" />
          </svg>
        </div>
      );

    case "grok":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l16 16M4 20L20 4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
      );

    case "copilot":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="4" />
            <circle cx="8.5" cy="16" r="1.5" fill="currentColor" />
            <circle cx="15.5" cy="16" r="1.5" fill="currentColor" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      );

    case "poe":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 9h8m-8 4h5" />
          </svg>
        </div>
      );

    case "youtube":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.42a2.5 2.5 0 0 0-1.76 1.77A26.5 26.5 0 0 0 2 12a26.5 26.5 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26.5 26.5 0 0 0 22 12a26.5 26.5 0 0 0-.42-4.81zM10 15V9l5.2 3L10 15z" />
          </svg>
        </div>
      );

    case "x":
    case "twitter":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      );

    case "instagram":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
      );

    case "reddit":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5.01 11.23c.03.17.04.35.04.53 0 2.69-3.13 4.87-7 4.87s-7-2.18-7-4.87c0-.18.01-.36.04-.53a1.86 1.86 0 0 1-.77-1.49 1.87 1.87 0 0 1 3.19-1.32 8.44 8.44 0 0 1 4.39-1.28l.84-3.95 2.76.59a1.32 1.32 0 1 1 2.58.45 1.33 1.33 0 0 1-1.32 1.32 1.31 1.31 0 0 1-1.26-.95l-2.28-.49-.71 3.33a8.4 8.4 0 0 1 4.33 1.28 1.87 1.87 0 0 1 3.19 1.32 1.86 1.86 0 0 1-.77 1.49zm-8.26-1.02a1.14 1.14 0 1 0 1.14 1.14 1.14 1.14 0 0 0-1.14-1.14zm6.5 2.28a1.14 1.14 0 1 0-1.14-1.14 1.14 1.14 0 0 0 1.14 1.14z" />
          </svg>
        </div>
      );

    case "facebook":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </div>
      );

    case "tiktok":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        </div>
      );

    case "linkedin":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92m-1.4 9.74h2.8v-8.37h-2.8v8.37z" />
          </svg>
        </div>
      );

    case "netflix":
      return (
        <div className={containerClasses}>
          <span className="font-extrabold text-sm tracking-tighter">N</span>
        </div>
      );

    case "spotify":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.58 14.43a.62.62 0 0 1-.86.21 9.87 9.87 0 0 0-5.58-1.57 9.94 9.94 0 0 0-3.75.72.63.63 0 0 1-.52-1.15 11.23 11.23 0 0 1 4.27-.82 11.13 11.13 0 0 1 6.23 1.75.63.63 0 0 1 .21.86zm1.23-2.73a.79.79 0 0 1-1.08.26 12.35 12.35 0 0 0-7-1.95 12.44 12.44 0 0 0-4.68.9.79.79 0 0 1-.65-1.44 14.02 14.02 0 0 1 5.33-1.03 13.93 13.93 0 0 1 7.82 2.18.79.79 0 0 1 .26 1.08zm.13-2.85a14.82 14.82 0 0 0-8.37-2.33 14.94 14.94 0 0 0-5.69 1.1.94.94 0 0 1-.78-1.72 16.82 16.82 0 0 1 6.47-1.25 16.7 16.7 0 0 1 9.43 2.62.94.94 0 0 1-.29 1.63.95.95 0 0 1-.77-.05z" />
          </svg>
        </div>
      );

    case "twitch":
      return (
        <div className={containerClasses}>
          <svg className={svgClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.57 1.43L2 6.57V18h4.57v3.43l3.43-3.43h3.43l6.57-6.57V1.43H11.57zm7.43 9.14l-3.43 3.43h-3.43l-2.29 2.29v-2.29H6.57V3.71h12.43v6.86zM15.43 6h-2v4h2V6zm-5.14 0h-2v4h2V6z" />
          </svg>
        </div>
      );

    default:
      return (
        <div className={containerClasses}>
          <span className="text-xs font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
  }
};
