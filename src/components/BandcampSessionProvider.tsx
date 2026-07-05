"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PersistentBandcampEmbed } from "@/components/sections/PersistentBandcampEmbed";
import { useAudio } from "@/components/AudioProvider";
import { useView } from "@/components/ViewProvider";
import { getBandcampAlbumId, type BandcampTrack } from "@/lib/bandcamp-album";
import { loadReleaseContent } from "@/lib/load-release-content";
import {
  installBandcampPlaybackSync,
  loadBandcampTrack,
  pauseBandcampPlayerByReleaseId,
  playBandcampTrack,
} from "@/lib/bandcamp-player-control";
import { isReleasePlayable, RELEASES, staticTracksForRelease, type Release } from "@/lib/releases";
import { pathFromMusic, releaseIdFromPath } from "@/lib/view-routes";
import { usePathname, useRouter } from "next/navigation";

export type NowPlaying = {
  releaseId: string;
  releaseTitle: string;
  trackId: number;
  trackTitle: string;
  duration: number;
  cover: string;
};

type BandcampSessionContextValue = {
  viewReleaseId: string | null;
  lastViewReleaseId: string | null;
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  playbackEngaged: boolean;
  isEmbedReady: (id: string) => boolean;
  getReleaseTracks: (id: string) => BandcampTrack[];
  pendingReleaseId: string | null;
  openRelease: (id: string) => void;
  closeReleaseView: () => void;
  playTrack: (
    release: Release,
    track: BandcampTrack,
    albumTracks?: BandcampTrack[],
  ) => void;
  playNext: () => void;
  playPrevious: () => void;
  canPlayNext: boolean;
  canPlayPrevious: boolean;
  trackPosition: { index: number; total: number } | null;
  togglePlayback: () => void;
  stopPlayback: () => void;
};

const BandcampSessionContext =
  createContext<BandcampSessionContextValue | null>(null);

export function useBandcampSession() {
  const ctx = useContext(BandcampSessionContext);
  if (!ctx) {
    throw new Error("useBandcampSession must be used within BandcampSessionProvider");
  }
  return ctx;
}

type BandcampSessionProviderProps = {
  children: ReactNode;
  releases?: Release[];
};

export function BandcampSessionProvider({
  children,
  releases = RELEASES,
}: BandcampSessionProviderProps) {
  const { playing, current, playStream, loadStream, clearPlayback, togglePlay, registerEndedHandler, seek } =
    useAudio();
  const { view, runTransition, commitView } = useView();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const viewReleaseIdRef = useRef<string | null>(null);
  const musicPathSyncedRef = useRef(false);
  const openGenerationRef = useRef(0);
  const userOpeningRef = useRef<string | null>(null);
  const [viewReleaseId, setViewReleaseId] = useState<string | null>(null);
  const [lastViewReleaseId, setLastViewReleaseId] = useState<string | null>(null);
  const [sessionReleaseId, setSessionReleaseId] = useState<string | null>(null);
  const [readyEmbedIds, setReadyEmbedIds] = useState<Set<string>>(() => new Set());
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [playbackEngaged, setPlaybackEngaged] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<BandcampTrack[]>([]);
  const [releaseTracksById, setReleaseTracksById] = useState<
    Record<string, BandcampTrack[]>
  >({});
  const [pendingReleaseId, setPendingReleaseId] = useState<string | null>(null);
  const lastPlayedKeyRef = useRef<string | null>(null);
  const shouldAutoPlayRef = useRef(true);
  const autoSelectedForReleaseRef = useRef<string | null>(null);
  const albumTracksRef = useRef<BandcampTrack[]>([]);
  const nowPlayingRef = useRef<NowPlaying | null>(null);
  const playbackEngagedRef = useRef(false);
  const releaseTracksByIdRef = useRef(releaseTracksById);

  useEffect(() => {
    releaseTracksByIdRef.current = releaseTracksById;
  }, [releaseTracksById]);

  useEffect(() => {
    albumTracksRef.current = albumTracks;
  }, [albumTracks]);

  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  useEffect(() => {
    playbackEngagedRef.current = playbackEngaged;
  }, [playbackEngaged]);

  useEffect(() => {
    viewReleaseIdRef.current = viewReleaseId;
  }, [viewReleaseId]);

  useEffect(() => installBandcampPlaybackSync(), []);

  useEffect(() => {
    if (!nowPlaying) {
      lastPlayedKeyRef.current = null;
      return;
    }

    if (!shouldAutoPlayRef.current) return;

    if (!readyEmbedIds.has(nowPlaying.releaseId)) return;

    const playKey = `${nowPlaying.releaseId}:${nowPlaying.trackId}`;
    if (lastPlayedKeyRef.current === playKey) return;

    const release = releases.find((item) => item.id === nowPlaying.releaseId);
    if (!release) return;

    const albumId = getBandcampAlbumId(release.bandcampEmbedUrl);
    if (!albumId) return;

    if (playBandcampTrack(nowPlaying.releaseId, albumId, nowPlaying.trackId)) {
      lastPlayedKeyRef.current = playKey;
    }
  }, [nowPlaying, readyEmbedIds, releases]);

  const isPlaying = !!nowPlaying && playing;

  const currentTrackIndex = useMemo(() => {
    if (!nowPlaying || !albumTracks.length) return -1;
    return albumTracks.findIndex((track) => track.id === nowPlaying.trackId);
  }, [albumTracks, nowPlaying]);

  const trackPosition = useMemo(() => {
    if (currentTrackIndex < 0 || !albumTracks.length) return null;
    return { index: currentTrackIndex + 1, total: albumTracks.length };
  }, [albumTracks.length, currentTrackIndex]);

  const canPlayNext =
    currentTrackIndex >= 0 && currentTrackIndex < albumTracks.length - 1;

  const canPlayPrevious =
    currentTrackIndex > 0 || (currentTrackIndex === 0 && current > 3);

  const runReleaseTransition = useCallback(
    (onMidpoint: () => void) => {
      if (!runTransition(onMidpoint)) {
        onMidpoint();
      }
    },
    [runTransition],
  );

  const loadAlbumTracks = useCallback(async (release: Release) => {
    const staticTracks = staticTracksForRelease(release);
    if (staticTracks) return staticTracks;

    if (!release.bandcampUrl) return [];

    try {
      const response = await fetch(
        `/api/bandcamp-tracks?url=${encodeURIComponent(release.bandcampUrl)}`,
      );
      const data = (await response.json()) as { tracks?: BandcampTrack[] };
      return data.tracks ?? [];
    } catch {
      return [];
    }
  }, []);

  const getReleaseTracks = useCallback(
    (id: string) => releaseTracksById[id] ?? [],
    [releaseTracksById],
  );

  const openReleaseById = useCallback(
    async (
      id: string,
      options: { pushUrl?: boolean; useTransition?: boolean } = {},
    ) => {
      const release = releases.find((item) => item.id === id);
      if (!release) return;

      const { pushUrl = true, useTransition = true } = options;
      const generation = ++openGenerationRef.current;
      if (pushUrl) {
        userOpeningRef.current = id;
      }

      setPendingReleaseId(id);

      try {
        const tracks = await loadReleaseContent(release, loadAlbumTracks);

        if (openGenerationRef.current !== generation) return;
        if (viewReleaseIdRef.current === id) return;

        releaseTracksByIdRef.current = {
          ...releaseTracksByIdRef.current,
          [id]: tracks,
        };
        setReleaseTracksById((current) => ({
          ...current,
          [id]: tracks,
        }));

        setPendingReleaseId(null);

        const applyOpen = () => {
          if (userOpeningRef.current === id) {
            userOpeningRef.current = null;
          }
          viewReleaseIdRef.current = id;
          setLastViewReleaseId(id);
          setViewReleaseId(id);
          setSessionReleaseId(id);
          commitView("music");

          if (pushUrl) {
            const targetPath = pathFromMusic(id);
            if (pathnameRef.current !== targetPath) {
              router.push(targetPath);
            }
          }
        };

        if (useTransition) {
          runReleaseTransition(applyOpen);
        } else {
          applyOpen();
        }
      } catch {
        if (openGenerationRef.current === generation) {
          setPendingReleaseId(null);
          if (userOpeningRef.current === id) {
            userOpeningRef.current = null;
          }
        }
      }
    },
    [commitView, loadAlbumTracks, releases, router, runReleaseTransition],
  );

  const openRelease = useCallback(
    (id: string) => {
      if (viewReleaseIdRef.current === id) return;
      void openReleaseById(id);
    },
    [openReleaseById],
  );

  const closeReleaseView = useCallback(() => {
    if (!viewReleaseIdRef.current) return;

    const close = () => {
      viewReleaseIdRef.current = null;
      setViewReleaseId(null);
      autoSelectedForReleaseRef.current = null;

      if (!playbackEngagedRef.current) {
        clearPlayback();
        setNowPlaying(null);
        setAlbumTracks([]);
        setSessionReleaseId(null);
        lastPlayedKeyRef.current = null;
      }

      if (pathnameRef.current.startsWith("/music/")) {
        router.push("/music");
      }
    };

    runReleaseTransition(close);
  }, [clearPlayback, router, runReleaseTransition]);

  useEffect(() => {
    if (view === "music") return;

    if (viewReleaseIdRef.current !== null) {
      viewReleaseIdRef.current = null;
      setViewReleaseId(null);
      autoSelectedForReleaseRef.current = null;
    }

    if (!playbackEngagedRef.current) {
      clearPlayback();
      setNowPlaying(null);
      setAlbumTracks([]);
      setSessionReleaseId(null);
      lastPlayedKeyRef.current = null;
    }
  }, [view, clearPlayback]);

  useEffect(() => {
    if (pathname === "/music" && !releaseIdFromPath(pathname)) {
      musicPathSyncedRef.current = true;
    }
  }, [pathname]);

  useEffect(() => {
    const releaseId = releaseIdFromPath(pathname);

    if (!releaseId) {
      if (pathname !== "/music" || viewReleaseIdRef.current === null) return;

      const closeFromPath = () => {
        viewReleaseIdRef.current = null;
        setViewReleaseId(null);
      };

      if (!musicPathSyncedRef.current) {
        musicPathSyncedRef.current = true;
        closeFromPath();
        return;
      }

      runReleaseTransition(closeFromPath);
      return;
    }

    if (viewReleaseIdRef.current === releaseId) return;
    if (userOpeningRef.current === releaseId) return;

    void openReleaseById(releaseId, {
      pushUrl: false,
      useTransition: musicPathSyncedRef.current,
    });
  }, [openReleaseById, pathname, runReleaseTransition]);

  const markEmbedReady = useCallback((id: string) => {
    setReadyEmbedIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const isEmbedReady = useCallback(
    (id: string) => readyEmbedIds.has(id),
    [readyEmbedIds],
  );

  const applyTrackSelection = useCallback(
    (
      release: Release,
      track: BandcampTrack,
      tracks: BandcampTrack[] | undefined,
      autoPlay: boolean,
    ) => {
      if (!isReleasePlayable(release)) return;

      const playKey = `${release.id}:${track.id}`;

      if (tracks?.length) {
        setAlbumTracks(tracks);
      } else {
        const loaded = releaseTracksByIdRef.current[release.id];
        if (loaded?.length) {
          setAlbumTracks(loaded);
        } else {
          void loadReleaseContent(release, loadAlbumTracks).then((fetched) => {
            if (!fetched.length) return;
            releaseTracksByIdRef.current = {
              ...releaseTracksByIdRef.current,
              [release.id]: fetched,
            };
            setReleaseTracksById((current) => ({
              ...current,
              [release.id]: fetched,
            }));
            setAlbumTracks(fetched);
          });
        }
      }

      shouldAutoPlayRef.current = autoPlay;
      if (autoPlay) {
        setPlaybackEngaged(true);
      }

      setNowPlaying({
        releaseId: release.id,
        releaseTitle: release.title,
        trackId: track.id,
        trackTitle: track.title,
        duration: track.duration,
        cover: release.bandcampArtUrl ?? release.cover,
      });
      setSessionReleaseId(release.id);

      if (track.streamUrl) {
        lastPlayedKeyRef.current = playKey;
        if (autoPlay) {
          playStream(track.streamUrl);
        } else {
          loadStream(track.streamUrl);
        }
        return;
      }

      const albumId = getBandcampAlbumId(release.bandcampEmbedUrl);
      if (!albumId) return;

      lastPlayedKeyRef.current = playKey;
      if (autoPlay) {
        playBandcampTrack(release.id, albumId, track.id);
      } else {
        loadBandcampTrack(release.id, albumId, track.id);
      }
    },
    [loadAlbumTracks, loadStream, playStream],
  );

  const selectTrack = useCallback(
    (
      release: Release,
      track: BandcampTrack,
      tracks?: BandcampTrack[],
    ) => {
      applyTrackSelection(release, track, tracks, false);
    },
    [applyTrackSelection],
  );

  const playTrack = useCallback(
    (
      release: Release,
      track: BandcampTrack,
      tracks?: BandcampTrack[],
    ) => {
      applyTrackSelection(release, track, tracks, true);
    },
    [applyTrackSelection],
  );

  useEffect(() => {
    if (!viewReleaseId) {
      autoSelectedForReleaseRef.current = null;
      return;
    }

    const release = releases.find((item) => item.id === viewReleaseId);
    const tracks = releaseTracksById[viewReleaseId];
    if (!release || !tracks.length || !isReleasePlayable(release)) return;

    const active = nowPlayingRef.current;
    const engaged = playbackEngagedRef.current;

    if (engaged && active) {
      if (active.releaseId === viewReleaseId) {
        autoSelectedForReleaseRef.current = viewReleaseId;
      }
      return;
    }

    if (autoSelectedForReleaseRef.current === viewReleaseId) return;

    const firstTrack = tracks[0];

    if (
      active?.releaseId === viewReleaseId &&
      active.trackId === firstTrack.id
    ) {
      autoSelectedForReleaseRef.current = viewReleaseId;
      return;
    }

    selectTrack(release, firstTrack, tracks);
    autoSelectedForReleaseRef.current = viewReleaseId;
  }, [viewReleaseId, releaseTracksById, releases, selectTrack]);

  const playTrackAtIndex = useCallback(
    (index: number) => {
      const tracks = albumTracksRef.current;
      const active = nowPlayingRef.current;
      if (!tracks.length || !active) return;

      const track = tracks[index];
      if (!track) return;

      const release = releases.find((item) => item.id === active.releaseId);
      if (!release) return;

      playTrack(release, track, tracks);
    },
    [playTrack, releases],
  );

  const playNext = useCallback(() => {
    const tracks = albumTracksRef.current;
    const active = nowPlayingRef.current;
    if (!tracks.length || !active) return;

    const index = tracks.findIndex((track) => track.id === active.trackId);
    if (index >= 0 && index < tracks.length - 1) {
      playTrackAtIndex(index + 1);
    }
  }, [playTrackAtIndex]);

  const playPrevious = useCallback(() => {
    const tracks = albumTracksRef.current;
    const active = nowPlayingRef.current;
    if (!tracks.length || !active) return;

    const index = tracks.findIndex((track) => track.id === active.trackId);
    if (index < 0) return;

    if (current > 3) {
      seek(0);
      return;
    }

    if (index > 0) {
      playTrackAtIndex(index - 1);
    }
  }, [current, playTrackAtIndex, seek]);

  useEffect(() => {
    return registerEndedHandler(() => {
      const tracks = albumTracksRef.current;
      const active = nowPlayingRef.current;
      if (!tracks.length || !active) return;

      const index = tracks.findIndex((track) => track.id === active.trackId);
      if (index < 0 || index >= tracks.length - 1) return;

      const release = releases.find((item) => item.id === active.releaseId);
      if (!release) return;

      playTrack(release, tracks[index + 1], tracks);
    });
  }, [playTrack, registerEndedHandler, releases]);

  const togglePlayback = useCallback(() => {
    const active = nowPlayingRef.current;
    if (!active) return;

    if (playing) {
      togglePlay();
      pauseBandcampPlayerByReleaseId(active.releaseId);
      return;
    }

    setPlaybackEngaged(true);

    const release = releases.find((item) => item.id === active.releaseId);
    const tracks = albumTracksRef.current;
    const track = tracks.find((item) => item.id === active.trackId);

    if (track?.streamUrl) {
      playStream(track.streamUrl);
      return;
    }

    const albumId = release ? getBandcampAlbumId(release.bandcampEmbedUrl) : null;
    if (albumId) {
      shouldAutoPlayRef.current = true;
      playBandcampTrack(active.releaseId, albumId, active.trackId);
    }
  }, [playStream, playing, releases, togglePlay]);

  const stopPlayback = useCallback(() => {
    clearPlayback();
    setNowPlaying(null);
    setPlaybackEngaged(false);
    setAlbumTracks([]);
    setSessionReleaseId(null);
    lastPlayedKeyRef.current = null;
    autoSelectedForReleaseRef.current = null;
  }, [clearPlayback]);

  const mountedEmbedIds = useMemo(() => {
    const ids = new Set<string>();
    if (sessionReleaseId) ids.add(sessionReleaseId);
    if (viewReleaseId) ids.add(viewReleaseId);
    if (pendingReleaseId) ids.add(pendingReleaseId);
    return Array.from(ids);
  }, [pendingReleaseId, sessionReleaseId, viewReleaseId]);

  const value = useMemo(
    () => ({
      viewReleaseId,
      lastViewReleaseId,
      nowPlaying,
      isPlaying,
      playbackEngaged,
      isEmbedReady,
      getReleaseTracks,
      pendingReleaseId,
      openRelease,
      closeReleaseView,
      playTrack,
      playNext,
      playPrevious,
      canPlayNext,
      canPlayPrevious,
      trackPosition,
      togglePlayback,
      stopPlayback,
    }),
    [
      viewReleaseId,
      lastViewReleaseId,
      nowPlaying,
      isPlaying,
      playbackEngaged,
      isEmbedReady,
      getReleaseTracks,
      pendingReleaseId,
      openRelease,
      closeReleaseView,
      playTrack,
      playNext,
      playPrevious,
      canPlayNext,
      canPlayPrevious,
      trackPosition,
      togglePlayback,
      stopPlayback,
    ],
  );

  return (
    <BandcampSessionContext.Provider value={value}>
      {children}

      {mountedEmbedIds.map((id) => {
        const release = releases.find((item) => item.id === id);
        if (!release) return null;

        return (
          <PersistentBandcampEmbed
            key={id}
            release={release}
            onReady={() => markEmbedReady(id)}
          />
        );
      })}
    </BandcampSessionContext.Provider>
  );
}
