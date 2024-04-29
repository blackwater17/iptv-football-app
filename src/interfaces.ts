export interface SportEvent {
    link: string;
    timeInteger: number;
    date: string | null;
    timeFloat: number;
    eventType: string;
    league: string;
    eventName: string;
    day: string | null;
    visibleChannels: string[]
}

export interface MediaEntry {
    // extinf: string;
    url: string;
    tvgName: string;
    tvgLogo: string;
    groupTitle: string;
  }