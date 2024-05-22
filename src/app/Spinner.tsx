import React, { useState, useEffect } from "react";
import "./SpinningWheel.css";

interface SpinningWheelProps {
  teilnehmer: string[];
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ teilnehmer }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [winner, setWinner] = useState<string | null>(null);
  const [jackpot, setJackpot] = useState<number>(0);

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      const randomWinner =
        teilnehmer[Math.floor(Math.random() * teilnehmer.length)];
      setWinner(randomWinner);
      setTimeLeft(25); // Reset the timer after a spin
    }, 3000); // Dauer der Animation in Millisekunden
  };

  const fetchEinsatzValues = async () => {
    try {
      const response = await fetch("http://localhost:3001/einsatz-values");
      const data = await response.text();
      const values = data
        .split("\n")
        .map(Number)
        .filter((value) => !isNaN(value));
      const total = values.reduce((sum, value) => sum + value, 0);
      setJackpot(total);
    } catch (error) {
      console.error("Error fetching einsatz values:", error);
    }
  };

  useEffect(() => {
    fetchEinsatzValues();
    const intervalId = setInterval(fetchEinsatzValues, 2000);

    const countdownInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          handleSpin();
          return 25; // Reset the countdown timer
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(intervalId);
    };
  }, [teilnehmer]);

  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3FF33",
    "#FF33A1",
    "#33FFF3",
    "#FFB533",
    "#8D33FF",
    "#FF3389",
    "#33FFF7",
    "#33A1FF",
    "#FF3333",
    "#33FF99",
    "#FF5733",
    "#33FFCE",
    "#3375FF",
    "#FF3384",
    "#33FF75",
    "#9D33FF",
    "#FF9933",
  ];

  return (
    <div className="wheel-container">
      <div id="einsatz" className="center-label">
        <div className="label">Im Jackpot vorhanden</div>
        <div>{jackpot.toFixed(2)}</div>
      </div>
      <div className={`wheel ${isSpinning ? "spinning" : ""}`}>
        {teilnehmer.map((name, index) => {
          const angle = (360 / teilnehmer.length) * index;
          const color = colors[index % colors.length];
          return (
            <div
              key={index}
              className="segment"
              style={{
                transform: `rotate(${angle}deg)`,
                backgroundColor: color,
              }}
            >
              <span
                className="segment-name"
                style={{ transform: `rotate(-${angle}deg)` }}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="countdown-timer">
        Nächster Spin in: {timeLeft} Sekunden
      </div>
      {winner && <div className="winner">Gewinner: {winner}</div>}
    </div>
  );
};

export default SpinningWheel;
