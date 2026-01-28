import { MessageHandler } from "../shared/message-hanler";
import { StateReporterService } from "./state-reporter";
import { StreamEventHandler } from "./streamevent-handler";

const iframeElement: HTMLIFrameElement | null = document.getElementById(
  "iframe-plugin",
) as HTMLIFrameElement | null;
const messageHandler = new MessageHandler(window, iframeElement!.contentWindow);
const reporter = new StateReporterService(messageHandler);
reporter.initialize();

new StreamEventHandler(messageHandler);

// Listen for channel change messages and update the polyfill's current channel
messageHandler.subscribe("updateChannel", (data: any) => {
  console.log("hbbtv-polyfill: updating currentChannel", data);
  if (window.HBBTV_POLYFILL_NS && data.channel) {
    window.HBBTV_POLYFILL_NS.currentChannel = data.channel;
    console.log("hbbtv-polyfill: currentChannel updated to", data.channel);

    // Update all broadcast video objects
    const broadcastObjects = document.querySelectorAll(
      'object[type="video/broadcast"]',
    );
    broadcastObjects.forEach((obj: any) => {
      if (obj.currentChannel) {
        const oldChannel = obj.currentChannel;
        obj.currentChannel = data.channel;
        console.log(
          "hbbtv-polyfill: updated broadcast object currentChannel",
          data.channel,
        );

        // Trigger the onChannelChangeSucceeded callback if it exists
        if (typeof obj.onChannelChangeSucceeded === "function") {
          try {
            obj.onChannelChangeSucceeded(data.channel);
            console.log(
              "hbbtv-polyfill: triggered onChannelChangeSucceeded callback",
            );
          } catch (e) {
            console.error(
              "hbbtv-polyfill: error in onChannelChangeSucceeded",
              e,
            );
          }
        }
      }
    });
  }
});
