import React from 'react';

const Ico = ({ d, size = 20, fill = 'none', stroke = 'currentColor', sw = 2, children, vb = '0 0 24 24', ...rest }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const IHome = p => <Ico {...p}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></Ico>;
export const IMap = p => <Ico {...p}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></Ico>;
export const ICar = p => <Ico {...p}><path d="M5 17h14M3 17v-4l2-6a2 2 0 0 1 2-1.4h10a2 2 0 0 1 2 1.4l2 6v4" /><circle cx="7" cy="17" r="2" fill="currentColor" /><circle cx="17" cy="17" r="2" fill="currentColor" /></Ico>;
export const IClock = p => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ico>;
export const IHistory = p => <Ico {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></Ico>;
export const IUser = p => <Ico {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Ico>;
export const IUsers = p => <Ico {...p}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8" /><path d="M22 21a7 7 0 0 0-5-6.7" /></Ico>;
export const ILock = p => <Ico {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Ico>;
export const IMail = p => <Ico {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Ico>;
export const IChev = p => <Ico {...p}><path d="M9 6l6 6-6 6" /></Ico>;
export const IChevL = p => <Ico {...p}><path d="M15 6l-6 6 6 6" /></Ico>;
export const ICheck = p => <Ico {...p}><path d="M5 12l5 5 9-11" /></Ico>;
export const IWallet = p => <Ico {...p}><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18" /><circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none" /></Ico>;
export const IBell = p => <Ico {...p}><path d="M6 10a6 6 0 1 1 12 0c0 4 2 5 2 7H4c0-2 2-3 2-7z" /><path d="M10 21a2 2 0 0 0 4 0" /></Ico>;
export const ISearch = p => <Ico {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Ico>;
export const IChart = p => <Ico {...p}><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 6-7" /></Ico>;
export const ISignal = p => <Ico {...p}><path d="M2 20h4v-7H2zM10 20h4V9h-4zM18 20h4V4h-4z" fill="currentColor" stroke="none" /></Ico>;
export const ICog = p => <Ico {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.9l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></Ico>;
export const ILocation = p => <Ico {...p}><path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" /><circle cx="12" cy="9" r="3" /></Ico>;
export const IAlertTriangle = p => <Ico {...p}><path d="M10.3 3.5L2 19h20L13.7 3.5a2 2 0 0 0-3.4 0z" /><path d="M12 9v5M12 16v1" /></Ico>;
export const IGate = p => <Ico {...p}><rect x="2" y="19" width="4" height="2" rx="1" /><rect x="18" y="19" width="4" height="2" rx="1" /><path d="M6 20h12" /><rect x="10" y="4" width="4" height="16" rx="1" /><path d="M2 4h4M18 4h4" /></Ico>;
