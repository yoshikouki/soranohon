import "@testing-library/jest-dom/vitest";
import React from "react";
import { MockBroadcastChannel } from "./mocks/broadcast-channel";

globalThis.React = React;
globalThis.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
