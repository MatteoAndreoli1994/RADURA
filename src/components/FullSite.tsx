import { FullSiteClient } from "@/components/FullSiteClient";
import { getBandcampTrackStreamUrl } from "@/lib/bandcamp-stream";
import { getLiveDates } from "@/lib/live-dates.server";
import { TEMPESTA_RELEASE } from "@/lib/releases";

export async function FullSite() {
  const tempestaStreamUrl = TEMPESTA_RELEASE.bandcampUrl
    ? await getBandcampTrackStreamUrl(TEMPESTA_RELEASE.bandcampUrl)
    : null;
  const liveDates = await getLiveDates();

  return (
    <FullSiteClient
      tempestaStreamUrl={tempestaStreamUrl}
      liveDates={liveDates}
    />
  );
}
