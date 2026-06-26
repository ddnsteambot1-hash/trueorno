"use client";

import { useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function VkBridgeInit() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      for (let attempt = 0; attempt < 8 && !cancelled; attempt += 1) {
        try {
          await bridge.send("VKWebAppInit");
          window.__vkBridgeInitialized = true;
          window.dispatchEvent(new Event("vk-bridge-ready"));
          return;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
