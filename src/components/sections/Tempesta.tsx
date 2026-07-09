import { TempestaPanel } from "@/components/sections/TempestaPanel";
import { getBandcampTrackStreamUrl } from "@/lib/bandcamp-stream";
import { TEMPESTA_RELEASE } from "@/lib/releases";

export async function Tempesta() {
  const streamUrl = TEMPESTA_RELEASE.bandcampUrl
    ? await getBandcampTrackStreamUrl(TEMPESTA_RELEASE.bandcampUrl)
    : null;

  return (
    <section id="tempesta" className="relative min-h-dvh overflow-hidden">
      <TempestaPanel streamUrl={streamUrl} className="min-h-dvh" />
    </section>
  );
}
