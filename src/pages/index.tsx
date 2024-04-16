import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import '../app/globals.css';
import popularCountryCodes from '../../utils/popularCountryCodes';
import { fetchHTML, getLeagueObjects, fetchFoundChannels } from '../../utils/functions';
import { SportEvent } from '../interfaces';

import EventGroupContainer from '../app/components/EventGroupContainer';
import EventNoGroupContainer from '../app/components/EventNoGroupContainer';
import InputsContainer from '../app/components/InputsContainer';
import PopularChannels from '../app/components/PopularChannels';
import PopularFlags from '../app/components/PopularFlags';
import WatchFromList from '../app/components/WatchFromList';
import ChannelsList from '../app/components/ChannelsList';


export default function Home() {

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [subQueries, setSubQueries] = useState<string[]>([]);
  const subInputRef = useRef<HTMLInputElement>(null);
  const [channels, setChannels] = useState([]);
  const [channelNames, setChannelNames] = useState<string[]>([]); // where to watch
  const [sportEventGroups, setSportEventGroups] = useState([]);
  const [allSportEvents, setAllSportEvents] = useState<SportEvent[]>([]);
  const [groupMatches, setGroupMatches] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [addedChannels, setAddedChannels] = useState(0);
  const [totalChannelsCount, setTotalChannelsCount] = useState(0);
  const [scanInProgress, setScanInProgress] = useState(false);

  const setWhereToWatchChannels = async (eventUrl: string) => {
    fetchHTML(eventUrl).then((htmlText: any) => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(htmlText, 'text/html');

      let channelNames: string[] = []
      let elements = Array.from(doc.querySelectorAll<HTMLTableRowElement>("#fullGuide tr td:nth-child(2)"));

      elements.forEach((element) => {
        let arr = element.textContent?.split(",").map(e => e.trim()) || [];
        arr.forEach((e) => {
          if (!channelNames.includes(e)) {
            channelNames.push(e);
          }
        });
      })

      if (channelNames.length === 0) {
        channelNames = Array.from(doc.querySelectorAll<HTMLElement>(".station.full")).map(e => e.textContent ?? "");
      }
      setChannelNames(channelNames);
    });
  }

  const queryChannels = async () => {
    try {
      const response = await fetch(`/api/getChannels?text=${inputValue}`);
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      } else {
        console.error('Failed to fetch channels.');
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // main - onKeyDown event
  const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {

    const subqueryInput = document.querySelector<HTMLInputElement>(".subquery");
    if (subqueryInput) {
      subqueryInput.value = "";
    }
    setSubQueries([]);

    if (event.key === "Enter") {
      setInputValue((event.target as HTMLInputElement).value);
    }
  };

  // sub - onChange evnet
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let text = event.target.value;
    let arr = text.split(" ").map((t) => {
      return t.trim().toLowerCase();
    });
    setSubQueries(arr);
  };

  // get all sport events info, and group them by league
  const getSportEventsGroups = async () => {

    const leagueObjects = getLeagueObjects();

    const allEvents = [];
    const todayNumber = new Date().getDate().toString();
    for (let i = 0; i < leagueObjects.length; i++) {
      let htmlText: string = await fetchHTML(leagueObjects[i].url) || ""
      let parser = new DOMParser();
      let doc = parser.parseFromString(htmlText, 'text/html');

      const articleDoms = [];
      const currentDayElement = doc.querySelector<HTMLSpanElement>(".dateSeparator span.date");
      let currentDay = currentDayElement?.textContent?.includes(todayNumber) ? currentDayElement.textContent : "";
      const arr = Array.from(doc.querySelectorAll<HTMLDivElement | HTMLTitleElement>('div, article'));

      for (let i = 0; i < arr.length; i++) {
        let div = arr[i];
        if (div.className === "dateSeparator") {
          const currentDayElement = div.querySelector<HTMLSpanElement>("span.date");
          currentDay = currentDayElement?.textContent ?? "";
        }
        if (div.className.includes("roundGame")) {
          div.setAttribute("day", currentDay);
          articleDoms.push(div);
        }
      }

      let events = articleDoms.map((eventContainer) => {
        try {
          const linkElement = eventContainer.querySelector<HTMLAnchorElement>("a");
          const dateElement = eventContainer.querySelector<HTMLBRElement>("b");

          if (!linkElement || !dateElement) {
            return null;
          }

          const eventObject = {
            link: linkElement.getAttribute("href") ?? "",
            date: dateElement.textContent ?? "",
            timeFloat: parseFloat(dateElement.textContent?.replace(":", ".") ?? ""),
            timeInteger: (parseInt(dateElement?.textContent?.split(":")[0] || "0") * 60) + parseInt(dateElement?.textContent?.split(":")[1] || "0"),
            eventType: "Football",
            league: leagueObjects[i].name,
            eventName: linkElement.getAttribute("title") ?? "",
            day: eventContainer.getAttribute("day") ?? ""
          };

          return eventObject;
        } catch (error) {
          console.error('Error parsing event:', error);
          return null;
        }
      }).filter((e): e is NonNullable<typeof e> => e !== null);

      events = events.filter(e => e.day.includes(todayNumber))

      allEvents.push({ events, name: leagueObjects[i].name });

      setAllSportEvents((prevEvents) => {
        return [...prevEvents, ...events].sort((a, b) => {
          if (a.timeFloat === b.timeFloat) {
            return prevEvents.indexOf(a) - prevEvents.indexOf(b);
          } else {
            return a.timeFloat > b.timeFloat ? 1 : -1;
          }
        });
      });

      await new Promise((r) => setTimeout(r, 1500));

    }
    return allEvents;
  }

  // getting events info
  useEffect(() => {
    getSportEventsGroups().then((eventGroups: any) => {
      setSportEventGroups(eventGroups);
    })
  }, []);

  // time interval 
  useEffect(() => {
    const date = new Date();
    const newTotalMinutes = date.getHours() * 60 + date.getMinutes();
    setTotalMinutes(newTotalMinutes);
    const interval = setInterval(() => {
      const date = new Date();
      const newTotalMinutes = date.getHours() * 60 + date.getMinutes();
      setTotalMinutes(newTotalMinutes);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputValue === "") {
      setChannels([]);
    } else {
      queryChannels();
    }
  }, [inputValue]);

  useEffect(() => {
    fetchFoundChannels(channelNames);
  }, [channelNames]);


  const renderFromCountry = (countryCode: string) => {

    if (subInputRef.current) {
      if (countryCode === "GB") countryCode = "UK";
      subInputRef.current.value = countryCode + ": ";
      let arr = subInputRef.current.value.split(" ").map((word: string) => {
        return word.trim().toLowerCase();
      });
      setSubQueries(arr);
    }

  }

  const resetFilters = () => {
    setSubQueries([]);
    setInputValue("");
    setChannelNames([]);
    if (inputRef.current && subInputRef.current) {
      inputRef.current.value = "";
      subInputRef.current.value = "";
    }
  }

  interface MediaEntry {
    // extinf: string;
    url: string;
    tvgName: string;
    tvgLogo: string;
    groupTitle: string;
  }

  function parseM3U(content: string): MediaEntry[] {
    const lines = content.split('\n');
    const mediaEntries: MediaEntry[] = [];

    for (let i = 1; i < lines.length; i += 2) {
      const extinf = lines[i].substring('#EXTINF:'.length).trim();

      // Extract properties from EXTINF line
      const [, tvgNameMatch] = extinf.match(/tvg-name="([^"]*)"/) || [];
      const [, tvgLogoMatch] = extinf.match(/tvg-logo="([^"]*)"/) || [];
      const [, groupTitleMatch] = extinf.match(/group-title="([^"]*)"/) || [];

      const tvgName = tvgNameMatch || '';
      const tvgLogo = tvgLogoMatch || '';
      const groupTitle = groupTitleMatch || '';

      const url = lines[i + 1].trim();

      mediaEntries.push({ url, tvgName, tvgLogo, groupTitle });
    }

    return mediaEntries;
  }

  async function uploadMediaEntriesInBulks(mediaEntries: MediaEntry[], batchSize: number) {
    const totalEntries = mediaEntries.length;
    setTotalChannelsCount(totalEntries);
    let startIndex = 0;
    let totalChannelsAdded = 0;

    while (startIndex < totalEntries) {
      const endIndex = Math.min(startIndex + batchSize, totalEntries);
      const batch = mediaEntries.slice(startIndex, endIndex);

      try {
        const response = await fetch('/api/createDatabase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mediaEntries: batch }), // Send entire batch
        });

        if (response.ok) {
          totalChannelsAdded += batch.length;
          // console.log(`${totalChannelsAdded}/${totalEntries} channels are added`);
          setAddedChannels(totalChannelsAdded);
        } else {
          console.error('Failed to create database:', response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
      // await new Promise(resolve => setTimeout(resolve, 5000));
      startIndex = endIndex;
    }

    window.location.reload();

  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string;
        const mediaEntries = parseM3U(content);
        const batchSize = 500;
        setScanInProgress(true);
        uploadMediaEntriesInBulks(mediaEntries, batchSize);
      }
    };

    reader.readAsText(file);
  }

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const checkDatabaseValidity = async () => {
    try {
      const response = await axios.post('/api/isDatabaseValid', {
        databaseName: process.env.DATABASE_NAME || '',
        collectionName: 'channels',
      });
      setIsValid(response.data.isValid);
    } catch (error) {
      console.error('Error checking database validity:', error);
    }
  };

  useEffect(() => {
    checkDatabaseValidity();
  }, [])

  return (
    <div className="content-container">

      <div className="text-white">
        {!scanInProgress && isValid !== null && (
          !isValid && (
            <div className="w-full max-w-md mx-auto p-6 text-center">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                className="hidden"
                accept=".m3u"
                aria-label="Upload playlist file"
              />
              <label
                htmlFor="file-input"
                className="block cursor-pointer bg-gray-100 hover:bg-gray-200 p-6 rounded-lg"
              >
                <span className="text-gray-500 text-lg font-semibold">To view your channels, click and load the .m3u playlist file (one-time only)</span>
              </label>
            </div>
          )
        )}
      </div>

      {scanInProgress &&
        <div className="fixed top-0 right-0 m-4 bg-gray-800 px-4 py-2 rounded-md">
          <p className="text-white text-center">
            {addedChannels}/{totalChannelsCount} channels added
          </p>
        </div>
      }

      {groupMatches &&
        <EventGroupContainer
          sportEventGroups={sportEventGroups}
          setChannelNames={setChannelNames}
          setWhereToWatchChannels={setWhereToWatchChannels}
          inputRef={inputRef}
          subInputRef={subInputRef}
        />}

      {!groupMatches &&
        <EventNoGroupContainer
          events={allSportEvents}
          totalMinutes={totalMinutes}
          setChannelNames={setChannelNames}
          setWhereToWatchChannels={setWhereToWatchChannels}
          inputRef={inputRef}
          subInputRef={subInputRef}
        />
      }

      <InputsContainer
        inputRef={inputRef}
        subInputRef={subInputRef}
        handleEnterKeyPress={handleEnterKeyPress}
        handleInputChange={handleInputChange}
        resetFilters={resetFilters}
        groupMatches={groupMatches}
        setGroupMatches={setGroupMatches}
      />

      <PopularChannels
        setInputValue={setInputValue}
        inputRef={inputRef}
        subInputRef={subInputRef}
        setSubQueries={setSubQueries}
      />

      <PopularFlags
        popularCountryCodes={popularCountryCodes}
        renderFromCountry={renderFromCountry}
      />

      <WatchFromList
        channelNames={channelNames}
        setInputValue={setInputValue}
        setSubQueries={setSubQueries}
        subInputRef={subInputRef}
      />

      <ChannelsList
        channels={channels}
        subQueries={subQueries}
      />

    </div>
  );
}
