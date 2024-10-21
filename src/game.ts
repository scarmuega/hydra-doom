import {
  C,
  Constr,
  Data,
  Lucid,
  ScriptHash,
  TxSigned,
  UTxO,
  toHex,
  valueToAssets,
} from "lucid-cardano";

import { CBOR } from "./contract/cbor";
import {
  GameData,
  LevelId,
  Player,
  PlayerStats,
  buildDatum,
  decodeDatum,
  hydraDatumToPlutus,
  initialGameData,
} from "./contract/datum";
import { Hydra } from "./hydra";
import { keys } from "./keys";
import { setLocalSpeedometerValue } from "./speedometer";
import { appendTx, session, updateUI } from "./stats";

import * as ed25519 from "@noble/ed25519";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { blake2b } from "@noble/hashes/blake2b";
import { sha512 } from "@noble/hashes/sha512";

ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

let Module = (window as any).Module;

let gameServerUrl = process.env.SERVER_URL;
if (!gameServerUrl) {
  gameServerUrl = "http://localhost:8000";
  console.warn(
    `Defaulting SERVER_URL to ${gameServerUrl}, use .env to configure`,
  );
}
let lucid = await Lucid.new(undefined, "Preprod");
let { sessionKey, privateKey, sessionPk } = keys;
const address = await lucid
  .selectWalletFromPrivateKey(sessionKey)
  .wallet.address();
const pkh = lucid.utils.getAddressDetails(address).paymentCredential?.hash!;
console.log(`Using session key with address: ${address}`);

// Continue or fetch a game session
let hydra: Hydra | undefined = undefined;
let player_pkh: string;
let node = window.localStorage.getItem("hydra-doom-session-node");

export async function requestNewGame(region: string) {
  if (!gameServerUrl) {
    throw new Error("No game server URL configured");
  }
  try {
    console.log(`Starting new game for ${address}`);
    // const response = await fetch(
    //   `${gameServerUrl}/new_game?address=${address}&region=${process.env.REGION ?? region}&reserved=${!!process.env.CABINET_KEY}`,
    // );
    // const newGameResponse = await response.json();
    const newGameResponse = {
      player_utxo: "1541287c2598ffc682742c961a96343ac64e9b9030e6b03a476bb18c8c50134d#0",
      ip: "127.0.0.1:4001",
      admin_pkh: "4bb3808dab90787cc656f78d5ccd50a37366c7aedf8352d516a6befa",
    }
    console.log(`New game successful with UTxO ${newGameResponse.player_utxo}`);
    node = newGameResponse.ip as string;
    player_pkh = newGameResponse.admin_pkh as string;
    // TODO: protocol from host
    const protocol = "http";

    hydra = new Hydra(`${protocol}://${node}`, 100);
    await hydra.populateUTxO();
    hydra.onTxSeen = (_txId, tx) => {
      // Decode packets and inject into packet queue
      const output = tx.txComplete.body().outputs().get(0);
      const packetsRaw = output?.datum()?.as_data()?.get().to_bytes();
      const packets = decodePackets(toHex(packetsRaw!));
      for (const packet of packets) {
        if (packet.to === ourIP) {
          let buf = Module._malloc(packet.data.length);
          Module.HEAPU8.set(packet.data, buf);
          Module._InboundPacket(packet.from, buf, packet.data.length);
          Module._free(buf);
        }
      }
    };
    hydra.onTxConfirmed = (txId) => {
      // XXX: TPS only computed when tx confirmed -> does not go to 0 after some time
      const now = performance.now();
      let tps = 0;
      for (const txid in hydra!.tx_timings) {
        const timing = hydra!.tx_timings[txid]!;
        if (timing.confirmed && timing.sent + timing.confirmed > now - 1000) {
          tps++;
        }
      }
      setLocalSpeedometerValue(tps);
    };
    hydra.onTxInvalid = (txId) => {
      console.error("invalid", txId);
      setLocalSpeedometerValue(0);
    };
    latestUTxO = await hydra.awaitUtxo(newGameResponse.player_utxo, 5000);
  } catch (e) {
    console.error("Error: ", e);
    throw e;
  }
}

export async function requestJoinGame(gameId: string) {
  if (!gameServerUrl) {
    throw new Error("No game server URL configured");
  }
  try {
    console.log(`Joining game for ${address}`);
    // const response = await fetch(
    //   `${gameServerUrl}/new_game?address=${address}&region=${process.env.REGION ?? region}&reserved=${!!process.env.CABINET_KEY}`,
    // );
    // const newGameResponse = await response.json();
    const joinGameResponse = {
      player_utxo: "1541287c2598ffc682742c961a96343ac64e9b9030e6b03a476bb18c8c50134d#1",
      ip: "127.0.0.1:4001",
      admin_pkh: "4bb3808dab90787cc656f78d5ccd50a37366c7aedf8352d516a6befa",
    }
    console.log(`Join game successful with UTxO ${joinGameResponse.player_utxo}`);
    node = joinGameResponse.ip as string;
    player_pkh = joinGameResponse.admin_pkh as string;
    // TODO: protocol from host
    const protocol = "http";

    hydra = new Hydra(`${protocol}://${node}`, 100);
    await hydra.populateUTxO();
    hydra.onTxSeen = (_txId, tx) => {
      // Decode packets and inject into packet queue
      const output = tx.txComplete.body().outputs().get(0);
      const packetsRaw = output?.datum()?.as_data()?.get().to_bytes();
      const packets = decodePackets(toHex(packetsRaw!));
      for (const packet of packets) {
        if (packet.to === ourIP) {
          let buf = Module._malloc(packet.data.length);
          Module.HEAPU8.set(packet.data, buf);
          Module._InboundPacket(packet.from, buf, packet.data.length);
          Module._free(buf);
        }
      }
    };
    hydra.onTxConfirmed = (txId) => {
      // XXX: TPS only computed when tx confirmed -> does not go to 0 after some time
      const now = performance.now();
      let tps = 0;
      for (const txid in hydra!.tx_timings) {
        const timing = hydra!.tx_timings[txid]!;
        if (timing.confirmed && timing.sent + timing.confirmed > now - 1000) {
          tps++;
        }
      }
      setLocalSpeedometerValue(tps);
    };
    hydra.onTxInvalid = (txId) => {
      console.error("invalid", txId);
      setLocalSpeedometerValue(0);
    };
    latestUTxO = await hydra.awaitUtxo(joinGameResponse.player_utxo, 5000);
  } catch (e) {
    console.error("Error: ", e);
    throw e;
  }
}

// Callbacks from forked doom-wasm

let latestUTxO: UTxO | null = null;
let outboundPacketQueue: Data[] = [];

let ourIP = 0;

export function hydraSetIP(ip: number) {
  ourIP = ip;
}

export async function hydraSendPacket(to: number, from: number, data: Uint8Array) {
  outboundPacketQueue.push(encodePacket(to, from, data));
  sendPacketQueue();
}

export async function sendPacketQueue() {
  let datum = encodePackets(outboundPacketQueue);
  console.log(datum);
  let [newUTxO, tx] = buildTx(latestUTxO!, datum);
  await hydra?.submitTx(tx);
  latestUTxO = newUTxO;
  outboundPacketQueue = [];
}

function encodePacket(to: number, from: number, data: Uint8Array) {
  return new Constr(0, [BigInt(to), BigInt(from), toHex(data)]);
}

function encodePackets(packets: Data[]): string {
  return Data.to(packets);
}

function decodePackets(raw: string): { to: number; from: number; data: Uint8Array }[] {
  const packets = Data.from(raw) as Constr<Data>[];
  return packets.map((packet) => {
    let [to, from, data] = packet.fields;
    return {
      to: Number(to),
      from: Number(from),
      data: hexToBytes(data as string),
    }
  });
}

const buildTx = (
  inputUtxo: UTxO,
  datum: string,
): [UTxO, string] => {
  // Hand-roll transaction creation for more performance
  const datumLength = datum.length / 2;
  let datumLengthHex = datumLength.toString(16);
  if (datumLengthHex.length % 2 !== 0) {
    datumLengthHex = "0" + datumLengthHex;
  }
  const lengthLengthTag = 57 + datumLengthHex.length / 2;
  console.log(datumLengthHex);
  const txBodyByHand =
    `a3` + // Prefix
    `0081825820${inputUtxo.txHash}0${inputUtxo.outputIndex}` + // One input
    `0181a300581d60${player_pkh}018200a0028201d818${lengthLengthTag}${datumLengthHex}${datum}` + // Output to users PKH
    `0200`; // No fee

  const txId = bytesToHex(
    blake2b(hexToBytes(txBodyByHand), { dkLen: 256 / 8 }),
  );
  const signature = bytesToHex(ed25519.sign(txId, privateKey));

  const witnessSetByHand = `a10081825820${sessionPk}5840${signature}`; // just signed by the user
  const txByHand = `84${txBodyByHand}${witnessSetByHand}f5f6`;

  const newUtxo: UTxO = {
    txHash: txId,
    outputIndex: 0,
    address: address,
    assets: { lovelace: 0n },
    datumHash: null,
    datum: datum,
    scriptRef: null,
  };

  return [newUtxo, txByHand];
};