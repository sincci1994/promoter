"use client";
import { ph, type Clip } from "@/lib/landing-content";
import { useInViewVideo } from "./use-in-view-video";

type Props = {
  clip: Clip;
  className?: string;
  video?: boolean;
  preload?: "none" | "auto";
};

export function ClipMedia({
  clip,
  className = "",
  video = true,
  preload = "none",
}: Props) {
  const ref = useInViewVideo<HTMLVideoElement>();

  if (!clip.src || !video) {
    return (
      <div
        aria-hidden
        role="img"
        aria-label={clip.alt}
        className={`absolute inset-0 bg-cover bg-center ${className}`}
        style={
          clip.poster
            ? { backgroundImage: `url(${clip.poster})` }
            : ph(clip.hue)
        }
      />
    );
  }

  return (
    <video
      ref={ref}
      aria-label={clip.alt}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      src={clip.src}
      poster={clip.poster}
      muted
      loop
      playsInline
      preload={preload}
    />
  );
}
