"use client";
import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import AppWalletProvider from "./components/AppWalletProvider";
import "./solagio.css";
import Spinner from "./Spinner";
import {
  Connection,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";

interface Signer {
  publicKey: string;
  secretKey: Uint8Array;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // State für die Session und die Namensliste
  const [sessionActive, setSessionActive] = useState(false);
  const [name, setName] = useState("");
  const [nameList, setNameList] = useState<string[]>([]);
  const [userNameEntered, setUserNameEntered] = useState(false);
  const [einsatz, setEinsatz] = useState<number>(0);

  // Methode zum Hinzufügen eines Namens zur Liste und Starten der Session
  const handleNameSubmit = () => {
    if (name.trim() !== "") {
      setNameList([...nameList, name]);
      setUserNameEntered(true);
      setSessionActive(true);
      addName();
    }
  };

  // Methode zum Hinzufügen eines Benutzernamens zur CSV-Datei
  const addName = async () => {
    if (name.trim() !== "") {
      try {
        await fetch("http://localhost:3001/add-participant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
        setName("");
        setSessionActive(true);
      } catch (error) {
        console.error("Error adding name:", error);
      }
    }
  };

  // Methode zum Abrufen der Teilnehmerliste
  const fetchParticipants = async () => {
    try {
      const response = await fetch("http://localhost:3001/participants");
      const data = await response.text();
      const names = data
        .split("\n")
        .filter((line) => line.trim() !== "Name" && line.trim() !== "");
      setNameList(names);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  // Teilnehmerliste alle 10 Sekunden aktualisieren
  useEffect(() => {
    if (sessionActive) {
      fetchParticipants();
      const intervalId = setInterval(fetchParticipants, 10000);
      return () => clearInterval(intervalId);
    }
  }, [sessionActive]);

  const handleEinsatzChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setEinsatz(value);
    }
  };
  const handleEinsatzZuCsv = async (value: string) => {
    try {
      await fetch("http://localhost:3001/add-einsatz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ einsatz: parseFloat(value) }),
      });
    } catch (error) {
      console.error("Error adding einsatz:", error);
    }
  };

  const handleEinsatzHinzufügen = () => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);
    const transaction = new Transaction();
    const signers: import("@solana/web3.js").Signer[] = [
      {
        publicKey: new PublicKey(PublicKey.default),
        secretKey: new Uint8Array(),
      },
    ];
    sendAndConfirmTransaction(connection, transaction, signers);
  };

  return (
    <html lang="en">
      <body>
        {!userNameEntered ? (
          <div className="name-entry">
            <h4>Please enter your name</h4>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name eingeben"
            />
            <button onClick={handleNameSubmit}>Confirm Name</button>
          </div>
        ) : (
          <>
            <nav>
              <a href="/">Home</a>
              <a href="/transfer">About</a>
              <a href="/address">Contact</a>
            </nav>
            <div className="container">
              <div className="right">
                <h4>Playerlist</h4>
                <ul className="player-list">
                  {nameList.map((playerName, index) => (
                    <li key={index}>
                      {index + 1}. {playerName}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="center">
                <Spinner teilnehmer={nameList} />
              </div>

              <div className="left">
                <h4>Information</h4>
                <div id="deinEinsatz" className="einsatzwert">
                  Your commitment: {einsatz.toFixed(2)}
                </div>
                <input
                  type="number"
                  value={einsatz}
                  onChange={handleEinsatzChange}
                  placeholder="Einsatz eingeben"
                  min="0"
                  step="0.01"
                />
                <button onClick={() => handleEinsatzZuCsv(einsatz.toFixed(2))}>
                  Add Bet
                </button>
                <AppWalletProvider>{children}</AppWalletProvider>
              </div>
            </div>
            <footer>
              <p color="white">
                &copy; {new Date().getFullYear()} Solagio. All rights reserved.
              </p>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
