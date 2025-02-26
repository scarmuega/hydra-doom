// Run as a node process to run a dedicated doom server

import { readFile } from "node:fs/promises";
import { HydraMultiplayerServer } from "utils/HydraMultiplayer/server";
import { Lucid, toHex, fromHex } from "lucid-cardano";
import * as bech32 from "bech32-buffer";
import * as ed25519 from "@noble/ed25519";
import { blake2b } from "@noble/hashes/blake2b";

const HYDRA_NODE = "http://localhost:4001/";
const RECORD_STATS = true;

let done = false;
const lucid = await Lucid.new(undefined, "Preprod");
const adminKeyFile = process.env.ADMIN_KEY_FILE ?? "admin.sk";
const adminKey = JSON.parse((await readFile(adminKeyFile)).toString());
const privateKeyBytes = adminKey.cborHex.slice(4);
const sessionKeyBech32 = bech32.encode("ed25519_sk", fromHex(privateKeyBytes));

const publicKeyBytes = await ed25519.getPublicKeyAsync(privateKeyBytes);
const publicKeyHashBytes = blake2b(publicKeyBytes, { dkLen: 224 / 8 });
const publicKeyHashHex = toHex(publicKeyHashBytes);
const keys = {
  sessionKeyBech32,
  privateKeyBytes,
  privateKeyHex: toHex(privateKeyBytes),
  publicKeyBytes,
  publicKeyHex: toHex(publicKeyBytes),
  publicKeyHashBytes,
  publicKeyHashHex,
  address: lucid.utils.credentialToAddress({
    type: "Key",
    hash: publicKeyHashHex,
  }),
};
console.log("Address: ", keys.address);

const { default: createModule } = await import("../websockets-doom.js");
const module = await createModule({
  locateFile: (path, scripts) => {
    console.log(scripts + "public/" + path);
    return scripts + "public/" + path;
  },
  noInitialRun: true,
  preRun: function (mod: any) {
    const files = ["freedoom2.wad", "default.cfg", "Cardano.wad"];
    files.forEach((file) => {
      mod.FS!.createPreloadedFile("/", file, "../public/" + file, true, true);
    });
  },
  canvas: null as any,
  print: (text: string) => {
    console.log("stdout:", text);
  },
  printErr: (text: string) => {
    console.error("stderr:", text);
  },
  onExit: () => {
    console.log("Game exited");
    done = true;
  },
});
global.Module = module;
global.HydraMultiplayer = new HydraMultiplayerServer({
  key: {
    publicKey: keys.publicKeyHex,
    publicKeyHash: keys.publicKeyHashHex,
    privateKeyBytes: keys.privateKeyBytes,
  },
  address: keys.address,
  url: HYDRA_NODE,
  module,
});

let playerCount = 0;
global.gameStarted = async () => {
  console.log(`Game started with ${playerCount} players`);
  if (!RECORD_STATS) return;
  try {
    await fetch("http://localhost:8000/");
  } catch (e) {
    console.warn("Failed to record game start: ", e);
  }
};
global.playerConnected = async () => {
  playerCount++;
  console.log(`Player joined, now ${playerCount} players`);
  if (!RECORD_STATS) return;
  // NOTE: might need to ignore ourselves joining, so we don't inflate the player metrics
  try {
    await fetch("http://localhost:8000/player_joined");
  } catch (e) {
    console.warn("Failed to record player joined: ", e);
  }
};
global.playerDisconnected = async () => {
  playerCount--;
  console.log(`Player left, now ${playerCount} players`);
  if (!RECORD_STATS) return;
  try {
    await fetch("http://localhost:8000/player_left");
  } catch (e) {
    console.warn("Failed to record player left: ", e);
  }
  // TODO: Hit localhost to record a player disconnected
};
global.kill = async (killer, victim) => {
  console.log(`Player ${killer} killed ${victim}`);
  if (!RECORD_STATS) return;
  // TODO: map from player idx to ephemeral key
  // TODO: ddz leaderboards
  try {
    await fetch("http://localhost:8000/player_killed");
  } catch (e) {
    console.warn("Failed to record a kill: ", e);
  }
};
global.suicide = async (player) => {
  console.log(`Player ${player} suicided`);
  if (!RECORD_STATS) return;
  try {
    await fetch("http://localhost:8000/player_suicided");
  } catch (e) {
    console.warn("Failed to record a suicide: ", e);
  }
};

// TODO: check for a pending game and run cleanup

const args = [
  "-server",
  "-deathmatch",
  "-iwad",
  "freedoom2.wad",
  "-file",
  "Cardano.wad",
  "-drone",
  "-nodraw",
  "-nomouse",
  "-nograbmouse",
  "-nogui",
  "-nomusic",
  "-nosound",
  "-config",
  "default.cfg",
];
try {
  module.callMain(args);
} catch (e) {
  console.error(e);
}

try {
  console.log("Server started.");
  await fetch("http://localhost:8000/start_server");
} catch (e) {
  console.warn("Failed to record server start: ", e);
}

while (!done) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

try {
  console.log("Game finished.");
  await fetch(`localhost:8000/end_game`);
} catch (e) {
  console.warn("Failed to record game finished: ", e);
}

process.exit(0);
