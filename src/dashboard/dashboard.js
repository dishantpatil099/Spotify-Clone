import { fetchRequest } from "../api";
import {
  ENDPOINT,
  SECTIONTYPE,
  logout,
  getItemFromLocalStorage,
  setItemInLocalStorage,
  LOADED_TRACKS,
} from "../common";

const audio = new Audio();
let displayName;

const onProfileClick = (event) => {
  event.stopPropagation(); //niche ka event click samajke banda na karde
  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    //when the hidden class is not on profilemenu
    profileMenu.querySelector("li#logout").addEventListener("click", logout); //when not hidden and clicked on list item call logout function from common.js
  }
};

const loadUserProfile = async () => {
  return new Promise(async (resolve, reject) => {
    const defaultImage = document.querySelector("#default-image");
    const profileButton = document.querySelector("#user-profile-btn");
    const displayNameElement = document.querySelector("#display-name");

    const { display_name: displayName, images } = await fetchRequest(
      ENDPOINT.userInfo
    ); //fetchRequest will build the url acc to endpoint it will pass build the access token and tokentype and will pass it to url and will await and will return a json object
    if (images?.length) {
      defaultImage.classList.add("hidden");
    } else {
      defaultImage.classList.remove("hidden");
    }

    profileButton.addEventListener("click", onProfileClick);
    displayNameElement.textContent = displayName;
    resolve({ displayName });
  });
};

const onPlaylistItemClicked = (event, id) => {
  //getting id from fetch
  console.log(event.target);
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id }; //associating id with section to push in history
  history.pushState(section, "", `playlist/${id}`); //history api called passing state and what should be added to url that part
  //new state(section) of SECTIONTYPE PLAYLIST is creted pushing that state associated with its playlist url
  //then calling the loadSection with new state
  loadSection(section);
};

const loadPlaylist = async (endpoint, elementId) => {
  //making a common func to loadplaylist
  // this func will take parameter from loadPlaylists  will get endpoint and element id
  //for this api req we get playlist obj which contains items each item has name , image , description

  const {
    playlists: { items },
  } = await fetchRequest(endpoint);
  const playlistItemsSection = document.querySelector(`#${elementId}`);

  for (let { name, description, images, id } of items) {
    //iterating for all items
    const playlistItem = document.createElement("section");
    playlistItem.className =
      " bg-black-secondary rounded p-4 hover:cursor-pointer hover:bg-light-black";
    playlistItem.id = id;
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClicked(event, id)
    );

    const [{ url: imageUrl }] = images; //only selecting image at 0th index

    //for section #featured-playlist-items its innerHTML will be playlistElem
    playlistItem.innerHTML = ` <img src="${imageUrl}" alt="${name}"  class="rounded mb-2 object-contain shadow"/> 
                                    <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
                                    <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`; //line clamp plugin from tailwind
    playlistItemsSection.appendChild(playlistItem); //appending   playlistElem to the content -> article ->section
  }
};

const loadPlaylists = () => {
  loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
  loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
};

const fillContentForDashboard = () => {
  //instead of hard coding as featured and toplist had same html we gented it programmaticaly
  const coverContent = document.querySelector("#cover-content");
  coverContent.innerHTML = `<h1 class="text-5xl">Hello ${displayName}</h1>`;
  const pageContent = document.querySelector("#page-content");
  const playlistMap = new Map([
    ["featured", "featured-playlist-items"],
    ["top playlists", "top-playlist-items"],
  ]);
  let innerHTML = "";
  for (let [type, id] of playlistMap) {
    innerHTML += `<article class="p-4">
    <h1 class="text-2xl font-bold capitalize mb-4">${type}</h1>
    <section
      class="featured-songs grid grid-cols-auto-fill-cards gap-4"
      id="${id}"
    >
    </section>
  </article>`;
  }
  pageContent.innerHTML = innerHTML;
};

const formatTime = (duration) => {
  const min = Math.floor(duration / 60_000);
  const sec = ((duration % 6_000) / 1000).toFixed(0);
  const formattedTime =
    sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};

const onTrackSelection = (id, event) => {
  //whentrack selected keep it hovered highlight
  document.querySelectorAll("#tracks .track").forEach((trackItem) => {
    if (trackItem.id === id) {
      //the track clicked will be provided as an event with playlist id all track ids will be checked for the clicked id
      trackItem.classList.add("bg-gray", "selected");
    } else {
      trackItem.classList.remove("bg-gray", "selected"); //the one not selected and even has the classes will be removed with those classes
    }
  });
};

// const timeline = document.querySelector("")

const updateIconsForPlayMode = (id) => {
  const playButton = document.querySelector("#play");
  //getting id of the track played in plalist
  playButton.querySelector("span").textContent = "pause_circle";
  const playButtonFromTracks = document.querySelector(`#play-track-${id}`); //which was dynamically programatically made in loadPalylisttrack
  if (playButtonFromTracks) {
    //when we go to dashboard this playbutton will not be available as playlist is no longer opened
    playButtonFromTracks.textContent = "pause";
  }
};

const updateIconsForPauseMode = (id) => {
  const playButton = document.querySelector("#play");
  //getting id of the track played in plalist
  playButton.querySelector("span").textContent = "play_circle";
  const playButtonFromTracks = document.querySelector(`#play-track-${id}`); //which was dynamically programatically made in loadPalylisttrack
  if (playButtonFromTracks) {
    //when we go to dashboard this playbutton will not be available as playlist is no longer opened
    playButtonFromTracks.textContent = "play_arrow";
  }
};

const onAudioMetadataLoaded = (id) => {
  const totalSongDuration = document.querySelector("#total-song-duration");
  totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
};

// const onNowPlayingPlayButtonClicked = (id) => {
//   if (audio.paused) {
//     audio.play();
//     updateIconsForPlayMode(id);
//   } else {
//     audio.pause();
//     updateIconsForPauseMode(id);
//   }
// };

const togglePlay = () => {
  if (audio.src) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
};

const findCurrentTrack = () => {
  const audioControl = document.querySelector("#audio-control");
  const trackId = audioControl.getAttribute("data-track-id"); //getting track having data-track-id ie.e it is playing
  if (trackId) {
    const loadedTracks = getItemFromLocalStorage(LOADED_TRACKS); //getting all loaded tracks in local storage
    const currentTrackIndex = loadedTracks?.findIndex(
      (track) => track.id === trackId
    ); //selecting track which has same id as current playing track
    return { currentTrackIndex, tracks: loadedTracks }; //return all tracks and current track playing id
  }
  return null;
};

const playNextTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {}; //if nothing comes from findCurrentTrack then setcurent index to -1 and all tracks to none this is done so that is next click when not in playlist
  if (currentTrackIndex > -1 && currentTrackIndex < tracks.length - 1) {
    //checking if not last track
    playTrack(null, tracks[currentTrackIndex + 1]); //playing next track
  }
};

const playPrevTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > 0) {
    playTrack(null, tracks[currentTrackIndex - 1]);
  }
};

const playTrack = (
  event,
  { image, artistNames, name, duration, previewUrl, id }
) => {
  if (event?.stopPropagation) {
    //optional chaining
    event.stopPropagation(); //it is not necessary to keep the current playing song highlighted
  }

  if (audio.src === previewUrl) {
    //getting from audio element itself
    togglePlay();
  } else {
    //getting all as parameter when playbutton clicked
    console.log(image, artistNames, name, duration, previewUrl, id);

    const nowPlayingSongImage = document.querySelector("#now-playing-image");
    const songTitle = document.querySelector("#now-playing-song");
    const artists = document.querySelector("#now-playing-artists");
    const audioControl = document.querySelector("#audio-control");

    const songInfo = document.querySelector("#song-info");

    audioControl.setAttribute("data-track-id", id);

    nowPlayingSongImage.src = image.url;
    songTitle.textContent = name;
    artists.textContent = artistNames;

    audio.src = previewUrl;
    audio.play();
    songInfo.classList.remove("invisible");
  }
};

const loadPlaylistTracks = ({ tracks }) => {
  //from recieved plalist obj we take track
  const trackSections = document.querySelector("#tracks"); //from html we select the track id element which comes in pagecontent below header
  //every track will be appended here

  let trackNo = 1;
  const loadedTracks = []; //for every playlist

  for (let trackItem of tracks.items.filter((item) => item.track.preview_url)) {
    //only select tracks with preview url
    let {
      id,
      artists,
      name,
      album,
      duration_ms: duration,
      preview_url: previewUrl,
    } = trackItem.track; //every tracks item will have this info
    let track = document.createElement("section"); //creating this section programatically bcoz we want to add click event to it //in tracks section creating another section for every album in track
    track.id = id;
    track.className =
      "track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center justify-items-start gap-4 text-secondary rounded-md hover:bg-light-black";
    let image = album.images.find((img) => img.height === 64); //particular track image smallest size to fit
    let artistNames = Array.from(artists, (artist) => artist.name).join(", ");
    //for each track in tracks of playlist clicked //innerhtml will be
    track.innerHTML = `
    <p class=" relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackNo++}</span></p>
      <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
        <img class="h-10 w-10" src="${image.url}" alt="${name}" />
        <article class="flex flex-col gap-2 justify-center ">
          <h2 class=" song-title text-primary text-base line-clamp-1">${name}</h2>
          <p class="text-xs line-clamp-1">${artistNames}</p>
        </article>
      </section>
    <p class="text-sm">${album.name}</p>
    <p class="text-sm">${formatTime(duration)}</p>
    `;

    track.addEventListener("click", (event) => onTrackSelection(id, event)); //to keep a selected track highlighted

    //creating a button element to play a song
    const playButton = document.createElement("button");
    playButton.id = `play-track-${id}`;
    playButton.className = `play w-full absolute left-0 text-lg invisible material-symbols-outlined`;
    playButton.textContent = "play_arrow";
    playButton.addEventListener("click", (event) =>
      playTrack(event, { image, artistNames, name, duration, previewUrl, id })
    );
    //this is done in the upper for loop which runs for all tracks within a playlist  every track has all info which we need to pass to playtrack func
    track.querySelector("p").appendChild(playButton); //getting the first p tag of the ongoing track in loop i.e. track-no (p tag) and setting it to play
    trackSections.appendChild(track); //to tracksections we append this to display //to keep it highlighted

    loadedTracks.push({
      id,
      artists,
      name,
      album,
      duration,
      previewUrl,
      artistNames,
      image,
    }); //pushing every track in playlist to local storage
  }

  setItemInLocalStorage(LOADED_TRACKS, loadedTracks); //adding all tracks to local storage
};

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`); //this id was pushed in history
  console.log(playlist);
  const { name, description, images, tracks } = playlist;
  const coverElement = document.querySelector("#cover-content");
  coverElement.innerHTML = `
        <img  class="object-contain" src="${images[0].url}" alt="${name}" />
        <section class="flex flex-col justify-center">
          <h2 id="playlist-name" class="text-5xl font-bold">${name}</h2>
          <p id="playlist-details" class="text-l pt-4">${description}</p>
          <p id="playlist-details" class="text-base">${tracks.items.length} songs</p>
        </section>
    `;

  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML = `
  <header id="playlist-header" class="mx-8  border-secondary border-b-[0.5px] z-10">
    <nav class="py-2">
      <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-secondary">
        <li class="justify-self-center">#</li>
        <li>Title</li>
        <li>Album</li>
        <li>🕑</li>
      </ul>
    </nav>
  </header>
  <section class="px-8 text-secondary mt-4" id="tracks">
  </section>
  `;
  //adding header only need to added once

  loadPlaylistTracks(playlist); //providing playlist id and url we fetch plalist json obj and pass it to loadplaylistfortrack func

  console.log(playlist);
};

const onContentScroll = (event) => {
  const { scrollTop } = event.target;
  const header = document.querySelector(".header");
  const coverElement = document.querySelector("#cover-content");
  const totalHeight = coverElement.offsetHeight;
  const coverOpacity =
    100 - (scrollTop >= totalHeight ? 100 : (scrollTop / totalHeight) * 100);
  const headerOpacity =
    scrollTop >= header.offsetHeight ? 100 : (scrollTop / totalHeight) * 100;
  coverElement.style.opacity = `${coverOpacity}%`;
  header.style.background = `rgba(0 0 0 / ${headerOpacity}%)`;

  if (history.state.type === SECTIONTYPE.PLAYLIST) {
    //as section playlist will be pushed in history
    const coverElement = document.querySelector("#cover-content");
    const playlistHeader = document.querySelector("#playlist-header");
    if (coverOpacity <= 35) {
      playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8");
      //making the title duration header sticky after scrolling
      playlistHeader.classList.remove("mx-8"); //expamding the border below title , duration
      playlistHeader.style.top = `${header.offsetHeight}px`;
    } else {
      playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8");
      //making the title duration header sticky after scrolling
      playlistHeader.classList.add("mx-8");
      playlistHeader.style.top = `revert`;
    }
  }
};

const onUserPlaylistClick = (id) => {
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id }; //making a section that is playlist section which comes from fillplaylist when a playlist id is provided
  history.pushState(section, "", `/dashboard/playlist/${id}`); //pushing in histry state  with this url
  loadSection(section); //and this section is load
};

const loadUserPlaylists = async () => {
  //creating func to display users plalist
  const playlists = await fetchRequest(ENDPOINT.userPlaylist); //getting the playlist object by fetching by passing usersplaylist url
  console.log(playlists);
  const userPlaylistSection = document.querySelector("#user-playlists > ul"); //selecting in nav users playlist location
  userPlaylistSection.innerHTML = "";
  for (let { name, id } of playlists.items) {
    const li = document.createElement("li");
    li.textContent = name;
    li.className = "cursor-pointer hover:text-primary";
    li.addEventListener("click", () => {
      onUserPlaylistClick(id);
    });
    userPlaylistSection.appendChild(li); //append each li to location
  }
};

// dynamically load  section acc to where we are
const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    fillContentForDashboard();
    loadPlaylists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    //load the elements for playlist
    fillContentForPlaylist(section.playlist);
  }

  document
    .querySelector(".content")
    .removeEventListener("scroll", onContentScroll);
  document
    .querySelector(".content")
    .addEventListener("scroll", onContentScroll);
};

document.addEventListener("DOMContentLoaded", async () => {
  const volume = document.querySelector("#volume");
  const playButton = document.querySelector("#play");
  const songDurationCompleted = document.querySelector(
    "#song-duration-completed"
  );
  const songProgress = document.querySelector("#progress");
  const timeline = document.querySelector("#timeline");
  const audioControl = document.querySelector("#audio-control");
  const next = document.querySelector("#next");
  const prev = document.querySelector("#prev");

  let progressInterval;
  ({ displayName } = await loadUserProfile());
  loadUserPlaylists(); //oncce display is available from loadUserProfile we load the plalist
  const section = { type: SECTIONTYPE.DASHBOARD };
  // playlist/37i9dQZF1DX0XUsuxWHRQd
  // const section = { type: SECTIONTYPE.PLAYLIST, playlist: "37i9dQZF1DX7cLxqtNO3zl", };
  history.pushState(section, "", "");
  // history.pushState(section, "", `/dashboard/playlist/${section.playlist}`); //associate each section with paarticular api history api
  //as here we dont specify any url the state associated with the default url is this section
  loadSection(section);
  // fillContentForDashboard();
  // loadPlaylists();

  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu"); //when clicked outside of menu collapse
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });

  timeline.addEventListener(
    "click",
    (e) => {
      const timelineWidth = window.getComputedStyle(timeline).width;
      const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
      audio.currentTime = timeToSeek;
      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    },
    false
  );

  audio.addEventListener("loadedmetadata", onAudioMetadataLoaded);
  audio.addEventListener("play", () => {
    //when play is happening we wanna track progress

    const selectedTrackId = audioControl.getAttribute("data-track-id");
    const tracks = document.querySelector("#tracks");
    const playingTrack = tracks?.querySelector("section.playing");
    const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`); //which is track which is currently being played
    if (playingTrack?.id !== selectedTrack?.id) {
      playingTrack?.classList.remove("playing"); //to remove the green text of previous playing song
    }
    selectedTrack.classList.add("playing");
    progressInterval = setInterval(() => {
      //monitors every sec how much audio is being played
      if (audio.paused) {
        return;
      }
      songDurationCompleted.textContent = `${
        audio.currentTime.toFixed(0) < 10
          ? "0:0" + audio.currentTime.toFixed(0)
          : "0:" + audio.currentTime.toFixed(0)
      }`;
      //songProgress is the green bar timeline is secondary color bar green bar is getting filled as time increaes its width over timeline bar is increasing
      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    }, 100); //monitor at every interval of 100ms

    updateIconsForPlayMode(selectedTrackId);
  });

  audio.addEventListener("pause", () => {
    //is pausing just clear interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    updateIconsForPauseMode(selectedTrackId);
  });

  playButton.addEventListener("click", togglePlay); //play the new selected song and pause previous

  volume.addEventListener("change", () => {
    audio.volume = volume.value / 100;
  });

  next.addEventListener("click", playNextTrack);
  prev.addEventListener("click", playPrevTrack);

  window.addEventListener("popstate", (event) => {
    loadSection(event.state); //getting state which is being pushed in the history
    //load section of previous  state  //when back was hit in playlist playing tab state was dashboard it was loaded
  });

  //history api lets move (navigate) forward and backward
  //history api is key value pair of state and url
});
