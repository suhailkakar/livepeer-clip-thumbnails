import { Player } from "@livepeer/react";
import { useState } from "react";
import axios from "axios";

type Source = {
  hrn: string;
  url: string;
  type: string;
};

export default function Home() {
  // You can replace this with your own stream Playback ID
  const MAIN_STREAM_PLAYBACK_ID = "3446ee18gwcjwnlu";

  const [clipPlaybackId, setClipPlaybackId] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");

  const createClip = async () => {
    try {
      const response = await axios.post(
        "https://livepeer.studio/api/clip",
        {
          playbackId: MAIN_STREAM_PLAYBACK_ID,
          name: "Your clip name", // Replace with a dynamic name if necessary
          startTime: 0, // Define the start time for the clip
          endTime: 1000, // Define the end time for the clip
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_API_KEY}`,
          },
        }
      );

      /**
       * In the response, you get the asset and task IDs. You can use the task ID to check the status of the clip creation.
       */
      setClipPlaybackId(response.data.asset.playbackId);
    } catch (error) {
      console.error("Error creating clip:", error);
    }
  };

  /**
   * Thumbnails are present in playbackInfo object (sources array): https://docs.livepeer.org/api-reference/playback/get
   */
  const getThumbnail = async () => {
    try {
      const response = await axios.get(
        `https://livepeer.studio/api/playback/${MAIN_STREAM_PLAYBACK_ID}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_API_KEY}`,
          },
        }
      );

      const thumbnail = response.data.meta.source.find(
        (source: Source) => source.hrn === "Thumbnail"
      );

      if (thumbnail) {
        setThumbnail(thumbnail.url);
      }
    } catch (error: any) {
      const { data } = error.response;
      /**
       * Usually, Clips takes a few seconds to be ready for playback. You can use the task Id to check the status of the clip creation and thumbnail will also be available once the clip is ready for playback.
       */
      if (
        data.errors.some(
          (error: any) => error === "asset is not ready for playback"
        )
      ) {
        alert("Asset is not ready for playback yet, please wait");
      }
    }
  };

  return (
    <div className="items-center flex justify-center h-screen flex-col">
      {clipPlaybackId ? (
        <div className="w-1/3">
          <div className="flex flex-row justify-between">
            <h1 className="mb-2">Playing the clip: {clipPlaybackId} </h1>{" "}
            <button
              onClick={getThumbnail}
              className="bg-gray-200 hover:bg-gray-300 text-black/80  py-2 px-4 rounded-md mb-2"
            >
              Get thumbnail
            </button>
          </div>
          <Player autoPlay muted playbackId={clipPlaybackId} />

          {thumbnail && (
            <div className=" mt-6">
              <h1 className="mb-2">
                Thumbnail for livestream: {MAIN_STREAM_PLAYBACK_ID}{" "}
              </h1>{" "}
              <img
                src={thumbnail}
                alt="Thumbnail"
                className="rounded-md w-full"
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="w-1/3">
            <button
              onClick={createClip}
              className="bg-gray-200 hover:bg-gray-300 text-black/80  py-2 px-4 rounded-md mb-2"
            >
              Clip stream
            </button>
            {/* <Player autoPlay muted playbackId={MAIN_STREAM_PLAYBACK_ID} /> */}
          </div>
        </>
      )}
    </div>
  );
}
